import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ExercisesStackParamList } from './types';
import { ExercisesScreen } from '../features/exercises/screens/ExercisesScreen';
import { ExerciseDetailScreen } from '../features/exercises/screens/ExerciseDetailScreen';
import { es } from '../shared/i18n/es';

const Stack = createNativeStackNavigator<ExercisesStackParamList>();

export function ExercisesStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExercisesList"
        component={ExercisesScreen}
        options={{ title: es.exercises.title }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: es.tabs.exercises }}
      />
    </Stack.Navigator>
  );
}
