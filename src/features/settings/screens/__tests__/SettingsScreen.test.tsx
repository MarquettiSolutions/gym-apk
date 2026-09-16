import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { es } from '../../../../shared/i18n/es';

describe('SettingsScreen', () => {
  it('muestra el título y el mensaje de la pantalla en español', async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText(es.screens.settings.title)).toBeTruthy();
    expect(screen.getByText(es.screens.settings.placeholder)).toBeTruthy();
  });
});
