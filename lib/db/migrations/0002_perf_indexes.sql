-- Hot-path indexes for Chat, Message_v2, Vote_v2, Suggestion, Stream
-- Safe to run multiple times with IF NOT EXISTS

-- Chats by user and creation time (history listing, pagination)
CREATE INDEX IF NOT EXISTS idx_chat_user_createdAt ON Chat (userId, createdAt DESC);

-- Messages by chat and creation time (chat rendering)
CREATE INDEX IF NOT EXISTS idx_message_chat_createdAt ON Message_v2 (chatId, createdAt ASC);

-- Votes by chat and message (lookup by chat and message)
CREATE INDEX IF NOT EXISTS idx_vote_chat_message ON Vote_v2 (chatId, messageId);

-- Suggestions by document (tool result rendering)
CREATE INDEX IF NOT EXISTS idx_suggestion_document ON Suggestion (documentId, documentCreatedAt DESC);

-- Streams by chat (resumable streams)
CREATE INDEX IF NOT EXISTS idx_stream_chat_createdAt ON Stream (chatId, createdAt ASC);

