import { z } from 'zod';
import { tool } from 'ai';
import { getExaClient } from './exa-client';

export const exaCrawl = tool({
  description:
    'Fetch contents for URLs or Exa results using Exa. Use only when answer/search are insufficient.',
  inputSchema: z.object({
    urls: z.array(z.string().url()).optional(),
    // When provided with previous search results, you can pass them through to fetch contents.
    results: z
      .array(
        z.object({
          url: z.string().url(),
          id: z.string().optional(),
          title: z.string().optional(),
        }),
      )
      .optional(),
    text: z
      .union([z.boolean(), z.object({ maxCharacters: z.number().int().positive().max(10000) })])
      .optional(),
  }),
  execute: async ({ urls, results, text }) => {
    const exa = getExaClient();
    if (!exa) {
      return { error: 'EXA_API_KEY not configured' };
    }
    const input = urls && urls.length > 0 ? urls : results ?? [];
    const res = await exa.getContents(input as any, typeof text === 'undefined' ? undefined : { text: text as any });
    console.log('[exaCrawl] response:', res);
    return res;
  },
});


