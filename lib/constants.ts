import { generateDummyPassword } from './db/utils';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const DEFAULT_SUGGESTED_PROMPTS: ReadonlyArray<string> = [
  'What are the advantages of using Next.js?',
  "Write code to demonstrate Dijkstra's algorithm",
  'Help me write an essay about Silicon Valley',
  'What is the weather in San Francisco?',
];
