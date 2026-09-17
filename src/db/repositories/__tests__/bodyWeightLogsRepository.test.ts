import { createBodyWeightLogsRepository } from '../bodyWeightLogsRepository';
import { createUsersRepository } from '../usersRepository';
import { createTestDb } from '../testDb';

async function setup() {
  const db = createTestDb();
  const repo = createBodyWeightLogsRepository(db);
  const usersRepo = createUsersRepository(db);
  const user = await usersRepo.getOrCreateLocalUser();
  return { repo, user };
}

describe('BodyWeightLogsRepository', () => {
  it('addLog es append-only: un nuevo registro no borra los anteriores', async () => {
    const { repo, user } = await setup();

    await repo.addLog({
      userId: user.id,
      weight: 80,
      loggedAt: '2026-01-01T00:00:00.000Z',
    });
    await repo.addLog({
      userId: user.id,
      weight: 79,
      loggedAt: '2026-02-01T00:00:00.000Z',
    });

    const logs = await repo.listByUser(user.id);
    expect(logs).toHaveLength(2);
  });

  it('listByUser devuelve los registros de más reciente a más antiguo', async () => {
    const { repo, user } = await setup();
    const older = await repo.addLog({
      userId: user.id,
      weight: 80,
      loggedAt: '2026-01-01T00:00:00.000Z',
    });
    const newer = await repo.addLog({
      userId: user.id,
      weight: 79,
      loggedAt: '2026-02-01T00:00:00.000Z',
    });

    const logs = await repo.listByUser(user.id);

    expect(logs.map(l => l.id)).toEqual([newer.id, older.id]);
  });

  it('deleteLog borra un registro puntual cargado por error', async () => {
    const { repo, user } = await setup();
    const log = await repo.addLog({ userId: user.id, weight: 80 });

    await repo.deleteLog(log.id);

    expect(await repo.listByUser(user.id)).toHaveLength(0);
  });
});
