import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ExerciseDetailScreen } from '../ExerciseDetailScreen';
import { es } from '../../../../shared/i18n/es';
import type { Exercise } from '../../types';

const mockUseExerciseDetail = jest.fn();

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
});
