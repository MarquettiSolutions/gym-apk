import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootTabNavigator } from '../navigation/RootTabNavigator';
import { initDatabase } from '../db/client';
import { LanguageProvider, useTranslation } from '../shared/i18n';
import { SettingsProvider } from '../features/settings/context/SettingsContext';
import { ThemeProvider, useTheme } from '../shared/theme/ThemeContext';
import {
  darkNavigationTheme,
  lightNavigationTheme,
} from '../shared/theme/navigationTheme';

function LoadingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={[styles.loadingContainer, { backgroundColor: colors.background }]}
    >
      <Text style={{ color: colors.text }}>{t.common.loading}</Text>
    </View>
  );
}

function AppContent({ isDbReady }: { isDbReady: boolean }) {
  const { isDark } = useTheme();

  if (!isDbReady) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <NavigationContainer
          theme={isDark ? darkNavigationTheme : lightNavigationTheme}
        >
          <RootTabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setIsDbReady(true));
  }, []);

  return (
    <SettingsProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppContent isDbReady={isDbReady} />
        </ThemeProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
