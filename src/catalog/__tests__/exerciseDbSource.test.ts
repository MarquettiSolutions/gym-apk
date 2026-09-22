import {
  exerciseDbImageUrl,
  fetchExerciseDbCatalog,
  indexExerciseDbCatalogByName,
  normalizeExerciseName,
  type ExerciseDbEntry,
} from '../exerciseDbSource';

function buildEntry(overrides: Partial<ExerciseDbEntry> = {}): ExerciseDbEntry {
  return {
    id: '0001',
    name: '3/4 Sit-Up',
    bodyPart: 'waist',
    target: 'abs',
    equipment: 'body weight',
    ...overrides,
  };
}

describe('normalizeExerciseName', () => {
  it('pasa a minúsculas y recorta espacios', () => {
    expect(normalizeExerciseName('  3/4 Sit-Up  ')).toBe('3/4 sit-up');
  });
});

describe('indexExerciseDbCatalogByName', () => {
  it('indexa por nombre normalizado', () => {
    const index = indexExerciseDbCatalogByName([buildEntry()]);

    expect(index.get('3/4 sit-up')).toEqual(buildEntry());
    expect(index.get('3/4 Sit-Up')).toBeUndefined();
  });
});

describe('exerciseDbImageUrl', () => {
  it('arma la url del GIF con el id y resolución 180, sin la API key', () => {
    expect(exerciseDbImageUrl('0001')).toBe(
      'https://exercisedb.p.rapidapi.com/image?exerciseId=0001&resolution=180',
    );
  });
});

describe('fetchExerciseDbCatalog', () => {
  it('pagina hasta que una página vuelve incompleta', async () => {
    const page0 = Array.from({ length: 10 }, (_, i) =>
      buildEntry({ id: `000${i}`, name: `Exercise ${i}` }),
    );
    const page1 = [buildEntry({ id: '0010', name: 'Exercise 10' })];
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce(page0)
      .mockResolvedValueOnce(page1);

    const result = await fetchExerciseDbCatalog('key', fetchPage);

    expect(result).toHaveLength(11);
    expect(fetchPage).toHaveBeenNthCalledWith(1, {
      apiKey: 'key',
      offset: 0,
      limit: 10,
    });
    expect(fetchPage).toHaveBeenNthCalledWith(2, {
      apiKey: 'key',
      offset: 10,
      limit: 10,
    });
  });

  it('no pide una página más si la primera ya viene incompleta', async () => {
    const fetchPage = jest.fn().mockResolvedValueOnce([buildEntry()]);

    const result = await fetchExerciseDbCatalog('key', fetchPage);

    expect(result).toHaveLength(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
