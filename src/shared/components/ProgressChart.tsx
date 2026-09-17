import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export interface ProgressChartPoint {
  label: string;
  value: number;
}

interface ProgressChartProps {
  points: ProgressChartPoint[];
  formatValue?: (value: number) => string;
  height?: number;
}

// Gráfico de barras simple hecho solo con Views (sin librería de gráficos:
// spec 6 pide cuidar el tamaño de la APK). La escala usa el rango real de
// los valores (no arranca en 0) para que se note la variación entre
// registros cercanos, como el peso corporal o el peso levantado.
export function ProgressChart({
  points,
  formatValue = value => `${value}`,
  height = 140,
}: ProgressChartProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const values = points.map(p => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const padding = range * 0.15;
  const scaleMin = min - padding;
  const scaleRange = max + padding - scaleMin || 1;

  return (
    <View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryValue}>
          {formatValue(values[values.length - 1] ?? 0)}
        </Text>
        <Text style={styles.summaryHint}>
          {formatValue(min)} – {formatValue(max)}
        </Text>
      </View>
      <View style={[styles.chart, { height }]}>
        {points.map((point, index) => {
          const barHeight = Math.max(
            4,
            ((point.value - scaleMin) / scaleRange) * height,
          );
          return (
            <View key={`${point.label}-${index}`} style={styles.barColumn}>
              <View style={[styles.bar, { height: barHeight }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>{points[0]?.label ?? ''}</Text>
        {points.length > 1 && (
          <Text style={styles.axisLabel}>
            {points[points.length - 1]?.label ?? ''}
          </Text>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    summaryValue: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    summaryHint: {
      fontSize: 12,
      color: colors.muted,
    },
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    barColumn: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    bar: {
      width: '100%',
      minHeight: 4,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      backgroundColor: colors.primary,
    },
    axisRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    axisLabel: {
      fontSize: 11,
      color: colors.muted,
    },
  });
}
