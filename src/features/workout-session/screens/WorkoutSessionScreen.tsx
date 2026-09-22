import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WorkoutSessionStackParamList } from '../../../navigation/types';
import { useSessionDetail } from '../hooks/useSessionDetail';
import { workoutSessionService } from '../services';
import { Button } from '../../../shared/components/Button';
import { ExerciseThumbnail } from '../../../shared/components/ExerciseThumbnail';
import { FormSheet } from '../../../shared/components/FormSheet';
import {
  SetRegistrationForm,
  type SetRegistrationValues,
} from '../components/SetRegistrationForm';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import { useSettings } from '../../settings/context/SettingsContext';
import { convertWeight } from '../../../shared/utils/weight';
import { shouldSkipRestAfterSet } from '../utils/supersetRest';
import type { ExerciseProgress } from '../types';

type Props = NativeStackScreenProps<
  WorkoutSessionStackParamList,
  'WorkoutSession'
>;

const t = es.workoutSession.session;

interface RegisteringSet {
  exerciseProgress: ExerciseProgress;
  setNumber: number;
}

function suggestedValues(
  exerciseProgress: ExerciseProgress,
  setNumber: number,
): SetRegistrationValues {
  const current = exerciseProgress.sets.find(
    s => s.setNumber === setNumber,
  )?.latest;
  if (current && !current.skipped) {
    return { repsDone: current.repsDone, weightDone: current.weightDone };
  }
  if (exerciseProgress.suggestion) {
    return {
      repsDone: exerciseProgress.suggestion.repsDone,
      weightDone: exerciseProgress.suggestion.weightDone,
    };
  }
  return {
    repsDone: exerciseProgress.planDayExercise.targetReps,
    weightDone: exerciseProgress.planDayExercise.targetWeight,
  };
}

export function WorkoutSessionScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { settings } = useSettings();
  const { detail, isLoading, reload } = useSessionDetail(sessionId);

  const [registeringSet, setRegisteringSet] = useState<RegisteringSet | null>(
    null,
  );
  const [formValues, setFormValues] = useState<SetRegistrationValues>({
    repsDone: null,
    weightDone: null,
  });

  function openRegisterSheet(
    exerciseProgress: ExerciseProgress,
    setNumber: number,
  ) {
    setFormValues(suggestedValues(exerciseProgress, setNumber));
    setRegisteringSet({ exerciseProgress, setNumber });
  }

  async function handleSubmitSet() {
    if (!registeringSet) {
      return;
    }
    const { exerciseProgress, setNumber } = registeringSet;
    await workoutSessionService.recordSet(
      sessionId,
      exerciseProgress.planDayExercise,
      exerciseProgress.exercise.id,
      setNumber,
      {
        repsDone: formValues.repsDone,
        weightDone: formValues.weightDone,
        weightUnit: settings.weightUnit,
        skipped: false,
      },
    );
    const restSeconds = exerciseProgress.planDayExercise.restSeconds;
    const groupId = exerciseProgress.planDayExercise.supersetGroupId;
    const groupMembers = groupId
      ? (detail?.exercises ?? []).filter(
          e => e.planDayExercise.supersetGroupId === groupId,
        )
      : [];
    const skipRest =
      groupId !== null &&
      shouldSkipRestAfterSet(
        groupMembers,
        exerciseProgress.planDayExercise.id,
        setNumber,
      );
    setRegisteringSet(null);
    await reload();
    if (skipRest) {
      return;
    }
    navigation.navigate('RestTimer', { seconds: restSeconds });
  }

  function handleSkipExercise(exerciseProgress: ExerciseProgress) {
    Alert.alert(t.skipExerciseConfirmTitle, t.skipExerciseConfirmMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.common.confirmDeleteButton,
        style: 'destructive',
        onPress: async () => {
          await workoutSessionService.skipRemainingSets(
            sessionId,
            exerciseProgress,
          );
          await reload();
        },
      },
    ]);
  }

  async function doFinish() {
    await workoutSessionService.finishSession(sessionId);
    navigation.navigate('TodayWorkout');
  }

  function handleFinish() {
    const allAccountedFor = (detail?.exercises ?? []).every(ep =>
      ep.sets.every(s => s.latest !== null),
    );
    if (allAccountedFor) {
      doFinish();
      return;
    }
    Alert.alert(t.finishConfirmTitle, t.finishConfirmMessage, [
      { text: es.common.cancel, style: 'cancel' },
      { text: t.finishConfirmButton, onPress: doFinish },
    ]);
  }

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
        {detail.exercises.length === 0 && (
          <Text style={styles.message}>{t.emptySession}</Text>
        )}
        {detail.exercises.map(exerciseProgress => (
          <View key={exerciseProgress.planDayExercise.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Pressable
                accessibilityRole="button"
                style={styles.cardHeaderPressable}
                onPress={() =>
                  navigation.navigate('ExerciseDetail', {
                    exerciseId: exerciseProgress.exercise.id,
                  })
                }
              >
                <ExerciseThumbnail
                  localPath={exerciseProgress.exercise.thumbnailLocalPath}
                  remoteUrl={exerciseProgress.exercise.thumbnailRemoteUrl}
                />
                <View style={styles.cardHeaderInfo}>
                  {exerciseProgress.planDayExercise.supersetGroupId ? (
                    <Text style={styles.supersetBadge}>
                      {es.plans.dayEditor.supersetBadgeLabel}
                    </Text>
                  ) : null}
                  <Text style={styles.exerciseName}>
                    {exerciseProgress.exercise.name}
                  </Text>
                </View>
              </Pressable>
              <Button
                label={t.skipExerciseButton}
                variant="secondary"
                onPress={() => handleSkipExercise(exerciseProgress)}
              />
            </View>

            {exerciseProgress.sets.map(setProgress => {
              const { latest } = setProgress;
              return (
                <Pressable
                  key={setProgress.setNumber}
                  accessibilityRole="button"
                  style={styles.setRow}
                  onPress={() =>
                    openRegisterSheet(exerciseProgress, setProgress.setNumber)
                  }
                >
                  <Text style={styles.setLabel}>
                    {t.setLabel(setProgress.setNumber)}
                  </Text>
                  {latest && !latest.skipped ? (
                    <Text style={styles.setValueDone}>
                      {t.setDoneFormat(
                        latest.repsDone,
                        latest.weightDone !== null
                          ? Math.round(
                              convertWeight(
                                latest.weightDone,
                                latest.weightUnit as 'kg' | 'lb',
                                settings.weightUnit,
                              ) * 10,
                            ) / 10
                          : null,
                        settings.weightUnit,
                      )}
                    </Text>
                  ) : latest?.skipped ? (
                    <Text style={styles.setValueSkipped}>
                      {t.setSkippedLabel}
                    </Text>
                  ) : (
                    <Text style={styles.setValuePending}>
                      {t.setPendingButton}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button label={t.finishButton} onPress={handleFinish} />
      </View>

      <FormSheet
        visible={registeringSet !== null}
        title={t.registerSetTitle}
        onCancel={() => setRegisteringSet(null)}
        onSubmit={handleSubmitSet}
        submitLabel={t.markDoneButton}
      >
        <SetRegistrationForm values={formValues} onChange={setFormValues} />
      </FormSheet>
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
    cardHeaderPressable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cardHeaderInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    supersetBadge: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      marginBottom: 2,
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
    setValuePending: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}
