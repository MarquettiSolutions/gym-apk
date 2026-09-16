import React from 'react';
import { PlaceholderScreen } from '../../../shared/components/PlaceholderScreen';
import { es } from '../../../shared/i18n/es';

export function PlansScreen() {
  return (
    <PlaceholderScreen
      title={es.screens.plans.title}
      message={es.screens.plans.placeholder}
    />
  );
}
