import React from 'react';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { es } from '../../../shared/i18n/es';

export function TodayWorkoutScreen() {
  return (
    <PlaceholderScreen
      title={es.screens.today.title}
      message={es.screens.today.placeholder}
    />
  );
}
