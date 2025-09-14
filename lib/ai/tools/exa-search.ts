import { z } from 'zod';
import { tool } from 'ai';
import { getExaClient } from './exa-client';

export const exaSearch = tool({
  description:
    'Search the web with Exa. Use only if exaAnswer cannot provide sufficient information.',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    numResults: z.number().int().positive().max(25).optional(),
    includeDomains: z.array(z.string()).optional(),
    startPublishedDate: z.string().optional(),
    endPublishedDate: z.string().optional(),
  }),
  execute: async ({ query, numResults, includeDomains, startPublishedDate, endPublishedDate }) => {
    const exa = getExaClient();
    if (!exa) {
      return { error: 'EXA_API_KEY not configured' };
    }
    const res = await exa.search(query, {
      numResults,
      includeDomains,
      startPublishedDate,
      endPublishedDate,
    });
    console.log('[exaSearch] response:', res);
    return res;
  },
});


