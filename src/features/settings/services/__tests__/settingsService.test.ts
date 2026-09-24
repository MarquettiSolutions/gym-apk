import { createTestDb } from '../../../../db/repositories/testDb';
import { createRepositories } from '../../../../db/repositories';
import { createSettingsService } from '../settingsService';
import { DEFAULT_SETTINGS } from '../../types';

function setup() {
  const db = createTestDb();
  const repositories = createRepositories(db);
  return createSettingsService(repositories);
}

describe('settingsService', () => {
  it('loadSettings devuelve los defaults cuando no hay nada guardado', async () => {
    const service = setup();

    const settings = await service.loadSettings();

    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('saveSetting persiste y loadSettings lo refleja después', async () => {
    const service = setup();

    await service.saveSetting('defaultRestSeconds', 45);
    await service.saveSetting('weightUnit', 'lb');
    await service.saveSetting('theme', 'dark');
    await service.saveSetting('language', 'en');
    await service.saveSetting('timerSoundEnabled', false);
    await service.saveSetting('timerVibrationEnabled', false);
    await service.saveSetting('dailyReminderEnabled', true);
    await service.saveSetting('dailyReminderHour', 7);
    await service.saveSetting('dailyReminderMinute', 30);

    const settings = await service.loadSettings();

    expect(settings).toEqual({
      defaultRestSeconds: 45,
      weightUnit: 'lb',
      theme: 'dark',
      language: 'en',
      timerSoundEnabled: false,
      timerVibrationEnabled: false,
      dailyReminderEnabled: true,
      dailyReminderHour: 7,
      dailyReminderMinute: 30,
    });
  });

  it('ignora valores guardados inválidos y usa el default', async () => {
    const service = setup();
    await service.saveSetting('weightUnit', 'lb');

    // Simula un valor corrupto/desconocido escrito directo en la tabla.
    const db = createTestDb();
    const repositories = createRepositories(db);
    await repositories.settings.set('theme', 'not-a-theme');
    const corruptedService = createSettingsService(repositories);

    const settings = await corruptedService.loadSettings();

    expect(settings.theme).toBe(DEFAULT_SETTINGS.theme);
  });

  it('ignora un idioma guardado inválido y usa el default', async () => {
    const db = createTestDb();
    const repositories = createRepositories(db);
    await repositories.settings.set('language', 'fr');
    const service = createSettingsService(repositories);

    const settings = await service.loadSettings();

    expect(settings.language).toBe(DEFAULT_SETTINGS.language);
  });
});
