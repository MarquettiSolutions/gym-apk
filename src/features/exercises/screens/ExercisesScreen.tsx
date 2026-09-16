import React from 'react';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { es } from '../../../shared/i18n/es';

export function ExercisesScreen() {
  return (
    <PlaceholderScreen
      title={es.screens.exercises.title}
      message={es.screens.exercises.placeholder}
    />
  );
}
