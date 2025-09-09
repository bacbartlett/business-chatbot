export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Default (GPT-4o)',
    description: 'Default chat model using OpenAI GPT-4o with tool support',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Claude 3.7 Sonnet (Reasoning)',
    description: 'Reasoning-focused Claude 3.7 Sonnet',
  },
  {
    id: 'model-claude-sonnet',
    name: 'Claude 3.7 Sonnet',
    description: 'Fast, strong general-purpose Anthropic model',
  },
  {
    id: 'model-gemini-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google Gemini 2.0 Flash (fast, low latency)',
  },
  {
    id: 'model-gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI GPT-4o general-purpose',
  },
  {
    id: 'model-o3-mini',
    name: 'OpenAI o3-mini (Reasoning)',
    description: 'Reasoning-optimized OpenAI model',
  },
  {
    id: 'model-llama-70b',
    name: 'Llama 3.1 70B Instruct',
    description: 'Meta Llama 3.1 70B instruction-tuned',
  },
  {
    id: 'model-auto',
    name: 'OpenRouter Auto',
    description: 'Auto-router across top providers',
  },
];
