import React, { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Swipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export interface SwipeAction {
  key: string;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
}

interface SwipeableCardProps {
  actions: SwipeAction[];
  // Lo que un lector de pantalla anuncia al enfocar la tarjeta, ya que sus
  // botones no están a la vista hasta deslizar.
  accessibilityLabel: string;
  accessibilityHint?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  // Apaga el swipe y las acciones de accesibilidad (p. ej. en modo selección
  // o mientras se arrastra); los hijos vuelven a ser enfocables por separado.
  enabled?: boolean;
  // Margen exterior: envuelve tanto la tarjeta como el panel de acciones.
  style?: StyleProp<ViewStyle>;
  // Apariencia de la tarjeta (fondo opaco, padding, bordes). Debe tener fondo
  // sólido, si no el panel de acciones se transparenta detrás.
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const ACTION_MIN_WIDTH = 72;

export function SwipeableCard({
  actions,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  onLongPress,
  enabled = true,
  style,
  contentStyle,
  children,
}: SwipeableCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const swipeableRef = useRef<SwipeableMethods>(null);
  // El panel vive detrás de la tarjeta; con las esquinas redondeadas de esta se
  // asoma un borde del color de las acciones aun estando cerrada. Se mantiene
  // invisible hasta que empieza el gesto.
  const [isRevealed, setRevealed] = useState(false);
  const hasActions = enabled && actions.length > 0;

  function runAction(action: SwipeAction) {
    swipeableRef.current?.close();
    action.onPress();
  }

  function handleAccessibilityAction(event: AccessibilityActionEvent) {
    const action = actions.find(a => a.key === event.nativeEvent.actionName);
    if (action) {
      action.onPress();
    }
  }

  function renderRightActions() {
    return (
      <View
        style={[styles.actionsRow, !isRevealed && styles.actionsHidden]}
        // Las mismas acciones ya se exponen como accessibilityActions de la
        // tarjeta; sin esto un lector de pantalla las encontraría dos veces.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {actions.map(action => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => runAction(action)}
            style={({ pressed }) => [
              styles.action,
              action.variant === 'danger'
                ? styles.actionDanger
                : styles.actionDefault,
              pressed && styles.actionPressed,
            ]}
          >
            <Text
              style={[
                styles.actionLabel,
                action.variant === 'danger'
                  ? styles.actionLabelDanger
                  : styles.actionLabelDefault,
              ]}
              numberOfLines={1}
            >
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      enabled={hasActions}
      containerStyle={style}
      overshootRight={false}
      friction={2}
      rightThreshold={ACTION_MIN_WIDTH / 2}
      onSwipeableCloseStartDrag={() => setRevealed(true)}
      onSwipeableWillOpen={() => setRevealed(true)}
      onSwipeableClose={() => setRevealed(false)}
      renderRightActions={renderRightActions}
    >
      <Pressable
        accessible={hasActions ? true : undefined}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={hasActions ? accessibilityLabel : undefined}
        accessibilityHint={hasActions ? accessibilityHint : undefined}
        accessibilityActions={
          hasActions
            ? actions.map(a => ({ name: a.key, label: a.label }))
            : undefined
        }
        onAccessibilityAction={handleAccessibilityAction}
        onPress={onPress}
        onLongPress={onLongPress}
        style={contentStyle}
      >
        {children}
      </Pressable>
    </Swipeable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    actionsRow: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      borderRadius: 12,
      overflow: 'hidden',
    },
    actionsHidden: {
      opacity: 0,
    },
    action: {
      minWidth: ACTION_MIN_WIDTH,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionDefault: {
      backgroundColor: colors.accentSoft,
    },
    actionDanger: {
      backgroundColor: colors.danger,
    },
    actionPressed: {
      opacity: 0.75,
    },
    actionLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    actionLabelDefault: {
      color: colors.primary,
    },
    actionLabelDanger: {
      color: colors.onPrimary,
    },
  });
}
