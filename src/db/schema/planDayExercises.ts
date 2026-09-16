import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { uuid } from '../../shared/utils/id';
import { nowIso } from '../../shared/utils/dates';
import { planDays } from './planDays';
import { exercises } from './exercises';

export const planDayExercises = sqliteTable('plan_day_exercises', {
  id: text('id').primaryKey().$defaultFn(uuid),
  planDayId: text('plan_day_id')
    .notNull()
    .references(() => planDays.id),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => exercises.id),
  orderIndex: integer('order_index').notNull().default(0),
  targetSets: integer('target_sets').notNull(),
  targetReps: integer('target_reps').notNull(),
  targetWeight: real('target_weight'),
  restSeconds: integer('rest_seconds').notNull().default(30),
  notes: text('notes'),
  createdAt: text('created_at').notNull().$defaultFn(nowIso),
  updatedAt: text('updated_at').notNull().$defaultFn(nowIso),
});
