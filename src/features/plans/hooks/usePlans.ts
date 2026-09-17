import { useCallback, useEffect, useState } from 'react';
import { plansService } from '../services';
import type { Plan } from '../types';

export function usePlans(userId: string | undefined) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      return;
    }
    setIsLoading(true);
    const list = await plansService.listPlans(userId);
    setPlans(list);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { plans, isLoading, reload };
}
