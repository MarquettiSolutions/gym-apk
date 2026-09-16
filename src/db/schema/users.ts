import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { uuid } from '../../shared/utils/id';
import { nowIso } from '../../shared/utils/dates';

// v1: un único registro "usuario local" (sin login).
// Se mantiene como tabla real desde el día 1 para no tener que migrar
// user_id retroactivamente el día que exista un servidor multiusuario.
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(uuid),
  displayName: text('display_name').notNull().default('Usuario local'),
  createdAt: text('created_at').notNull().$defaultFn(nowIso),
  updatedAt: text('updated_at').notNull().$defaultFn(nowIso),
});
