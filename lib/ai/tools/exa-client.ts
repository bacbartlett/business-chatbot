import Exa from 'exa-js';

let exaSingleton: Exa | null = null;

export function getExaClient(): Exa | null {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    console.warn('[Exa] Missing EXA_API_KEY; web search tools will be disabled');
    return null;
  }
  if (exaSingleton) return exaSingleton;
  try {
    exaSingleton = new Exa(apiKey);
    console.log('[Exa] Client created');
  } catch (err) {
    console.error('[Exa] Failed to create client', err);
    return null;
  }
  return exaSingleton;
}


