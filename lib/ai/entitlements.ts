import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning', 'model-claude-sonnet', 'model-gemini-flash', 'model-gpt-4o'],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning', 'model-claude-sonnet', 'model-gemini-flash', 'model-gpt-4o', 'model-o3-mini', 'model-llama-70b', 'model-auto'],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
