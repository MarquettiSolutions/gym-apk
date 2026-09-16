import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';
import { TodayWorkoutScreen } from '../features/workout-session/screens/TodayWorkoutScreen';
import { PlansScreen } from '../features/plans/screens/PlansScreen';
import { ExercisesScreen } from '../features/exercises/screens/ExercisesScreen';
import { HistoryScreen } from '../features/history/screens/HistoryScreen';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { es } from '../shared/i18n/es';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="TodayWorkout"
        component={TodayWorkoutScreen}
        options={{ title: es.tabs.today }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{ title: es.tabs.plans }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{ title: es.tabs.exercises }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: es.tabs.history }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: es.tabs.settings }}
      />
    </Tab.Navigator>
  );
}
