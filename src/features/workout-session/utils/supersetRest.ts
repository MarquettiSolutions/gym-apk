import type { ExerciseProgress } from '../types';

// Decide si hay que saltar el descanso tras registrar una serie de un
// ejercicio que pertenece a una superserie: mientras algún OTRO miembro del
// grupo todavía no completó (ni saltó) su serie número `setNumber`, la
// "ronda" actual sigue abierta y no corresponde descansar todavía. El
// descanso real se dispara recién cuando se cierra la ronda (nadie más del
// grupo tiene esa serie pendiente).
export function shouldSkipRestAfterSet(
  groupMembers: ExerciseProgress[],
  justCompletedId: string,
  setNumber: number,
): boolean {
  if (groupMembers.length < 2) {
    return false;
  }
  return groupMembers.some(member => {
    if (member.planDayExercise.id === justCompletedId) {
      return false;
    }
    if (member.planDayExercise.targetSets < setNumber) {
      return false;
    }
    const set = member.sets.find(s => s.setNumber === setNumber);
    return !set || set.latest === null;
  });
}
