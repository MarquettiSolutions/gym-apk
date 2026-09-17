export type ThemePreference = 'light' | 'dark' | 'system';
export type WeightUnit = 'kg' | 'lb';

export interface AppSettings {
  defaultRestSeconds: number;
  weightUnit: WeightUnit;
  theme: ThemePreference;
  timerSoundEnabled: boolean;
  timerVibrationEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultRestSeconds: 30,
  weightUnit: 'kg',
  theme: 'system',
  timerSoundEnabled: true,
  timerVibrationEnabled: true,
};
