import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HistoryStackParamList } from './types';
import { HistoryScreen } from '../features/history/screens/HistoryScreen';
import { SessionDetailScreen } from '../features/history/screens/SessionDetailScreen';
import { ExerciseProgressScreen } from '../features/history/screens/ExerciseProgressScreen';
import { BodyWeightScreen } from '../features/history/screens/BodyWeightScreen';
import { es } from '../shared/i18n/es';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: es.history.list.title }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{ title: es.history.detail.title }}
      />
      <Stack.Screen
        name="ExerciseProgress"
        component={ExerciseProgressScreen}
        options={{ title: es.history.exerciseProgress.title }}
      />
      <Stack.Screen
        name="BodyWeight"
        component={BodyWeightScreen}
        options={{ title: es.bodyWeight.title }}
      />
    </Stack.Navigator>
  );
}
