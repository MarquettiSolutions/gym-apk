import { createRepositories } from '../../../../db/repositories';
import { createTestDb } from '../../../../db/repositories/testDb';
import {
  createBodyWeightService,
  filterLogsByRange,
} from '../bodyWeightService';
import type { BodyWeightLog } from '../../types';

async function setup() {
  const db = createTestDb();
  const repositories = createRepositories(db);
  const service = createBodyWeightService(repositories);
  const user = await repositories.users.getOrCreateLocalUser();
  return { service, user };
}

function logAt(daysAgo: number): BodyWeightLog {
  const loggedAt = new Date(
    Date.now() - daysAgo * 24 * 60 * 60 * 1000,
  ).toISOString();
  return {
    id: `log-${daysAgo}`,
    userId: 'user-1',
    weight: 80,
    weightUnit: 'kg',
    loggedAt,
    createdAt: loggedAt,
  };
}

describe('bodyWeightService', () => {
  it('addLog guarda un registro nuevo sin tocar los anteriores (append-only)', async () => {
    const { service, user } = await setup();

    await service.addLog(user.id, 80, 'kg');
    await service.addLog(user.id, 79.5, 'kg');

    const logs = await service.listLogs(user.id);
    expect(logs).toHaveLength(2);
  });

  it('deleteLog borra solo el registro indicado', async () => {
    const { service, user } = await setup();
    await service.addLog(user.id, 80, 'kg');
    const toDelete = await service.addLog(user.id, 79.5, 'kg');

    await service.deleteLog(toDelete.id);

    const logs = await service.listLogs(user.id);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.weight).toBe(80);
  });
});

describe('filterLogsByRange', () => {
  const logs = [logAt(0), logAt(10), logAt(40)];

  it('"week" deja solo los registros de los últimos 7 días', () => {
    expect(filterLogsByRange(logs, 'week')).toEqual([logs[0]]);
  });

  it('"month" deja los registros de los últimos 30 días', () => {
    expect(filterLogsByRange(logs, 'month')).toEqual([logs[0], logs[1]]);
  });

  it('"all" devuelve todos los registros sin filtrar', () => {
    expect(filterLogsByRange(logs, 'all')).toEqual(logs);
  });
});
