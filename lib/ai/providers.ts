import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openrouter, createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

export const myProvider = isTestEnvironment
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
        'chat-model': openrouter('openai/gpt-4o'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openrouter('anthropic/claude-3.7-sonnet:thinking'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openrouter('openai/gpt-4o-mini'),
        'artifact-model': openrouter('openai/gpt-4o-mini'),

        // Additional selectable models
        'model-claude-sonnet': openrouter('anthropic/claude-3.7-sonnet'),
        'model-gemini-flash': openrouter('google/gemini-2.0-flash-001'),
        'model-gpt-4o': openrouter('openai/gpt-4o'),
        'model-llama-70b': openrouter('meta-llama/llama-3.1-70b-instruct'),
        // Reasoning alternative from OpenAI (ensure availability if selected in UI)
        'model-o3-mini': openrouter('openai/o3-mini'),
        // Auto router as a catch-all (may not support tools in all cases)
        'model-auto': openrouter('openrouter/auto'),
      },
    });
