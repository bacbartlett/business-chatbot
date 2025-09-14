'use client';

import { motion } from 'framer-motion';
import { memo, useEffect, useMemo, useState } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage } from '@/lib/types';
import { Suggestion } from './elements/suggestion';

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchPrompts = async () => {
      try {
        const res = await fetch('/api/suggested-prompts', {
          method: 'GET',
          headers: { 'content-type': 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data: Array<{ id: number | string; text: string }> = await res.json();
        if (!cancelled) {
          // Deduplicate on client as an extra guard
          const unique = Array.from(new Set(data.map((d) => d.text)));
          setSuggestedActions(unique.slice(0, 4));
        }
      } catch {}
    };
    fetchPrompts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-testid="suggested-actions" className="grid sm:grid-cols-2 gap-2 w-full">
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={suggestedAction}
          >
            <Suggestion
              suggestion={suggestedAction}
              onClick={(suggestion) => {
                window.history.replaceState({}, '', `/chat/${chatId}`);
                sendMessage({
                  role: 'user',
                  parts: [{ type: 'text', text: suggestion }],
                });
              }}
              className="text-left w-full h-auto whitespace-normal p-3"
            >
              {suggestedAction}
            </Suggestion>
          </motion.div>
        ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);
