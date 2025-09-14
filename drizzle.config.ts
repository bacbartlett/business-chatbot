import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({
  path: '.env.local',
});

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'turso',
  dbCredentials: {
    // Validate at config time to avoid non-null assertions
    url: (() => {
      const databaseUrl = process.env.TURSO_DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('TURSO_DATABASE_URL is not defined');
      }
      return databaseUrl;
    })(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
