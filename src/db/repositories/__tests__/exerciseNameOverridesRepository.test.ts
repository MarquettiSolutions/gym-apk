import { createExerciseNameOverridesRepository } from '../exerciseNameOverridesRepository';
import { createExercisesRepository } from '../exercisesRepository';
import { createTestDb } from '../testDb';

async function setup() {
  const db = createTestDb();
  await createExercisesRepository(db).insertMany([{ id: 'a', name: 'Squat' }]);
  return createExerciseNameOverridesRepository(db);
}

describe('ExerciseNameOverridesRepository', () => {
  it('guarda un override por idioma y lo reemplaza al repetir', async () => {
    const repo = await setup();
    await repo.upsert('a', 'es', 'Sentadilla');
    await repo.upsert('a', 'pt', 'Agachamento');
    await repo.upsert('a', 'es', 'Sentadilla libre');

    const rows = await repo.listAll();
    expect(rows.map(r => [r.language, r.name]).sort()).toEqual([
      ['es', 'Sentadilla libre'],
      ['pt', 'Agachamento'],
    ]);
  });

  it('remove borra solo el idioma indicado', async () => {
    const repo = await setup();
    await repo.upsert('a', 'es', 'Sentadilla');
    await repo.upsert('a', 'pt', 'Agachamento');
    await repo.remove('a', 'es');

    expect((await repo.listAll()).map(r => r.language)).toEqual(['pt']);
  });
});
