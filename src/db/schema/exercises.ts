import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { uuid } from '../../shared/utils/id';
import { nowIso } from '../../shared/utils/dates';
import { users } from './users';

export const exercises = sqliteTable('exercises', {
  id: text('id').primaryKey().$defaultFn(uuid),
  name: text('name').notNull(),
  muscleGroup: text('muscle_group'),
  equipment: text('equipment'),
  instructions: text('instructions'),
  // Miniatura: se descarga y cachea al importar el catálogo (siempre disponible offline).
  thumbnailRemoteUrl: text('thumbnail_remote_url'),
  thumbnailLocalPath: text('thumbnail_local_path'),
  // Video: se descarga bajo demanda la primera vez que se abre el detalle.
  videoSource: text('video_source'),
  videoRemoteUrl: text('video_remote_url'),
  videoLocalPath: text('video_local_path'),
  videoCachedAt: text('video_cached_at'),
  isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
  createdByUserId: text('created_by_user_id').references(() => users.id),
  createdAt: text('created_at').notNull().$defaultFn(nowIso),
  updatedAt: text('updated_at').notNull().$defaultFn(nowIso),
});
