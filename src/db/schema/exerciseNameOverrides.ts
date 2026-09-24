import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { nowIso } from '../../shared/utils/dates';
import { exercises } from './exercises';

// Nombre editado por el usuario para un ejercicio del catálogo, uno por
// idioma. No se toca `exercises.name`: es la clave del diccionario de
// traducciones y del backfill de video.
export const exerciseNameOverrides = sqliteTable(
  'exercise_name_overrides',
  {
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    language: text('language').notNull(),
    name: text('name').notNull(),
    updatedAt: text('updated_at').notNull().$defaultFn(nowIso),
  },
  table => [primaryKey({ columns: [table.exerciseId, table.language] })],
);
