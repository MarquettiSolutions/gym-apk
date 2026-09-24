import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ExercisesStackParamList } from './types';
import { ExercisesScreen } from '../features/exercises/screens/ExercisesScreen';
import { ExerciseDetailScreen } from '../features/exercises/screens/ExerciseDetailScreen';
import { useTranslation } from '../shared/i18n';

const Stack = createNativeStackNavigator<ExercisesStackParamList>();

export function ExercisesStackNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ExercisesList"
        component={ExercisesScreen}
        options={{ title: t.exercises.title }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: t.tabs.exercises }}
      />
    </Stack.Navigator>
  );
}
