import { backfillExerciseVideoUrlsIfNeeded } from '../videoUrlBackfill';
import { createTestDb } from '../../db/repositories/testDb';
import { createExercisesRepository } from '../../db/repositories/exercisesRepository';
import { createSettingsRepository } from '../../db/repositories/settingsRepository';
import type { ExerciseDbEntry } from '../exerciseDbSource';

function buildRepos() {
  const db = createTestDb();
  return {
    exercises: createExercisesRepository(db),
    settings: createSettingsRepository(db),
  };
}

const sampleRemoteEntries: ExerciseDbEntry[] = [
  {
    id: '0001',
    name: '3/4 Sit-Up',
    bodyPart: 'waist',
    target: 'abs',
    equipment: 'body weight',
  },
];

describe('backfillExerciseVideoUrlsIfNeeded', () => {
  it('sin API key configurada no hace nada y no marca settings', async () => {
    const repos = buildRepos();
    await repos.exercises.insertMany([{ name: '3/4 Sit-Up', isCustom: false }]);
    const fetchPage = jest.fn();

    await backfillExerciseVideoUrlsIfNeeded(repos, { apiKey: '', fetchPage });

    expect(fetchPage).not.toHaveBeenCalled();
    const all = await repos.exercises.listAll();
    expect(all[0]?.videoRemoteUrl).toBeNull();
    expect(await repos.settings.get('video_urls_backfilled_at')).toBeFalsy();
  });

  it('matchea por nombre (case-insensitive) y completa video_remote_url/video_source', async () => {
    const repos = buildRepos();
    await repos.exercises.insertMany([
      { name: '3/4 sit-up', isCustom: false }, // distinto casing que el remoto
      { name: 'Ejercicio sin match', isCustom: false },
    ]);
    const fetchPage = jest.fn().mockResolvedValueOnce(sampleRemoteEntries);

    await backfillExerciseVideoUrlsIfNeeded(repos, {
      apiKey: 'key',
      fetchPage,
    });

    const all = await repos.exercises.listAll();
    const matched = all.find(e => e.name === '3/4 sit-up');
    expect(matched?.videoSource).toBe('exercisedb');
    expect(matched?.videoRemoteUrl).toBe(
      'https://exercisedb.p.rapidapi.com/image?exerciseId=0001&resolution=180',
    );

    const unmatched = all.find(e => e.name === 'Ejercicio sin match');
    expect(unmatched?.videoRemoteUrl).toBeNull();
  });

  it('ignora ejercicios personalizados (isCustom)', async () => {
    const repos = buildRepos();
    await repos.exercises.insertMany([{ name: '3/4 Sit-Up', isCustom: true }]);
    const fetchPage = jest.fn().mockResolvedValueOnce(sampleRemoteEntries);

    await backfillExerciseVideoUrlsIfNeeded(repos, {
      apiKey: 'key',
      fetchPage,
    });

    const all = await repos.exercises.listAll();
    expect(all[0]?.videoRemoteUrl).toBeNull();
  });

  it('marca settings y es idempotente: no vuelve a consultar la API', async () => {
    const repos = buildRepos();
    await repos.exercises.insertMany([{ name: '3/4 Sit-Up', isCustom: false }]);
    const fetchPage = jest.fn().mockResolvedValue(sampleRemoteEntries);

    await backfillExerciseVideoUrlsIfNeeded(repos, {
      apiKey: 'key',
      fetchPage,
    });
    await backfillExerciseVideoUrlsIfNeeded(repos, {
      apiKey: 'key',
      fetchPage,
    });

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(await repos.settings.get('video_urls_backfilled_at')).toBeTruthy();
  });

  it('si falla la consulta al catálogo remoto, no marca settings (se reintenta después)', async () => {
    const repos = buildRepos();
    await repos.exercises.insertMany([{ name: '3/4 Sit-Up', isCustom: false }]);
    const fetchPage = jest.fn().mockRejectedValue(new Error('network error'));

    await backfillExerciseVideoUrlsIfNeeded(repos, {
      apiKey: 'key',
      fetchPage,
    });

    expect(await repos.settings.get('video_urls_backfilled_at')).toBeFalsy();
  });
});
