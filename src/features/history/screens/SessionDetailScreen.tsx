import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HistoryStackParamList } from '../../../navigation/types';
import { useSessionHistoryDetail } from '../hooks/useSessionHistoryDetail';
import { ExerciseThumbnail } from '../../../shared/components/ExerciseThumbnail';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import { formatDateTime } from '../../../shared/utils/dates';
import { convertWeight } from '../../../shared/utils/weight';
import { useSettings } from '../../settings/context/SettingsContext';

type Props = NativeStackScreenProps<HistoryStackParamList, 'SessionDetail'>;

const t = es.history.detail;
const listT = es.history.list;

export function SessionDetailScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { settings } = useSettings();
  const { detail, isLoading } = useSessionHistoryDetail(sessionId);

  if (isLoading || !detail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{es.common.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.dayLabel}>
          {detail.dayLabel ?? listT.deletedPlanLabel}
        </Text>
        <Text style={styles.dateText}>
          {formatDateTime(detail.session.startedAt)}
        </Text>

        {detail.exercises.length === 0 && (
          <Text style={styles.message}>{t.empty}</Text>
        )}

        {detail.exercises.map(({ exercise, sets }) => (
          <View key={exercise.id} style={styles.card}>
            <Pressable
              accessibilityRole="button"
              style={styles.cardHeader}
              onPress={() =>
                navigation.navigate('ExerciseProgress', {
                  exerciseId: exercise.id,
                  exerciseName: exercise.name,
                })
              }
            >
              <ExerciseThumbnail
                localPath={exercise.thumbnailLocalPath}
                remoteUrl={exercise.thumbnailRemoteUrl}
              />
              <Text style={styles.exerciseName}>{exercise.name}</Text>
            </Pressable>

            {sets.map(set => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setLabel}>{t.setLabel(set.setNumber)}</Text>
                {set.skipped ? (
                  <Text style={styles.setValueSkipped}>
                    {t.setSkippedLabel}
                  </Text>
                ) : (
                  <Text style={styles.setValueDone}>
                    {t.setDoneFormat(
                      set.repsDone,
                      set.weightDone !== null
                        ? Math.round(
                            convertWeight(
                              set.weightDone,
                              set.weightUnit as 'kg' | 'lb',
                              settings.weightUnit,
                            ) * 10,
                          ) / 10
                        : null,
                      settings.weightUnit,
                    )}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
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
    },
    dayLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    dateText: {
      fontSize: 13,
      color: colors.muted,
      marginBottom: spacing.md,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    exerciseName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    setRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    setLabel: {
      fontSize: 14,
      color: colors.text,
    },
    setValueDone: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    setValueSkipped: {
      fontSize: 14,
      color: colors.muted,
      fontStyle: 'italic',
    },
  });
}
