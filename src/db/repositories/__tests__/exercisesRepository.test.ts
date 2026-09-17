import { createExercisesRepository } from '../exercisesRepository';
import { createTestDb } from '../testDb';

describe('ExercisesRepository', () => {
  it('inserta varios ejercicios de una y los lista', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);

    await repo.insertMany([
      { id: 'a', name: 'Push Up' },
      { id: 'b', name: 'Squat' },
    ]);

    const all = await repo.listAll();
    expect(all.map(e => e.name).sort()).toEqual(['Push Up', 'Squat']);
  });

  it('no rompe si insertMany recibe una lista vacía', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);

    await expect(repo.insertMany([])).resolves.toBeUndefined();
    expect(await repo.listAll()).toEqual([]);
  });

  it('getById devuelve el ejercicio correcto', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);
    await repo.insertMany([{ id: 'a', name: 'Push Up' }]);

    const found = await repo.getById('a');
    expect(found?.name).toBe('Push Up');
    expect(await repo.getById('no-existe')).toBeUndefined();
  });

  it('updateThumbnailLocalPath actualiza solo ese campo', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);
    await repo.insertMany([{ id: 'a', name: 'Push Up' }]);

    await repo.updateThumbnailLocalPath('a', '/local/a.jpg');

    const found = await repo.getById('a');
    expect(found?.thumbnailLocalPath).toBe('/local/a.jpg');
    expect(found?.name).toBe('Push Up');
  });

  it('insertOne crea un ejercicio individual y devuelve la fila creada', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);

    const created = await repo.insertOne({
      name: 'Flexiones diamante',
      isCustom: true,
    });

    expect(created.name).toBe('Flexiones diamante');
    expect(created.isCustom).toBe(true);
    expect(await repo.getById(created.id)).toMatchObject({
      name: 'Flexiones diamante',
    });
  });

  it('updateVideoLocalPath guarda path y fecha de cacheo', async () => {
    const db = createTestDb();
    const repo = createExercisesRepository(db);
    await repo.insertMany([{ id: 'a', name: 'Push Up' }]);

    await repo.updateVideoLocalPath(
      'a',
      '/local/a.mp4',
      '2026-09-16T00:00:00.000Z',
    );

    const found = await repo.getById('a');
    expect(found?.videoLocalPath).toBe('/local/a.mp4');
    expect(found?.videoCachedAt).toBe('2026-09-16T00:00:00.000Z');
  });
});
