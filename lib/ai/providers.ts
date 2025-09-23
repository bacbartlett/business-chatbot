import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Configure a dedicated OpenRouter client with API key and attribution headers
const openrouterClient = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
    'X-Title': process.env.OPENROUTER_APP_NAME || 'Business Chatbot',
  },
});

// Log OpenRouter client configuration (without exposing secrets)
console.log('[OpenRouter] Client initialized', {
  hasApiKey: Boolean(process.env.OPENROUTER_API_KEY),
  siteUrl: process.env.OPENROUTER_SITE_URL || null,
  appName: process.env.OPENROUTER_APP_NAME || null,
});

// Toggle between test models and OpenRouter via env to avoid constant conditions
const useTestModels = process.env.USE_TEST_MODELS === 'true';

export const myProvider = useTestModels
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Use OpenRouter models; adjust slugs as desired
        // Default chat model should support tools
        'chat-model': openrouterClient('x-ai/grok-4-fast:free'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openrouterClient('anthropic/claude-3.7-sonnet:thinking'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openrouterClient('openai/gpt-4o-mini'),
        'artifact-model': openrouterClient('openai/gpt-4o-mini'),

        // Additional selectable models (restricted set)
        'model-gpt-5': openrouterClient('openai/gpt-5'),
        'model-claude-sonnet-4': openrouterClient('anthropic/claude-sonnet-4'),
        'model-gemini-2-5-flash': openrouterClient('google/gemini-2.5-flash'),
      },
    });
