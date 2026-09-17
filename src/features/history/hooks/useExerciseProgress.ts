import { useCallback, useEffect, useState } from 'react';
import { historyService } from '../services';
import type { ExerciseProgress } from '../types';

export function useExerciseProgress(
  userId: string | undefined,
  exerciseId: string,
) {
  const [progress, setProgress] = useState<ExerciseProgress>();
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      return;
    }
    setIsLoading(true);
    const result = await historyService.getExerciseProgress(userId, exerciseId);
    setProgress(result);
    setIsLoading(false);
  }, [userId, exerciseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { progress, isLoading };
}
