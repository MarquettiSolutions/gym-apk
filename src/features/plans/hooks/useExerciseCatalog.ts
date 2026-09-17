import { useEffect, useState } from 'react';
import { repositories } from '../../../db/client';
import type { Exercise } from '../types';

export function useExerciseCatalog() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    repositories.exercises.listAll().then(list => {
      if (mounted) {
        setExercises(list);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { exercises, isLoading };
}
