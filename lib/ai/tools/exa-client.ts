import Exa from 'exa-js';

let exaSingleton: Exa | null = null;

export function getExaClient(): Exa | null {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return null;
  if (exaSingleton) return exaSingleton;
  exaSingleton = new Exa(apiKey);
  return exaSingleton;
}


