import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FormSheet } from '../FormSheet';

jest.mock('../../theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../theme/colors').palette.light,
    spacing: require('../../theme/spacing').spacing,
    isDark: false,
  }),
}));

jest.mock('../../i18n', () => ({
  useTranslation: () => ({
    language: 'es',
    t: require('../../i18n/es').es,
  }),
}));

async function renderSheet(
  props: Partial<React.ComponentProps<typeof FormSheet>> = {},
) {
  const onCancel = jest.fn();
  const onSubmit = jest.fn();
  const utils = await render(
    <FormSheet
      visible
      title="Editar nombre"
      onCancel={onCancel}
      onSubmit={onSubmit}
      {...props}
    >
      <Text>Contenido del formulario</Text>
    </FormSheet>,
  );
  return { ...utils, onCancel, onSubmit };
}

describe('FormSheet', () => {
  it('muestra el título y el contenido', async () => {
    await renderSheet();

    expect(screen.getByText('Editar nombre')).toBeTruthy();
    expect(screen.getByText('Contenido del formulario')).toBeTruthy();
  });

  it('tocar Cancelar ejecuta onCancel', async () => {
    const { onCancel } = await renderSheet();

    await fireEvent.press(screen.getByText('Cancelar'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('tocar Guardar ejecuta onSubmit', async () => {
    const { onSubmit } = await renderSheet();

    await fireEvent.press(screen.getByText('Guardar'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('usa submitLabel cuando se provee', async () => {
    await renderSheet({ submitLabel: 'Crear' });

    expect(screen.getByText('Crear')).toBeTruthy();
    expect(screen.queryByText('Guardar')).toBeNull();
  });
});
