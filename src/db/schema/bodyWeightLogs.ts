import { sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';
import { uuid } from '../../shared/utils/id';
import { nowIso } from '../../shared/utils/dates';
import { users } from './users';

// APPEND-ONLY: cada pesaje nuevo es una fila nueva; el peso "actual" es la fila
// con loggedAt más reciente. El historial nunca se sobrescribe, solo se puede
// borrar un registro puntual por error de carga (acción explícita del usuario).
export const bodyWeightLogs = sqliteTable(
  'body_weight_logs',
  {
    id: text('id').primaryKey().$defaultFn(uuid),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    weight: real('weight').notNull(),
    weightUnit: text('weight_unit').notNull().default('kg'),
    loggedAt: text('logged_at').notNull().$defaultFn(nowIso),
    createdAt: text('created_at').notNull().$defaultFn(nowIso),
  },
  table => ({
    userLoggedIdx: index('body_weight_logs_user_logged_idx').on(
      table.userId,
      table.loggedAt,
    ),
  }),
);
