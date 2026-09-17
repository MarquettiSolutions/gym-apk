import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from './types';
import { WorkoutSessionStackNavigator } from './WorkoutSessionStackNavigator';
import { PlansStackNavigator } from './PlansStackNavigator';
import { ExercisesScreen } from '../features/exercises/screens/ExercisesScreen';
import { HistoryStackNavigator } from './HistoryStackNavigator';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { es } from '../shared/i18n/es';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="TodayWorkout"
        component={WorkoutSessionStackNavigator}
        options={{ title: es.tabs.today, headerShown: false }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansStackNavigator}
        options={{ title: es.tabs.plans, headerShown: false }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{ title: es.tabs.exercises }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStackNavigator}
        options={{ title: es.tabs.history, headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: es.tabs.settings }}
      />
    </Tab.Navigator>
  );
}
