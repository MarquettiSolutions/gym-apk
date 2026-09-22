import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WorkoutSessionStackParamList } from './types';
import { TodayWorkoutScreen } from '../features/workout-session/screens/TodayWorkoutScreen';
import { WorkoutSessionScreen } from '../features/workout-session/screens/WorkoutSessionScreen';
import { RestTimerScreen } from '../features/workout-session/screens/RestTimerScreen';
import { ExerciseDetailScreen } from '../features/exercises/screens/ExerciseDetailScreen';
import { es } from '../shared/i18n/es';

const Stack = createNativeStackNavigator<WorkoutSessionStackParamList>();

export function WorkoutSessionStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TodayWorkout"
        component={TodayWorkoutScreen}
        options={{ title: es.screens.today.title }}
      />
      <Stack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={{ title: es.tabs.today }}
      />
      <Stack.Screen
        name="RestTimer"
        component={RestTimerScreen}
        options={{
          title: es.workoutSession.restTimer.title,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: es.tabs.exercises }}
      />
    </Stack.Navigator>
  );
}
