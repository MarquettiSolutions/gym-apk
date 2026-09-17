import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cancelRestEndNotification,
  requestNotificationPermission,
  scheduleRestEndNotification,
} from '../services';
import { remainingSeconds as computeRemainingSeconds } from '../utils/restTimer';

interface UseRestTimerOptions {
  initialSeconds: number;
  onFinish: () => void;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// Temporizador de descanso basado en un deadline real (`Date.now() + ms`),
// no en un contador que se decrementa a mano — así no se desincroniza si la
// app pasa un rato en background (spec 4.1). En paralelo programa una
// notificación local (notifee) para ese mismo timestamp, que sigue
// disparando aunque la pantalla esté apagada; se reprograma cada vez que el
// deadline cambia (pausa/reanudar, +15s/-15s).
export function useRestTimer({
  initialSeconds,
  onFinish,
  soundEnabled,
  vibrationEnabled,
}: UseRestTimerOptions) {
  const [deadline, setDeadline] = useState(
    () => Date.now() + initialSeconds * 1000,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [pausedRemainingMs, setPausedRemainingMs] = useState(0);
  const [remaining, setRemaining] = useState(initialSeconds);
  const notificationIdRef = useRef<string | null>(null);
  const finishedRef = useRef(false);

  const rescheduleNotification = useCallback(
    async (newDeadline: number) => {
      if (notificationIdRef.current) {
        const previousId = notificationIdRef.current;
        notificationIdRef.current = null;
        await cancelRestEndNotification(previousId).catch(() => undefined);
      }
      try {
        notificationIdRef.current = await scheduleRestEndNotification(
          newDeadline,
          { sound: soundEnabled, vibration: vibrationEnabled },
        );
      } catch {
        // Sin permiso u OEM que bloquea notificaciones en background: el
        // temporizador sigue funcionando en pantalla, solo se pierde el aviso.
      }
    },
    [soundEnabled, vibrationEnabled],
  );

  useEffect(() => {
    requestNotificationPermission().catch(() => undefined);
    rescheduleNotification(deadline);
    return () => {
      if (notificationIdRef.current) {
        cancelRestEndNotification(notificationIdRef.current).catch(
          () => undefined,
        );
      }
    };
    // Solo al montar: cambios posteriores de `deadline` los reprograman las
    // acciones (pause/resume/addSeconds), no este efecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPaused) {
      return;
    }
    const interval = setInterval(() => {
      const secondsLeft = computeRemainingSeconds(deadline);
      setRemaining(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
        if (!finishedRef.current) {
          finishedRef.current = true;
          onFinish();
        }
      }
    }, 250);
    return () => clearInterval(interval);
  }, [deadline, isPaused, onFinish]);

  const pause = useCallback(() => {
    setPausedRemainingMs(Math.max(0, deadline - Date.now()));
    setIsPaused(true);
  }, [deadline]);

  const resume = useCallback(() => {
    const newDeadline = Date.now() + pausedRemainingMs;
    setDeadline(newDeadline);
    setIsPaused(false);
    rescheduleNotification(newDeadline);
  }, [pausedRemainingMs, rescheduleNotification]);

  const addSeconds = useCallback(
    (delta: number) => {
      if (isPaused) {
        setPausedRemainingMs(prev => Math.max(0, prev + delta * 1000));
        return;
      }
      const newDeadline = Math.max(Date.now(), deadline + delta * 1000);
      setDeadline(newDeadline);
      rescheduleNotification(newDeadline);
    },
    [isPaused, deadline, rescheduleNotification],
  );

  const skip = useCallback(() => {
    if (notificationIdRef.current) {
      const previousId = notificationIdRef.current;
      notificationIdRef.current = null;
      cancelRestEndNotification(previousId).catch(() => undefined);
    }
    if (!finishedRef.current) {
      finishedRef.current = true;
      onFinish();
    }
  }, [onFinish]);

  return {
    remainingSeconds: isPaused
      ? Math.ceil(pausedRemainingMs / 1000)
      : remaining,
    isPaused,
    pause,
    resume,
    addSeconds,
    skip,
  };
}
