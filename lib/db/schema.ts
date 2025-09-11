import type { InferSelectModel } from 'drizzle-orm';
import {
  sqliteTable,
  text as sqliteText,
  integer,
  primaryKey,
  blob,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const user = sqliteTable('User', {
  id: sqliteText('id').primaryKey().notNull(),
  email: sqliteText('email').notNull(),
  password: sqliteText('password'),
});

export type User = InferSelectModel<typeof user>;

export const chat = sqliteTable('Chat', {
  id: sqliteText('id').primaryKey().notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  title: sqliteText('title').notNull(),
  userId: sqliteText('userId').notNull(),
  visibility: sqliteText('visibility')
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = sqliteTable('Message', {
  id: sqliteText('id').primaryKey().notNull(),
  chatId: sqliteText('chatId').notNull(),
  role: sqliteText('role').notNull(),
  content: sqliteText('content', { mode: 'json' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = sqliteTable('Message_v2', {
  id: sqliteText('id').primaryKey().notNull(),
  chatId: sqliteText('chatId').notNull(),
  role: sqliteText('role').notNull(),
  parts: sqliteText('parts', { mode: 'json' }).notNull(),
  attachments: sqliteText('attachments', { mode: 'json' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = sqliteTable(
  'Vote',
  {
    chatId: sqliteText('chatId').notNull(),
    messageId: sqliteText('messageId').notNull(),
    isUpvoted: integer('isUpvoted', { mode: 'boolean' }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = sqliteTable(
  'Vote_v2',
  {
    chatId: sqliteText('chatId').notNull(),
    messageId: sqliteText('messageId').notNull(),
    isUpvoted: integer('isUpvoted', { mode: 'boolean' }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = sqliteTable(
  'Document',
  {
    id: sqliteText('id').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    title: sqliteText('title').notNull(),
    content: sqliteText('content'),
    kind: sqliteText('text').notNull().default('text'),
    userId: sqliteText('userId').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = sqliteTable(
  'Suggestion',
  {
    id: sqliteText('id').notNull(),
    documentId: sqliteText('documentId').notNull(),
    documentCreatedAt: integer('documentCreatedAt', { mode: 'timestamp' })
      .notNull(),
    originalText: sqliteText('originalText').notNull(),
    suggestedText: sqliteText('suggestedText').notNull(),
    description: sqliteText('description'),
    isResolved: integer('isResolved', { mode: 'boolean' }).notNull().default(false),
    userId: sqliteText('userId').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = sqliteTable(
  'Stream',
  {
    id: sqliteText('id').notNull(),
    chatId: sqliteText('chatId').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

export const fileUpload = sqliteTable(
  'FileUpload',
  {
    id: sqliteText('id').primaryKey().notNull(),
    userId: sqliteText('userId').notNull(),
    filename: sqliteText('filename').notNull(),
    pathname: sqliteText('pathname').notNull(),
    url: sqliteText('url').notNull(),
    contentType: sqliteText('contentType'),
    size: integer('size'),
    data: blob('data', { mode: 'buffer' }),
    createdAt: integer('createdAt', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
);

export type FileUpload = InferSelectModel<typeof fileUpload>;

export const masterPrompt = sqliteTable('MasterPrompt', {
  userId: sqliteText('userId').primaryKey().notNull(),
  masterPrompt: sqliteText('masterPrompt'),
});

export type MasterPrompt = InferSelectModel<typeof masterPrompt>;
