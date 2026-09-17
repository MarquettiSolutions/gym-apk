import notifee, {
  AndroidImportance,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import { es } from '../../../shared/i18n/es';

const CHANNEL_ID = 'rest-timer';

// Aviso de fin de descanso programado por timestamp real (no `setInterval`),
// para que siga disparando aunque la app esté en background o la pantalla
// apagada (spec 4.1 y 5.3). No usamos `alarmManager` exacto a propósito: eso
// requeriría el permiso `SCHEDULE_EXACT_ALARM` que no está declarado — el
// trigger por WorkManager alcanza para un descanso de segundos/minutos.
export async function requestNotificationPermission(): Promise<void> {
  await notifee.requestPermission();
}

async function ensureChannel(): Promise<string> {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: es.workoutSession.restTimer.channelName,
    importance: AndroidImportance.HIGH,
  });
}

export async function scheduleRestEndNotification(
  deadlineTimestamp: number,
): Promise<string> {
  await ensureChannel();
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: deadlineTimestamp,
  };
  const notification = await notifee.createTriggerNotification(
    {
      title: es.workoutSession.restTimer.notificationTitle,
      body: es.workoutSession.restTimer.notificationBody,
      android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
    },
    trigger,
  );
  return notification;
}

export async function cancelRestEndNotification(
  notificationId: string,
): Promise<void> {
  await notifee.cancelTriggerNotification(notificationId);
}
