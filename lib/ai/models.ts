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
    id: 'model-gpt-5',
    name: 'GPT-5',
    description: 'OpenAI GPT-5 general-purpose',
  },
  {
    id: 'model-claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Anthropic Claude Sonnet 4',
  },
  {
    id: 'model-gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Google Gemini 2.5 Flash (fast, low latency)',
  },
];
