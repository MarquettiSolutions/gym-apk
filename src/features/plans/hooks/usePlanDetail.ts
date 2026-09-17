import { useCallback, useEffect, useState } from 'react';
import { plansService } from '../services';
import type { PlanDetail } from '../types';

export function usePlanDetail(planId: string) {
  const [detail, setDetail] = useState<PlanDetail>();
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const result = await plansService.getPlanDetail(planId);
    setDetail(result);
    setIsLoading(false);
  }, [planId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { detail, isLoading, reload };
}
