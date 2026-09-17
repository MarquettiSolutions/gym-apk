import notifee, {
  AndroidImportance,
  RepeatFrequency,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import { es } from '../../../shared/i18n/es';
import type { AppSettings } from '../../settings/types';

const CHANNEL_ID = 'daily-reminder';
const NOTIFICATION_ID = 'daily-reminder';

// Recordatorio diario recurrente (spec Fase 6): a diferencia del timer de
// descanso (que puede tener varias instancias en vuelo y usa ids random),
// acá solo existe un recordatorio a la vez, así que usamos un id fijo y
// dejamos que notifee reemplace el trigger existente al reprogramar. Sin
// `alarmManager` (mismo criterio que restNotifications.ts): evita requerir
// `SCHEDULE_EXACT_ALARM`, a costa de que el horario pueda demorar algunos
// minutos en dispositivos con optimización agresiva de batería. notifee ya
// declara internamente `RECEIVE_BOOT_COMPLETED` + sus propios receivers, así
// que el trigger sobrevive un reboot sin código nativo adicional.
export async function requestNotificationPermission(): Promise<void> {
  await notifee.requestPermission();
}

async function ensureChannel(): Promise<string> {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: es.notifications.dailyReminder.channelName,
    importance: AndroidImportance.DEFAULT,
  });
}

function nextTimestamp(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0,
  );
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  const channelId = await ensureChannel();
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextTimestamp(hour, minute),
    repeatFrequency: RepeatFrequency.DAILY,
  };
  await notifee.createTriggerNotification(
    {
      id: NOTIFICATION_ID,
      title: es.notifications.dailyReminder.title,
      body: es.notifications.dailyReminder.body,
      android: { channelId, pressAction: { id: 'default' } },
    },
    trigger,
  );
}

export async function cancelDailyReminder(): Promise<void> {
  await notifee.cancelTriggerNotification(NOTIFICATION_ID);
}

export async function ensureDailyReminderScheduled(
  settings: Pick<
    AppSettings,
    'dailyReminderEnabled' | 'dailyReminderHour' | 'dailyReminderMinute'
  >,
): Promise<void> {
  if (!settings.dailyReminderEnabled) {
    await cancelDailyReminder();
    return;
  }
  await requestNotificationPermission();
  await scheduleDailyReminder(
    settings.dailyReminderHour,
    settings.dailyReminderMinute,
  );
}
