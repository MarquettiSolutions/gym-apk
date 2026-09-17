import { useCallback, useEffect, useMemo, useState } from 'react';
import { bodyWeightService, filterLogsByRange } from '../services';
import type { BodyWeightLog, BodyWeightRangeFilter } from '../types';

export function useBodyWeight(userId: string | undefined) {
  const [logs, setLogs] = useState<BodyWeightLog[]>([]);
  const [filter, setFilter] = useState<BodyWeightRangeFilter>('month');
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      return;
    }
    setIsLoading(true);
    const list = await bodyWeightService.listLogs(userId);
    setLogs(list);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredLogs = useMemo(
    () => filterLogsByRange(logs, filter),
    [logs, filter],
  );

  return { logs, filteredLogs, filter, setFilter, isLoading, reload };
}
