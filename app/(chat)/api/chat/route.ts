import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { auth } from '@clerk/nextjs/server';
import type { UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  getMasterPromptByUserId,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/visibility-selector';

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      if (!process.env.REDIS_URL) {
        return null;
      }
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      return null;
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const { userId } = await auth();

    if (!userId) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }
    const userType: UserType = 'regular';

    const messageCount = await getMessageCountByUserId({
      id: userId,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== userId) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    // Transform file parts for provider compatibility:
    // - images: leave as URL
    // - PDFs: convert to data URL (or use plugin when enabled)
    // - text/plain, text/csv, application/json: inline as text content
    // - others (docx/xlsx/etc.): fallback to a text note with link
    async function transformFilePart(p: any): Promise<any> {
      const mediaType: string = p.mediaType ?? '';
      const url: string = p.url ?? '';
      const name: string = p.name ?? 'file';

      if (mediaType.startsWith('image/')) {
        return p;
      }

      if (mediaType === 'application/pdf') {
        try {
          const res = await fetch(url);
          if (!res.ok) return p;
          const arrayBuffer = await res.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return { ...p, url: `data:${mediaType};base64,${base64}` };
        } catch {
          return p;
        }
      }

      const isTextLike =
        mediaType === 'text/plain' ||
        mediaType === 'text/csv' ||
        mediaType === 'application/json';

      if (isTextLike) {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            return { type: 'text', text: `Attached file: ${name} (${mediaType}) at ${url}` };
          }
          const text = await res.text();
          const truncated = text.length > 200_000 ? text.slice(0, 200_000) + '\n...[truncated]...' : text;
          const fence = mediaType === 'text/csv' ? 'csv' : mediaType === 'application/json' ? 'json' : '';
          const body = fence ? `\n\n\`\`\`${fence}\n${truncated}\n\`\`\`` : `\n\n${truncated}`;
          return { type: 'text', text: `File: ${name}${body}` };
        } catch {
          return { type: 'text', text: `Attached file: ${name} (${mediaType}) at ${url}` };
        }
      }

      // Fallback for unsupported types
      return { type: 'text', text: `Attached file: ${name} (${mediaType}) at ${url}` };
    }

    const uiMessagesForProvider = await Promise.all(
      uiMessages.map(async (m) => ({
        ...m,
        parts: await Promise.all(
          m.parts.map(async (p: any) => {
            if (p?.type === 'file' && typeof p.url === 'string' && p.mediaType) {
              return await transformFilePart(p);
            }
            return p;
          }),
        ),
      })),
    );

    const includesPdf = uiMessagesForProvider.some((m: any) =>
      Array.isArray(m.parts) && m.parts.some((p: any) => p?.type === 'file' && p.mediaType === 'application/pdf'),
    );
    const pdfEngine = process.env.OPENROUTER_PDF_ENGINE ?? 'pdf-text';
    const enableFileParser = process.env.OPENROUTER_FILE_PARSER === 'true';
    const providerOptions = includesPdf && enableFileParser
      ? {
          openrouter: {
            plugins: [
              {
                id: 'file-parser',
                pdf: {
                  engine: pdfEngine,
                },
              },
            ],
          },
        }
      : undefined;

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const master = await getMasterPromptByUserId({ userId });

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, requestHints, masterPrompt: master?.masterPrompt ?? null }),
          messages: convertToModelMessages(uiMessagesForProvider),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          providerOptions,
          tools: {
            getWeather,
            createDocument: createDocument({ session: { user: { id: userId } } as any, dataStream }),
            updateDocument: updateDocument({ session: { user: { id: userId } } as any, dataStream }),
            requestSuggestions: requestSuggestions({
              session: { user: { id: userId } } as any,
              dataStream,
            }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error('Unhandled error in chat API:', error);
    return new ChatSDKError('offline:chat').toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const { userId } = await auth();

  if (!userId) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== userId) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
