import React, { useState } from 'react';
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
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import { DEFAULT_WEIGHT_UNIT } from '../constants';
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
        weightUnit: DEFAULT_WEIGHT_UNIT,
        skipped: false,
      },
    );
    const restSeconds = exerciseProgress.planDayExercise.restSeconds;
    setRegisteringSet(null);
    await reload();
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
              <ExerciseThumbnail
                localPath={exerciseProgress.exercise.thumbnailLocalPath}
                remoteUrl={exerciseProgress.exercise.thumbnailRemoteUrl}
              />
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.exerciseName}>
                  {exerciseProgress.exercise.name}
                </Text>
              </View>
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
                        latest.weightDone,
                        latest.weightUnit,
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

const styles = StyleSheet.create({
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
    backgroundColor: '#F7F7F7',
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
  cardHeaderInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
    borderTopColor: '#EEEEEE',
  },
});
