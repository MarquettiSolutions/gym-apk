import { desc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { bodyWeightLogs } from '../schema';
import { assertDefined } from '../../shared/utils/assert';

// APPEND-ONLY (ver spec 5.5): no expone `update`. `delete` sí está permitido,
// pero solo para borrar un registro puntual cargado por error — nunca para
// "editar en el lugar" un valor histórico.
export interface BodyWeightLogsRepository {
  listByUser(
    userId: string,
  ): Promise<Array<typeof bodyWeightLogs.$inferSelect>>;
  addLog(
    values: typeof bodyWeightLogs.$inferInsert,
  ): Promise<typeof bodyWeightLogs.$inferSelect>;
  deleteLog(id: string): Promise<void>;
}

export function createBodyWeightLogsRepository(
  db: AppDatabase,
): BodyWeightLogsRepository {
  return {
    async listByUser(userId) {
      return db
        .select()
        .from(bodyWeightLogs)
        .where(eq(bodyWeightLogs.userId, userId))
        .orderBy(desc(bodyWeightLogs.loggedAt));
    },
    async addLog(values) {
      const [created] = await db
        .insert(bodyWeightLogs)
        .values(values)
        .returning();
      return assertDefined(created, 'No se pudo crear el registro de peso');
    },
    async deleteLog(id) {
      await db.delete(bodyWeightLogs).where(eq(bodyWeightLogs.id, id));
    },
  };
}
