import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { BodyWeightScreen } from '../BodyWeightScreen';
import { es } from '../../../../shared/i18n/es';
import { formatDateTime } from '../../../../shared/utils/dates';
import type { BodyWeightLog } from '../../types';

const mockReload = jest.fn();
const mockSetFilter = jest.fn();
const mockAddLog = jest.fn();
const mockDeleteLog = jest.fn();
let mockLogs: BodyWeightLog[] = [];

jest.mock('../../hooks/useBodyWeight', () => ({
  useBodyWeight: () => ({
    logs: mockLogs,
    filteredLogs: mockLogs,
    filter: 'month',
    setFilter: mockSetFilter,
    isLoading: false,
    reload: mockReload,
  }),
}));

jest.mock('../../../../shared/hooks/useLocalUserId', () => ({
  useLocalUserId: () => 'user-1',
}));

jest.mock('../../services', () => ({
  bodyWeightService: {
    addLog: (...args: unknown[]) => mockAddLog(...args),
    deleteLog: (...args: unknown[]) => mockDeleteLog(...args),
  },
}));

jest.mock('../../../settings/context/SettingsContext', () => ({
  useSettings: () => ({
    settings: { weightUnit: 'kg' },
  }),
}));

jest.mock('../../../../shared/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../../../shared/theme/colors').palette.light,
    spacing: require('../../../../shared/theme/spacing').spacing,
    isDark: false,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    require('react').useEffect(callback, []);
  },
}));

jest.mock('../../../../shared/i18n', () => ({
  useTranslation: () => ({
    language: 'es',
    t: require('../../../../shared/i18n/es').es,
  }),
  getActiveLanguage: () => 'es',
  LOCALE_TAG: { en: 'en-US', es: 'es-MX', pt: 'pt-BR' },
}));

// Evita la cadena de imports de react-native-reanimated/worklets (rota bajo
// Jest con las versiones instaladas, ver jest.config.js): en este test solo
// nos interesa el sheet de alta, no las acciones de swipe de la lista.
jest.mock('../../../../shared/components/SwipeableCard', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');
  return {
    SwipeableCard: ({ children }: { children: React.ReactNode }) =>
      createElement(View, null, children),
  };
});

const t = es.bodyWeight;

describe('BodyWeightScreen', () => {
  beforeEach(() => {
    mockLogs = [];
    mockReload.mockClear();
    mockSetFilter.mockClear();
    mockAddLog.mockClear();
    mockDeleteLog.mockClear();
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 22, 10, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('muestra el estado vacío cuando no hay registros', async () => {
    await render(<BodyWeightScreen />);

    expect(screen.getByText(t.empty)).toBeTruthy();
  });

  it('agregar registro sin tocar la fecha usa "ahora" por defecto', async () => {
    await render(<BodyWeightScreen />);

    await fireEvent.press(screen.getByText(t.addButton));
    await fireEvent.changeText(
      screen.getByLabelText(t.weightLabel('kg')),
      '80.5',
    );
    await fireEvent.press(screen.getByText(es.common.save));

    expect(mockAddLog).toHaveBeenCalledWith(
      'user-1',
      80.5,
      'kg',
      new Date(2026, 8, 22, 10, 0).toISOString(),
    );
  });

  it('elegir una fecha y hora distintas las pasa a addLog', async () => {
    await render(<BodyWeightScreen />);

    await fireEvent.press(screen.getByText(t.addButton));
    await fireEvent.changeText(
      screen.getByLabelText(t.weightLabel('kg')),
      '79',
    );

    const initialLabel = formatDateTime(
      new Date(2026, 8, 22, 10, 0).toISOString(),
    );
    await fireEvent.press(screen.getByLabelText(initialLabel));
    const [datePicker] = screen.container.queryAll(
      instance => instance.props.mode === 'date',
    );
    await fireEvent(
      datePicker!,
      'change',
      { type: 'set' },
      new Date(2026, 0, 15),
    );

    const [timePicker] = screen.container.queryAll(
      instance => instance.props.mode === 'time',
    );
    await fireEvent(
      timePicker!,
      'change',
      { type: 'set' },
      new Date(2000, 0, 1, 7, 45),
    );

    await fireEvent.press(screen.getByText(es.common.save));

    expect(mockAddLog).toHaveBeenCalledWith(
      'user-1',
      79,
      'kg',
      new Date(2026, 0, 15, 7, 45).toISOString(),
    );
  });
});
