import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { WEEKDAY_DISPLAY_ORDER, WEEKDAY_LABELS } from '../constants';

interface WeekdayPickerProps {
  value: number;
  onChange: (weekday: number) => void;
}

export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      {WEEKDAY_DISPLAY_ORDER.map(weekday => {
        const selected = weekday === value;
        const label = WEEKDAY_LABELS[weekday];
        return (
          <Pressable
            key={weekday}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            onPress={() => onChange(weekday)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text
              style={[styles.chipLabel, selected && styles.chipLabelSelected]}
            >
              {label.slice(0, 3)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    chip: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipLabel: {
      fontSize: 13,
      color: colors.text,
    },
    chipLabelSelected: {
      color: colors.onPrimary,
      fontWeight: '600',
    },
  });
}
