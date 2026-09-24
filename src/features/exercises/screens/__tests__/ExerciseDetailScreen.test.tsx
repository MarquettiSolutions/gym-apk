import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ExerciseDetailScreen } from '../ExerciseDetailScreen';
import { es } from '../../../../shared/i18n/es';
import type { Exercise } from '../../types';

const mockUseExerciseDetail = jest.fn();
const mockSaveOverride = jest.fn().mockResolvedValue(undefined);
const mockRestore = jest.fn().mockResolvedValue(undefined);
const mockOpenURL = jest.fn().mockResolvedValue(undefined);

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: { getVersion: () => '0.0.1' },
}));

jest.mock('../../hooks/useExerciseDetail', () => ({
  useExerciseDetail: (exerciseId: string) => mockUseExerciseDetail(exerciseId),
}));

jest.mock('../../../../shared/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../../../shared/theme/colors').palette.light,
    spacing: require('../../../../shared/theme/spacing').spacing,
    isDark: false,
  }),
}));

jest.mock('../../../../shared/i18n', () => {
  const labels = require('../../../../shared/i18n/exerciseLabels');
  return {
    useTranslation: () => ({
      language: 'es',
      t: require('../../../../shared/i18n/es').es,
      exerciseName: (e: unknown) => labels.localizedExerciseName(e, 'es'),
      exerciseBaseName: (e: unknown) => labels.localizedExerciseName(e, 'es'),
      hasExerciseNameOverride: () => false,
      saveExerciseNameOverride: (...args: unknown[]) =>
        mockSaveOverride(...args),
      restoreExerciseName: (...args: unknown[]) => mockRestore(...args),
      exerciseMuscleGroup: (e: unknown) => labels.localizedMuscleGroup(e, 'es'),
      exerciseEquipment: (e: unknown) => labels.localizedEquipment(e, 'es'),
    }),
  };
});

function buildExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'a',
    name: 'Push Up',
    muscleGroup: 'chest',
    equipment: 'body weight',
    instructions: 'Baja el pecho y empuja.',
    thumbnailRemoteUrl: 'https://example.com/pushup.jpg',
    thumbnailLocalPath: null,
    videoSource: null,
    videoRemoteUrl: null,
    videoLocalPath: null,
    videoCachedAt: null,
    isCustom: false,
    createdByUserId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const t = es.exerciseDetail;

describe('ExerciseDetailScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  const route = { params: { exerciseId: 'a' } };

  it('muestra el estado de carga', async () => {
    mockUseExerciseDetail.mockReturnValue({ exercise: null, isLoading: true });

    await render(<ExerciseDetailScreen route={route} />);

    expect(screen.getByText(es.common.loading)).toBeTruthy();
  });

  it('muestra el mensaje de no encontrado si no existe el ejercicio', async () => {
    mockUseExerciseDetail.mockReturnValue({ exercise: null, isLoading: false });

    await render(<ExerciseDetailScreen route={route} />);

    expect(screen.getByText(t.notFound)).toBeTruthy();
  });

  it('muestra nombre, grupo muscular, equipo e instrucciones', async () => {
    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise(),
      isLoading: false,
    });

    await render(<ExerciseDetailScreen route={route} />);

    expect(screen.getByText('Push Up')).toBeTruthy();
    expect(screen.getByText('Pecho')).toBeTruthy();
    expect(screen.getByText('body weight')).toBeTruthy();
    expect(screen.getByText('Baja el pecho y empuja.')).toBeTruthy();
  });

  it('muestra el aviso de conexión si hay video_remote_url pero no está cacheado', async () => {
    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise({
        videoRemoteUrl:
          'https://exercisedb.p.rapidapi.com/image?exerciseId=1&resolution=180',
        videoLocalPath: null,
      }),
      isLoading: false,
    });

    await render(<ExerciseDetailScreen route={route} />);

    expect(screen.getByText(t.offlineBannerMessage)).toBeTruthy();
  });

  it('no muestra el aviso de conexión si el video ya está cacheado', async () => {
    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise({
        videoRemoteUrl:
          'https://exercisedb.p.rapidapi.com/image?exerciseId=1&resolution=180',
        videoLocalPath: '/local/a.gif',
      }),
      isLoading: false,
    });

    await render(<ExerciseDetailScreen route={route} />);

    expect(screen.queryByText(t.offlineBannerMessage)).toBeNull();
  });

  it('no muestra el aviso de conexión si el ejercicio nunca tuvo proveedor de video', async () => {
    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise({ videoRemoteUrl: null, videoLocalPath: null }),
      isLoading: false,
    });

    await render(<ExerciseDetailScreen route={route} />);

    expect(screen.queryByText(t.offlineBannerMessage)).toBeNull();
  });

  it('ofrece editar el nombre en ejercicios del catálogo pero no en personalizados', async () => {
    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise(),
      isLoading: false,
    });
    const first = await render(<ExerciseDetailScreen route={route} />);
    expect(screen.getByText(t.editName)).toBeTruthy();
    await first.unmount();

    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise({ isCustom: true }),
      isLoading: false,
    });
    await render(<ExerciseDetailScreen route={route} />);
    expect(screen.queryByText(t.editName)).toBeNull();
  });

  it('pide confirmación explícita y "solo local" no abre el navegador', async () => {
    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise(),
      isLoading: false,
    });
    jest.spyOn(Linking, 'openURL').mockImplementation(mockOpenURL);
    await render(<ExerciseDetailScreen route={route} />);

    await fireEvent.press(screen.getByText(t.editName));
    await fireEvent.changeText(
      screen.getByLabelText(t.nameFieldLabel),
      '  Flexión de pecho ',
    );
    await fireEvent.press(screen.getByText(es.common.save));

    expect(mockSaveOverride).not.toHaveBeenCalled();
    expect(screen.getByText(t.saveLocalOnly)).toBeTruthy();
    expect(screen.getByText(t.saveAndSend)).toBeTruthy();

    await fireEvent.press(screen.getByText(t.saveLocalOnly));

    expect(mockSaveOverride).toHaveBeenCalledWith('a', 'Flexión de pecho');
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it('"guardar y enviar" guarda y abre la issue prellenada', async () => {
    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise(),
      isLoading: false,
    });
    jest.spyOn(Linking, 'openURL').mockImplementation(mockOpenURL);
    await render(<ExerciseDetailScreen route={route} />);

    await fireEvent.press(screen.getByText(t.editName));
    await fireEvent.changeText(
      screen.getByLabelText(t.nameFieldLabel),
      'Flexión de pecho',
    );
    await fireEvent.press(screen.getByText(es.common.save));
    await fireEvent.press(screen.getByText(t.saveAndSend));

    expect(mockSaveOverride).toHaveBeenCalledWith('a', 'Flexión de pecho');
    expect(mockOpenURL).toHaveBeenCalledWith(
      expect.stringContaining(
        'github.com/MarquettiSolutions/gym-apk/issues/new',
      ),
    );
  });

  it('no deja continuar con un nombre vacío', async () => {
    mockUseExerciseDetail.mockReturnValue({
      exercise: buildExercise(),
      isLoading: false,
    });
    await render(<ExerciseDetailScreen route={route} />);

    await fireEvent.press(screen.getByText(t.editName));
    await fireEvent.changeText(screen.getByLabelText(t.nameFieldLabel), '   ');
    await fireEvent.press(screen.getByText(es.common.save));

    expect(screen.getByText(t.nameEmptyError)).toBeTruthy();
    expect(screen.queryByText(t.saveLocalOnly)).toBeNull();
  });
});
