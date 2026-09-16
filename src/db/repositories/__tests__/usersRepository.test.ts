import { createUsersRepository } from '../usersRepository';
import { createTestDb } from '../testDb';

describe('UsersRepository', () => {
  it('crea el usuario local si no existe', async () => {
    const db = createTestDb();
    const repo = createUsersRepository(db);

    const user = await repo.getOrCreateLocalUser();

    expect(user.id).toBeDefined();
    expect(user.displayName).toBe('Usuario local');
  });

  it('es idempotente: no duplica el usuario local en llamadas sucesivas', async () => {
    const db = createTestDb();
    const repo = createUsersRepository(db);

    const first = await repo.getOrCreateLocalUser();
    const second = await repo.getOrCreateLocalUser();

    expect(second.id).toBe(first.id);
  });
});
