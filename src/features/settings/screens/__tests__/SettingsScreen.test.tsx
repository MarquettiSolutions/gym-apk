import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { es } from '../../../../shared/i18n/es';

const mockUpdateSetting = jest.fn();
const mockReload = jest.fn();

jest.mock('../../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: {
      defaultRestSeconds: 30,
      weightUnit: 'kg',
      theme: 'system',
      timerSoundEnabled: true,
      timerVibrationEnabled: true,
      dailyReminderEnabled: false,
      dailyReminderHour: 8,
      dailyReminderMinute: 0,
    },
    isLoaded: true,
    updateSetting: mockUpdateSetting,
    reload: mockReload,
  }),
}));

jest.mock('../../services', () => ({
  backupService: {
    exportBackupToFile: jest.fn(),
    importBackupFromPicker: jest.fn(),
  },
}));

jest.mock('../../../../shared/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../../../shared/theme/colors').palette.light,
    spacing: require('../../../../shared/theme/spacing').spacing,
    isDark: false,
  }),
}));

const t = es.settings;

describe('SettingsScreen', () => {
  beforeEach(() => {
    mockUpdateSetting.mockClear();
    mockReload.mockClear();
  });

  it('muestra las secciones principales en español', async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText(t.sections.training)).toBeTruthy();
    expect(screen.getByText(t.sections.weight)).toBeTruthy();
    expect(screen.getByText(t.sections.appearance)).toBeTruthy();
    expect(screen.getByText(t.sections.timer)).toBeTruthy();
    expect(screen.getByText(t.sections.data)).toBeTruthy();
  });

  it('cambiar el descanso por defecto y perder foco llama a updateSetting', async () => {
    await render(<SettingsScreen />);

    const input = screen.getByLabelText(t.defaultRestSecondsLabel);
    await fireEvent.changeText(input, '45');
    await fireEvent(input, 'blur');

    expect(mockUpdateSetting).toHaveBeenCalledWith('defaultRestSeconds', 45);
  });

  it('elegir libras en unidad de peso llama a updateSetting', async () => {
    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByLabelText(t.weightUnitOptions.lb));

    expect(mockUpdateSetting).toHaveBeenCalledWith('weightUnit', 'lb');
  });

  it('elegir tema oscuro llama a updateSetting', async () => {
    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByLabelText(t.themeOptions.dark));

    expect(mockUpdateSetting).toHaveBeenCalledWith('theme', 'dark');
  });

  it('apagar el sonido del temporizador llama a updateSetting', async () => {
    await render(<SettingsScreen />);

    await fireEvent(
      screen.getByLabelText(t.timerSoundLabel),
      'valueChange',
      false,
    );

    expect(mockUpdateSetting).toHaveBeenCalledWith('timerSoundEnabled', false);
  });

  it('muestra la sección de notificaciones y activa el recordatorio diario', async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText(t.sections.notifications)).toBeTruthy();
    await fireEvent(
      screen.getByLabelText(t.dailyReminderLabel),
      'valueChange',
      true,
    );

    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'dailyReminderEnabled',
      true,
    );
  });

  it('muestra la sección "Acerca de" con la versión de la app', async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText(t.sections.about)).toBeTruthy();
    expect(screen.getByText(t.versionLabel('unknown', 'unknown'))).toBeTruthy();
  });
});
