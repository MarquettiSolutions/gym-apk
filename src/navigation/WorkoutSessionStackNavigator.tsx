import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WorkoutSessionStackParamList } from './types';
import { TodayWorkoutScreen } from '../features/workout-session/screens/TodayWorkoutScreen';
import { WorkoutSessionScreen } from '../features/workout-session/screens/WorkoutSessionScreen';
import { RestTimerScreen } from '../features/workout-session/screens/RestTimerScreen';
import { ExerciseDetailScreen } from '../features/exercises/screens/ExerciseDetailScreen';
import { useTranslation } from '../shared/i18n';

const Stack = createNativeStackNavigator<WorkoutSessionStackParamList>();

export function WorkoutSessionStackNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TodayWorkout"
        component={TodayWorkoutScreen}
        options={{ title: t.screens.today.title }}
      />
      <Stack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={{ title: t.tabs.today }}
      />
      <Stack.Screen
        name="RestTimer"
        component={RestTimerScreen}
        options={{
          title: t.workoutSession.restTimer.title,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: t.tabs.exercises }}
      />
    </Stack.Navigator>
  );
}
