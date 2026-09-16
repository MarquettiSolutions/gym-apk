import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Única tabla mutable in-place: representa preferencias actuales, no hechos
// históricos (default_rest_seconds, weight_unit, theme, etc.).
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
