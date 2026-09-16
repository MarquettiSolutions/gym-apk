import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from 'drizzle-orm/sqlite-core';
import { uuid } from '../../shared/utils/id';
import { nowIso } from '../../shared/utils/dates';
import { workoutSessions } from './workoutSessions';
import { planDayExercises } from './planDayExercises';
import { exercises } from './exercises';

// APPEND-ONLY: cada serie ejecutada es una fila nueva e inmutable. La evolución
// del peso usado en un ejercicio se consulta filtrando por exerciseId y
// ordenando por completedAt — nunca se sobrescribe una fila anterior.
export const workoutSessionSets = sqliteTable(
  'workout_session_sets',
  {
    id: text('id').primaryKey().$defaultFn(uuid),
    sessionId: text('session_id')
      .notNull()
      .references(() => workoutSessions.id),
    planDayExerciseId: text('plan_day_exercise_id').references(
      () => planDayExercises.id,
    ),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    setNumber: integer('set_number').notNull(),
    repsDone: integer('reps_done'),
    weightDone: real('weight_done'),
    weightUnit: text('weight_unit').notNull().default('kg'),
    completedAt: text('completed_at'),
    skipped: integer('skipped', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull().$defaultFn(nowIso),
  },
  table => ({
    exerciseCompletedIdx: index(
      'workout_session_sets_exercise_completed_idx',
    ).on(table.exerciseId, table.completedAt),
  }),
);
