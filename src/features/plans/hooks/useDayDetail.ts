import { useCallback, useEffect, useState } from 'react';
import { plansService } from '../services';
import type { PlanDayDetail } from '../types';

export function useDayDetail(dayId: string) {
  const [detail, setDetail] = useState<PlanDayDetail>();
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const result = await plansService.getDayDetail(dayId);
    setDetail(result);
    setIsLoading(false);
  }, [dayId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { detail, isLoading, reload };
}
