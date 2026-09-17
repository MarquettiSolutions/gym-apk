import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WorkoutSessionStackParamList } from '../../../navigation/types';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { useTodayWorkout } from '../hooks/useTodayWorkout';
import { workoutSessionService } from '../services';
import { Button } from '../../../shared/components/Button';
import { ExerciseThumbnail } from '../../../shared/components/ExerciseThumbnail';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';

type Props = NativeStackScreenProps<
  WorkoutSessionStackParamList,
  'TodayWorkout'
>;

const t = es.workoutSession.today;
const dayEditorT = es.plans.dayEditor;

export function TodayWorkoutScreen({ navigation }: Props) {
  const userId = useLocalUserId();
  const { workout, isLoading, reload } = useTodayWorkout(userId);
  const [isStarting, setIsStarting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => {
    navigation.setOptions({
      title:
        workout?.status === 'ready' && workout.day.label
          ? workout.day.label
          : es.screens.today.title,
    });
  }, [workout, navigation]);

  async function handleStart() {
    if (!userId || workout?.status !== 'ready') {
      return;
    }
    setIsStarting(true);
    const session = await workoutSessionService.startSession(
      userId,
      workout.day.id,
    );
    setIsStarting(false);
    navigation.navigate('WorkoutSession', { sessionId: session.id });
  }

  if (isLoading || !workout) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{es.common.loading}</Text>
      </View>
    );
  }

  if (workout.status === 'no-active-plan') {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{t.noActivePlanMessage}</Text>
      </View>
    );
  }

  if (workout.status === 'rest-day') {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{t.restDayMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={workout.exercises}
        keyExtractor={item => item.planDayExercise.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ExerciseThumbnail
              localPath={item.exercise.thumbnailLocalPath}
              remoteUrl={item.exercise.thumbnailRemoteUrl}
            />
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.exercise.name}</Text>
              <Text style={styles.rowMeta}>
                {dayEditorT.setsRepsFormat(
                  item.planDayExercise.targetSets,
                  item.planDayExercise.targetReps,
                )}
                {item.planDayExercise.targetWeight !== null
                  ? ` · ${dayEditorT.weightFormat(
                      item.planDayExercise.targetWeight,
                    )}`
                  : ''}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Button
          label={workout.existingSessionId ? t.continueButton : t.startButton}
          onPress={handleStart}
          loading={isStarting}
        />
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowMeta: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
});
