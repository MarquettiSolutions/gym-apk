import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PlansStackParamList } from './types';
import { PlansScreen } from '../features/plans/screens/PlansScreen';
import { PlanEditorScreen } from '../features/plans/screens/PlanEditorScreen';
import { DayEditorScreen } from '../features/plans/screens/DayEditorScreen';
import { ExercisePickerScreen } from '../features/plans/screens/ExercisePickerScreen';
import { ExerciseDetailScreen } from '../features/exercises/screens/ExerciseDetailScreen';
import { useTranslation } from '../shared/i18n';

const Stack = createNativeStackNavigator<PlansStackParamList>();

export function PlansStackNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PlansList"
        component={PlansScreen}
        options={{ title: t.plans.list.title }}
      />
      <Stack.Screen
        name="PlanEditor"
        component={PlanEditorScreen}
        options={{ title: t.tabs.plans }}
      />
      <Stack.Screen
        name="DayEditor"
        component={DayEditorScreen}
        options={{ title: t.plans.dayEditor.editDayTitle }}
      />
      <Stack.Screen
        name="ExercisePicker"
        component={ExercisePickerScreen}
        options={{ title: t.plans.exercisePicker.title }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: t.tabs.exercises }}
      />
    </Stack.Navigator>
  );
}
