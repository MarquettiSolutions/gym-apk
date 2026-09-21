import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SwipeableCard } from '../SwipeableCard';

// Reanimated/worklets necesitan el módulo nativo y no corren en Jest, y el
// gesto de deslizar no se puede simular acá. Se sustituye solo el contenedor
// por uno que pinta los hijos y las acciones; lo que se prueba es la lógica de
// SwipeableCard (acciones, accesibilidad, onPress), no la física del swipe.
jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const ReactActual = require('react');
  const { View } = require('react-native');
  function MockSwipeable({
    children,
    renderRightActions,
    containerStyle,
    ref,
  }: {
    children: React.ReactNode;
    renderRightActions?: () => React.ReactNode;
    containerStyle?: object;
    ref?: React.Ref<unknown>;
  }) {
    ReactActual.useImperativeHandle(ref, () => ({ close: jest.fn() }));
    return ReactActual.createElement(
      View,
      { style: containerStyle },
      children,
      renderRightActions?.(),
    );
  }
  return { __esModule: true, default: MockSwipeable };
});

jest.mock('../../theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: require('../../theme/colors').palette.light,
    spacing: require('../../theme/spacing').spacing,
    isDark: false,
  }),
}));

const hidden = { includeHiddenElements: true };

async function renderCard(
  props: Partial<React.ComponentProps<typeof SwipeableCard>> = {},
) {
  const onDuplicate = jest.fn();
  const onDelete = jest.fn();
  const utils = await render(
    <SwipeableCard
      accessibilityLabel="Plan Fuerza"
      actions={[
        { key: 'duplicate', label: 'Duplicar', onPress: onDuplicate },
        {
          key: 'delete',
          label: 'Eliminar',
          variant: 'danger',
          onPress: onDelete,
        },
      ]}
      {...props}
    >
      <Text>Contenido de la tarjeta</Text>
    </SwipeableCard>,
  );
  return { ...utils, onDuplicate, onDelete };
}

describe('SwipeableCard', () => {
  it('muestra su contenido', async () => {
    await renderCard();

    expect(screen.getByText('Contenido de la tarjeta')).toBeTruthy();
  });

  it('tocar una acción revelada ejecuta su handler', async () => {
    const { onDuplicate, onDelete } = await renderCard();

    await fireEvent.press(screen.getByText('Duplicar', hidden));

    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('expone las mismas acciones como acciones de accesibilidad de la tarjeta', async () => {
    const { onDelete } = await renderCard();

    const card = screen.getByLabelText('Plan Fuerza');
    expect(card.props.accessibilityActions).toEqual([
      { name: 'duplicate', label: 'Duplicar' },
      { name: 'delete', label: 'Eliminar' },
    ]);

    await fireEvent(card, 'accessibilityAction', {
      nativeEvent: { actionName: 'delete' },
    });
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('oculta a los lectores de pantalla los botones deslizables para no duplicarlos', async () => {
    await renderCard();

    // Sin includeHiddenElements no debería encontrarlos: solo debe existir la
    // acción de accesibilidad de la tarjeta, no un segundo botón "Duplicar".
    expect(screen.queryByText('Duplicar')).toBeNull();
    expect(screen.getByText('Duplicar', hidden)).toBeTruthy();
  });

  it('con enabled=false no expone acciones ni etiqueta la tarjeta', async () => {
    await renderCard({ enabled: false });

    expect(screen.queryByLabelText('Plan Fuerza')).toBeNull();
    expect(screen.getByText('Contenido de la tarjeta')).toBeTruthy();
  });

  it('propaga onPress de la tarjeta', async () => {
    const onPress = jest.fn();
    await renderCard({ onPress });

    await fireEvent.press(screen.getByLabelText('Plan Fuerza'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
