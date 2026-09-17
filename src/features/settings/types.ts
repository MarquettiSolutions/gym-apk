export type ThemePreference = 'light' | 'dark' | 'system';
export type WeightUnit = 'kg' | 'lb';

export interface AppSettings {
  defaultRestSeconds: number;
  weightUnit: WeightUnit;
  theme: ThemePreference;
  timerSoundEnabled: boolean;
  timerVibrationEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultRestSeconds: 30,
  weightUnit: 'kg',
  theme: 'system',
  timerSoundEnabled: true,
  timerVibrationEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderHour: 8,
  dailyReminderMinute: 0,
};
