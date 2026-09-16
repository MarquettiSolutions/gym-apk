import { defineConfig } from 'drizzle-kit';

// driver: 'expo' genera migraciones embebibles (un migrations.js importable
// desde el bundle JS), necesario porque op-sqlite tampoco tiene acceso al
// filesystem del proyecto en runtime — mismo mecanismo que usa Expo SQLite.
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
});
