import { auth, currentUser } from '@clerk/nextjs/server';
import { getChatById, getVotesByChatId, voteMessage } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter chatId is required.',
    ).toResponse();
  }

  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return new ChatSDKError('unauthorized:vote').toResponse();
  }
  const user = await currentUser();
  const email = user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user?.emailAddresses?.[0]?.emailAddress
    ?? null;
  const name = user ? ([user.firstName, user.lastName].filter(Boolean).join(' ') || (user as any).fullName || user.username || null) : null;
  const { ensureUserExists } = await import('@/lib/db/queries');
  await ensureUserExists({ id: userId, email, name });

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (chat.userId !== userId) {
    return new ChatSDKError('forbidden:vote').toResponse();
  }

  const votes = await getVotesByChatId({ id: chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameters chatId, messageId, and type are required.',
    ).toResponse();
  }

  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return new ChatSDKError('unauthorized:vote').toResponse();
  }
  const user = await currentUser();
  const email = user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
    ?? user?.emailAddresses?.[0]?.emailAddress
    ?? null;
  const name = user ? ([user.firstName, user.lastName].filter(Boolean).join(' ') || (user as any).fullName || user.username || null) : null;
  const { ensureUserExists } = await import('@/lib/db/queries');
  await ensureUserExists({ id: userId, email, name });

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new ChatSDKError('not_found:vote').toResponse();
  }

  if (chat.userId !== userId) {
    return new ChatSDKError('forbidden:vote').toResponse();
  }

  await voteMessage({
    chatId,
    messageId,
    type: type,
  });

  return new Response('Message voted', { status: 200 });
}
