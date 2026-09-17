import { useCallback, useEffect, useState } from 'react';
import { historyService } from '../services';
import type { SessionSummary, StreakInfo } from '../types';

export function useHistory(userId: string | undefined) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [streak, setStreak] = useState<StreakInfo>({ days: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      return;
    }
    setIsLoading(true);
    const [sessionList, streakInfo] = await Promise.all([
      historyService.listSessions(userId),
      historyService.getStreak(userId),
    ]);
    setSessions(sessionList);
    setStreak(streakInfo);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { sessions, streak, isLoading, reload };
}
