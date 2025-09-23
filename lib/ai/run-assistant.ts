import type { CoreMessage } from 'ai';
import { generateText } from 'ai';
import type { ChatModel } from '@/lib/ai/models';
import { myProvider } from '@/lib/ai/providers';
import { systemPrompt, type RequestHints } from '@/lib/ai/prompts';

/**
 * Regex to strip any internal scratchpad section the model may emit.
 * The scratchpad is for meta-reasoning and MUST NOT be shown or persisted.
 *
 * Matches the first occurrence and all subsequent occurrences of:
 * [SCRATCHPAD] ... [/SCRATCHPAD]
 * across newlines, non-greedy to avoid eating unrelated content.
 */
const SCRATCHPAD_REGEX = /\[SCRATCHPAD\][\s\S]*?\[\/SCRATCHPAD\]\s*/gi;

// Capture-only version to extract scratchpad contents for debug logging.
const SCRATCHPAD_CAPTURE_REGEX = /\[SCRATCHPAD\]([\s\S]*?)\[\/SCRATCHPAD\]/gi;

// Extra formatting directive to force the model to surface the scratchpad
// block at the top of the raw output. The server will strip it before use.
const SYSTEM_SCRATCHPAD_OUTPUT_POLICY = `
Output formatting:
- First, emit a [SCRATCHPAD]...[/SCRATCHPAD] block with your meta-reasoning about style and pacing.
- Then, emit the user-visible answer.
- Do not reference the scratchpad in the visible answer.`;

/**
 * Remove all scratchpad sections from model output safely.
 */
export function stripScratchpad(text: string): string {
  if (!text) return text;
  return text.replace(SCRATCHPAD_REGEX, '').trimStart();
}

/**
 * Extract one or more scratchpad blocks from a model output.
 * Returns an empty array if none are present.
 */
export function extractScratchpads(text: string): string[] {
  if (!text) return [];
  const pads: string[] = [];
  let match: RegExpExecArray | null;
  // Reset lastIndex in case regex was used elsewhere
  SCRATCHPAD_CAPTURE_REGEX.lastIndex = 0;
  while ((match = SCRATCHPAD_CAPTURE_REGEX.exec(text)) !== null) {
    // match[1] is the inner content between the tags
    pads.push((match[1] ?? '').trim());
  }
  return pads;
}

export interface RunAssistantParams {
  /** Messages from the user and history (without any scratchpad content). */
  messages: CoreMessage[];
  /** Selected chat model id; defaults to the project's primary chat model. */
  selectedChatModel?: ChatModel['id'];
  /** Optional master prompt supplied by the user to further steer the system prompt. */
  masterPrompt?: string | null;
  /** Geolocation-derived hints for the request. */
  requestHints: RequestHints;
}

export interface RunAssistantResult {
  /** The sanitized text, with any scratchpad removed. */
  text: string;
}

/**
 * runAssistant
 *
 * Helper that composes the system prompt (which instructs the model to create
 * a hidden [SCRATCHPAD] section for meta-reasoning), calls the model using the
 * Vercel AI SDK, then strips the scratchpad before returning the final text.
 *
 * IMPORTANT:
 * - Do not surface the raw model text (which may include [SCRATCHPAD]). Always
 *   pass the sanitized `text` to the UI and to any persistence layers.
 */
export async function runAssistant({
  messages,
  selectedChatModel = 'chat-model',
  masterPrompt = null,
  requestHints,
}: RunAssistantParams): Promise<RunAssistantResult> {
  const model = myProvider.languageModel(selectedChatModel);

  // Compose the full system instructions (business assistant style + scratchpad policy)
  const system = systemPrompt({
    selectedChatModel,
    requestHints,
    masterPrompt,
  });

  const systemWithScratchpadOutput = `${system}\n\n${SYSTEM_SCRATCHPAD_OUTPUT_POLICY}`;

  // Invoke the model non-streaming. If you need streaming, create a token-level
  // transform that suppresses scratchpad tokens before emission.
  const { text: raw } = await generateText({
    model,
    system: systemWithScratchpadOutput,
    messages,
  });

  // For testing/diagnostics: log any scratchpad content on the server only.
  // Never expose this to end users. Guarded to avoid logging in production.
  const scratchpads = extractScratchpads(raw ?? '');
  if (scratchpads.length > 0 && process.env.NODE_ENV !== 'production') {
    console.log('[Assistant Scratchpad]', {
      count: scratchpads.length,
      scratchpads,
    });
  }

  const text = stripScratchpad(raw ?? '');

  return { text };
}


