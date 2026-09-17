import { shouldSkipRestAfterSet } from '../supersetRest';
import type { ExerciseProgress, SetProgress } from '../../types';

function makeSets(targetSets: number, doneUpTo: number): SetProgress[] {
  return Array.from({ length: targetSets }, (_, i) => {
    const setNumber = i + 1;
    return {
      setNumber,
      latest:
        setNumber <= doneUpTo
          ? ({ id: `set-${setNumber}` } as SetProgress['latest'])
          : null,
    };
  });
}

function makeMember(
  id: string,
  targetSets: number,
  doneUpTo: number,
): ExerciseProgress {
  return {
    planDayExercise: { id, targetSets } as ExerciseProgress['planDayExercise'],
    exercise: {} as ExerciseProgress['exercise'],
    sets: makeSets(targetSets, doneUpTo),
    suggestion: null,
  };
}

describe('shouldSkipRestAfterSet', () => {
  it('nunca salta el descanso si el grupo tiene menos de 2 miembros', () => {
    const a = makeMember('a', 3, 0);
    expect(shouldSkipRestAfterSet([a], 'a', 1)).toBe(false);
  });

  it('salta el descanso si otro miembro todavía no hizo esa misma serie', () => {
    const a = makeMember('a', 3, 1);
    const b = makeMember('b', 3, 0);

    expect(shouldSkipRestAfterSet([a, b], 'a', 1)).toBe(true);
  });

  it('no salta el descanso cuando todos los miembros ya completaron esa serie (cierre de ronda)', () => {
    const a = makeMember('a', 3, 1);
    const b = makeMember('b', 3, 1);

    expect(shouldSkipRestAfterSet([a, b], 'a', 1)).toBe(false);
  });

  it('ignora a un miembro que ya no tiene series objetivo en esta ronda (distinto targetSets)', () => {
    const a = makeMember('a', 2, 2); // A solo tiene 2 series, ya completadas
    const b = makeMember('b', 4, 2); // B va por la serie 3 de 4

    // B acaba de completar su serie 3; A no tiene serie 3 planificada, así
    // que no cuenta como pendiente: debe descansar.
    expect(shouldSkipRestAfterSet([a, b], 'b', 3)).toBe(false);
  });

  it('es indiferente al orden en que se registraron las series (fuera de orden)', () => {
    const a = makeMember('a', 3, 0);
    const b = makeMember('b', 3, 1);

    // B ya hizo su serie 1; ahora A la completa. A es el que "cierra" la
    // ronda de la serie 1, entonces toca descansar.
    expect(shouldSkipRestAfterSet([a, b], 'a', 1)).toBe(false);
  });
});
