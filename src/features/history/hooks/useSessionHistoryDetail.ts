import { useCallback, useEffect, useState } from 'react';
import { historyService } from '../services';
import type { SessionHistoryDetail } from '../types';

export function useSessionHistoryDetail(sessionId: string) {
  const [detail, setDetail] = useState<SessionHistoryDetail>();
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const result = await historyService.getSessionDetail(sessionId);
    setDetail(result);
    setIsLoading(false);
  }, [sessionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { detail, isLoading, reload };
}
