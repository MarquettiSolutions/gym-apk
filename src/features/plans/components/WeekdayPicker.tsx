import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { WEEKDAY_DISPLAY_ORDER, WEEKDAY_LABELS } from '../constants';

interface WeekdayPickerProps {
  value: number;
  onChange: (weekday: number) => void;
}

export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
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

const styles = StyleSheet.create({
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
    borderColor: '#DDDDDD',
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
