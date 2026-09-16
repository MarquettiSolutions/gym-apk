import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { uuid } from '../../shared/utils/id';
import { nowIso } from '../../shared/utils/dates';
import { users } from './users';
import { planDays } from './planDays';

// Registro histórico: no se edita después de finalizada, solo se crea.
export const workoutSessions = sqliteTable('workout_sessions', {
  id: text('id').primaryKey().$defaultFn(uuid),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  // Nullable: la sesión sobrevive aunque más adelante se borre el plan/día de origen.
  planDayId: text('plan_day_id').references(() => planDays.id),
  startedAt: text('started_at').notNull().$defaultFn(nowIso),
  finishedAt: text('finished_at'),
  status: text('status').notNull().default('in_progress'), // in_progress | completed | skipped
  createdAt: text('created_at').notNull().$defaultFn(nowIso),
});
