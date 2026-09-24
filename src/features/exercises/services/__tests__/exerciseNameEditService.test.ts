import {
  MAX_EXERCISE_NAME_LENGTH,
  buildNameSuggestionUrl,
  validateExerciseName,
} from '../exerciseNameEditService';

describe('validateExerciseName', () => {
  it('recorta y normaliza espacios', () => {
    expect(validateExerciseName('  Peso   muerto ')).toEqual({
      ok: true,
      name: 'Peso muerto',
    });
  });

  it('rechaza nombres vacíos o solo espacios', () => {
    expect(validateExerciseName('   ')).toEqual({ ok: false, reason: 'empty' });
  });

  it('rechaza nombres demasiado largos', () => {
    expect(
      validateExerciseName('a'.repeat(MAX_EXERCISE_NAME_LENGTH + 1)),
    ).toEqual({ ok: false, reason: 'tooLong' });
  });
});

describe('buildNameSuggestionUrl', () => {
  it('arma una issue prellenada con original, idioma, actual y sugerido', () => {
    const url = new URL(
      buildNameSuggestionUrl({
        originalName: 'Barbell Deadlift',
        language: 'es',
        currentName: 'Peso muerto con barra',
        suggestedName: 'Peso muerto convencional',
        appVersion: '0.0.1',
      }),
    );
    expect(url.origin + url.pathname).toBe(
      'https://github.com/MarquettiSolutions/gym-apk/issues/new',
    );
    expect(url.searchParams.get('labels')).toBe('traducción');
    const body = url.searchParams.get('body') ?? '';
    expect(body).toContain('Barbell Deadlift');
    expect(body).toContain('Peso muerto con barra');
    expect(body).toContain('Peso muerto convencional');
    expect(body).toContain('es');
    expect(body).toContain('0.0.1');
  });
});
