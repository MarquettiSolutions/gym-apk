import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HistoryStackParamList } from '../../../navigation/types';
import { useExerciseProgress } from '../hooks/useExerciseProgress';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { ProgressChart } from '../../../shared/components/ProgressChart';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import { formatShortDate, formatDateTime } from '../../../shared/utils/dates';

type Props = NativeStackScreenProps<HistoryStackParamList, 'ExerciseProgress'>;

const t = es.history.exerciseProgress;

export function ExerciseProgressScreen({ route, navigation }: Props) {
  const { exerciseId, exerciseName } = route.params;
  const userId = useLocalUserId();
  const { progress, isLoading } = useExerciseProgress(userId, exerciseId);

  useEffect(() => {
    navigation.setOptions({ title: exerciseName });
  }, [navigation, exerciseName]);

  if (isLoading || !progress) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{es.common.loading}</Text>
      </View>
    );
  }

  if (progress.points.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{t.empty}</Text>
      </View>
    );
  }

  const hasWeightData = progress.points.some(p => p.weightDone !== null);
  const chartPoints = progress.points.map(point => ({
    label: formatShortDate(point.date),
    value: hasWeightData ? point.weightDone ?? 0 : point.repsDone ?? 0,
  }));
  const formatValue = (value: number) =>
    hasWeightData ? `${value} ${t.weightUnit}` : `${value} reps`;

  return (
    <ScrollView contentContainerStyle={styles.listContent}>
      <View style={styles.chartCard}>
        <ProgressChart points={chartPoints} formatValue={formatValue} />
      </View>

      {[...progress.points].reverse().map((point, index) => (
        <View key={`${point.date}-${index}`} style={styles.row}>
          <Text style={styles.rowDate}>{formatDateTime(point.date)}</Text>
          <Text style={styles.rowValue}>
            {point.weightDone !== null
              ? `${point.repsDone ?? 0} reps x ${point.weightDone} ${
                  t.weightUnit
                }`
              : `${point.repsDone ?? 0} reps`}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  message: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  chartCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  rowDate: {
    fontSize: 13,
    color: colors.muted,
  },
  rowValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
});
