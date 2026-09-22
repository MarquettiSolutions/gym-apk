import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { RootTabParamList } from './types';
import { WorkoutSessionStackNavigator } from './WorkoutSessionStackNavigator';
import { PlansStackNavigator } from './PlansStackNavigator';
import { ExercisesScreen } from '../features/exercises/screens/ExercisesScreen';
import { HistoryStackNavigator } from './HistoryStackNavigator';
import { SettingsScreen } from '../features/settings/screens/SettingsScreen';
import { es } from '../shared/i18n/es';

const Tab = createBottomTabNavigator<RootTabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Relleno cuando la tab está activa, contorno cuando no — el color lo pone
// React Navigation a partir de `colors.primary` del tema.
function tabIcon(active: IconName, inactive: IconName) {
  return ({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: string;
    size: number;
  }) => (
    <Ionicons name={focused ? active : inactive} color={color} size={size} />
  );
}

export function RootTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="TodayTab"
        component={WorkoutSessionStackNavigator}
        options={{
          title: es.tabs.today,
          tabBarIcon: tabIcon('today', 'today-outline'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansStackNavigator}
        options={{
          title: es.tabs.plans,
          tabBarIcon: tabIcon('clipboard', 'clipboard-outline'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          title: es.tabs.exercises,
          tabBarIcon: tabIcon('barbell', 'barbell-outline'),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStackNavigator}
        options={{
          title: es.tabs.history,
          tabBarIcon: tabIcon('time', 'time-outline'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: es.tabs.settings,
          tabBarIcon: tabIcon('settings', 'settings-outline'),
        }}
      />
    </Tab.Navigator>
  );
}
