import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { uuid } from '../../shared/utils/id';
import { nowIso } from '../../shared/utils/dates';
import { plans } from './plans';

export const planDays = sqliteTable('plan_days', {
  id: text('id').primaryKey().$defaultFn(uuid),
  planId: text('plan_id')
    .notNull()
    .references(() => plans.id),
  weekday: integer('weekday').notNull(), // 0-6
  label: text('label'),
  createdAt: text('created_at').notNull().$defaultFn(nowIso),
  updatedAt: text('updated_at').notNull().$defaultFn(nowIso),
});
