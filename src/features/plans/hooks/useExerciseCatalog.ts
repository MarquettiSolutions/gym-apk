import { useCallback, useEffect, useState } from 'react';
import { repositories } from '../../../db/client';
import type { Exercise } from '../types';

export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const list = await repositories.exercises.listAll();
    setExercises(list);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { exercises, isLoading, reload };
}
