import { env } from './env';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/server/db/schema',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: env.TURSO_DATABASE_URL!,
    authToken: env.TURSO_AUTH_TOKEN!,
  },
});
