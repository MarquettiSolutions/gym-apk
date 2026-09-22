import { useCallback, useEffect, useState } from 'react';
import { repositories } from '../../../db/client';
import { ensureExerciseVideoCached } from '../../../catalog/videoCache';
import type { Exercise } from '../types';

// Carga el ejercicio y dispara la descarga bajo demanda del video/GIF (spec
// 5.2) sin bloquear el render inicial. Si la descarga falla (sin conexión,
// primera vez y sin red, etc.) se ignora — la pantalla sigue mostrando la
// miniatura estática, nunca crashea por esto.
export function useExerciseDetail(exerciseId: string) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const found = await repositories.exercises.getById(exerciseId);
    setExercise(found ?? null);
    setIsLoading(false);
    if (!found) {
      return;
    }
    const localPath = await ensureExerciseVideoCached(
      found,
      repositories.exercises,
    ).catch(() => null);
    if (localPath) {
      setExercise(current =>
        current ? { ...current, videoLocalPath: localPath } : current,
      );
    }
  }, [exerciseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { exercise, isLoading, reload };
}
