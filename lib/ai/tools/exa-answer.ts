import { z } from 'zod';
import { tool } from 'ai';
import { getExaClient } from './exa-client';

export const exaAnswer = tool({
  description:
    'Get a direct, sourced answer to a question using Exa. Falls back to search+crawl when the answer appears unsuccessful.',
  inputSchema: z.object({
    query: z.string().describe('Natural language question to answer'),
    includeText: z
      .boolean()
      .optional()
      .default(false)
      .describe('Include extracted text for sources when true'),
  }),
  execute: async ({ query, includeText }) => {
    const exa = getExaClient();
    if (!exa) {
      return { error: 'EXA_API_KEY not configured' };
    }
    try {
      console.log('[exaAnswer] request:', { query, includeText: !!includeText });
      const res = await exa.answer(query, { text: !!includeText });
      console.log('[exaAnswer] response:', res);

      // Heuristic reflection to detect when Exa Answers could not find a good answer
      const extractAnswerText = (r: any): string => {
        if (!r) return '';
        if (typeof r === 'string') return r;
        return (
          r.answer ??
          r.result ??
          r.output ??
          r.text ??
          (Array.isArray(r) ? r.join(' ') : '') ??
          ''
        );
      };

      const answerText = String(extractAnswerText(res) || '').trim();
      const numSources = Array.isArray((res as any)?.sources)
        ? (res as any).sources.length
        : Array.isArray((res as any)?.results)
          ? (res as any).results.length
          : 0;

      const looksLikeFailure = (text: string): boolean => {
        if (!text) return true;
        const lowered = text.toLowerCase();
        const negativeSignals = [
          "i'm sorry",
          'i am sorry',
          'unable to find',
          "couldn't find",
          'could not find',
          'no relevant',
          'no results',
          'not able to locate',
          'insufficient information',
          'cannot answer',
          'unable to answer',
        ];
        if (negativeSignals.some((s) => lowered.includes(s))) return true;
        if (text.length < 20 && numSources === 0) return true;
        return false;
      };

      if (!looksLikeFailure(answerText)) {
        return { ...res, usedFallback: false };
      }

      // Fallback: perform search + crawl to fetch relevant content
      const searchResults = await exa.search(query, { numResults: 5 });
      console.log('[exaAnswer][fallback][search] response:', searchResults);

      let contents: any = null;
      try {
        const crawlInput = Array.isArray((searchResults as any)?.results)
          ? (searchResults as any).results
          : searchResults;
        contents = await exa.getContents(crawlInput as any, { text: { maxCharacters: 8000 } });
        console.log('[exaAnswer][fallback][crawl] response:', contents);
      } catch (crawlErr) {
        console.warn('[exaAnswer][fallback][crawl] error:', crawlErr);
      }

      return {
        ...res,
        usedFallback: true,
        fallback: {
          search: searchResults,
          contents,
        },
      };
    } catch (error) {
      const message = (error as any)?.message || String(error);
      const status = ((error as any)?.response && (((error as any).response.status || (error as any).response.statusCode))) || undefined;
      console.warn('[exaAnswer] error:', { message, status });
      // As a last resort, try the fallback path directly if answer failed
      try {
        console.log('[exaAnswer][fallback-after-error] attempting search+crawl');
        const searchResults = await exa.search(query, { numResults: 5 });
        let contents: any = null;
        try {
          const crawlInput = Array.isArray((searchResults as any)?.results)
            ? (searchResults as any).results
            : searchResults;
          contents = await exa.getContents(crawlInput as any, { text: { maxCharacters: 8000 } });
        } catch (crawlErr) {
          console.warn('[exaAnswer][fallback-after-error][crawl] error:', crawlErr);
        }
        return {
          error: 'exaAnswer failed; provided fallback search+crawl results',
          usedFallback: true,
          fallback: {
            search: searchResults,
            contents,
          },
        };
      } catch (fallbackError) {
        console.warn('[exaAnswer][fallback-after-error] error:', fallbackError);
        const fMessage = (fallbackError as any)?.message || String(fallbackError);
        const fStatus = ((fallbackError as any)?.response && (((fallbackError as any).response.status || (fallbackError as any).response.statusCode))) || undefined;
        return { error: 'Exa operations failed', message: fMessage, status: fStatus } as any;
      }
    }
  },
});


