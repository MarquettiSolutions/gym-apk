import { useCallback, useEffect, useState } from 'react';
import { workoutSessionService } from '../services';
import type { SessionDetail } from '../types';

export function useSessionDetail(sessionId: string) {
  const [detail, setDetail] = useState<SessionDetail>();
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const result = await workoutSessionService.getSessionDetail(sessionId);
    setDetail(result);
    setIsLoading(false);
  }, [sessionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { detail, isLoading, reload };
}
