import React from 'react';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { es } from '../../../shared/i18n/es';

export function HistoryScreen() {
  return (
    <PlaceholderScreen
      title={es.screens.history.title}
      message={es.screens.history.placeholder}
    />
  );
}
