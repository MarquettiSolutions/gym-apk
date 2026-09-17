import { useCallback, useEffect, useState } from 'react';
import { workoutSessionService } from '../services';
import type { TodayWorkout } from '../types';

export function useTodayWorkout(userId: string | undefined) {
  const [workout, setWorkout] = useState<TodayWorkout>();
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      return;
    }
    setIsLoading(true);
    const result = await workoutSessionService.getTodayWorkout(userId);
    setWorkout(result);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { workout, isLoading, reload };
}
