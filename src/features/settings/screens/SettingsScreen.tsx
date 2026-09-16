import React from 'react';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { es } from '../../../shared/i18n/es';

export function SettingsScreen() {
  return (
    <PlaceholderScreen
      title={es.screens.settings.title}
      message={es.screens.settings.placeholder}
    />
  );
}
