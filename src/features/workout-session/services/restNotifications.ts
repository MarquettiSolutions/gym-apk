import notifee, {
  AndroidImportance,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import { getActiveTranslations } from '../../../shared/i18n/activeLanguage';

export interface RestNotificationOptions {
  sound: boolean;
  vibration: boolean;
}

// Aviso de fin de descanso programado por timestamp real (no `setInterval`),
// para que siga disparando aunque la app esté en background o la pantalla
// apagada (spec 4.1 y 5.3). No usamos `alarmManager` exacto a propósito: eso
// requeriría el permiso `SCHEDULE_EXACT_ALARM` que no está declarado — el
// trigger por WorkManager alcanza para un descanso de segundos/minutos.
export async function requestNotificationPermission(): Promise<void> {
  await notifee.requestPermission();
}

// Android 8+ no permite cambiar sonido/vibración de un canal ya creado, así
// que sonido/vibración se resuelven con un canal distinto por combinación
// (ver Ajustes → Temporizador) en vez de un único canal fijo.
function channelId({ sound, vibration }: RestNotificationOptions): string {
  return `rest-timer-${sound ? 's1' : 's0'}-${vibration ? 'v1' : 'v0'}`;
}

async function ensureChannel(
  options: RestNotificationOptions,
): Promise<string> {
  const id = channelId(options);
  return notifee.createChannel({
    id,
    name: getActiveTranslations().workoutSession.restTimer.channelName,
    importance: AndroidImportance.HIGH,
    sound: options.sound ? 'default' : undefined,
    vibration: options.vibration,
  });
}

export async function scheduleRestEndNotification(
  deadlineTimestamp: number,
  options: RestNotificationOptions,
): Promise<string> {
  const id = await ensureChannel(options);
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: deadlineTimestamp,
  };
  const t = getActiveTranslations();
  const notification = await notifee.createTriggerNotification(
    {
      title: t.workoutSession.restTimer.notificationTitle,
      body: t.workoutSession.restTimer.notificationBody,
      android: { channelId: id, pressAction: { id: 'default' } },
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
