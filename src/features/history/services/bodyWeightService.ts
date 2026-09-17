import type { Repositories } from '../../../db/repositories';
import { nowIso } from '../../../shared/utils/dates';
import type { BodyWeightLog, BodyWeightRangeFilter } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Filtro puro sobre una lista ya cargada (spec 5.5: "filtro por rango de
// fechas — última semana/mes/todo"), sin volver a golpear la DB por cambio
// de filtro.
export function filterLogsByRange(
  logs: BodyWeightLog[],
  filter: BodyWeightRangeFilter,
): BodyWeightLog[] {
  if (filter === 'all') {
    return logs;
  }
  const days = filter === 'week' ? 7 : 30;
  const threshold = Date.now() - days * MS_PER_DAY;
  return logs.filter(log => new Date(log.loggedAt).getTime() >= threshold);
}

export function createBodyWeightService(repositories: Repositories) {
  return {
    listLogs: (userId: string) =>
      repositories.bodyWeightLogs.listByUser(userId),
    addLog: (
      userId: string,
      weight: number,
      weightUnit: string,
      loggedAt?: string,
    ) =>
      repositories.bodyWeightLogs.addLog({
        userId,
        weight,
        weightUnit,
        loggedAt: loggedAt ?? nowIso(),
      }),
    deleteLog: (id: string) => repositories.bodyWeightLogs.deleteLog(id),
  };
}

export type BodyWeightService = ReturnType<typeof createBodyWeightService>;
