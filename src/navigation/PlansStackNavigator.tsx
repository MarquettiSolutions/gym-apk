import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PlansStackParamList } from './types';
import { PlansScreen } from '../features/plans/screens/PlansScreen';
import { PlanEditorScreen } from '../features/plans/screens/PlanEditorScreen';
import { DayEditorScreen } from '../features/plans/screens/DayEditorScreen';
import { ExercisePickerScreen } from '../features/plans/screens/ExercisePickerScreen';
import { es } from '../shared/i18n/es';

const Stack = createNativeStackNavigator<PlansStackParamList>();

export function PlansStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PlansList"
        component={PlansScreen}
        options={{ title: es.plans.list.title }}
      />
      <Stack.Screen
        name="PlanEditor"
        component={PlanEditorScreen}
        options={{ title: es.tabs.plans }}
      />
      <Stack.Screen
        name="DayEditor"
        component={DayEditorScreen}
        options={{ title: es.plans.dayEditor.editDayTitle }}
      />
      <Stack.Screen
        name="ExercisePicker"
        component={ExercisePickerScreen}
        options={{ title: es.plans.exercisePicker.title }}
      />
    </Stack.Navigator>
  );
}
