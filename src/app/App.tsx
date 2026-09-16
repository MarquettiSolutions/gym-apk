import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootTabNavigator } from '../navigation/RootTabNavigator';
import { initDatabase } from '../db/client';
import { es } from '../shared/i18n/es';
import { colors } from '../shared/theme/colors';

export function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setIsDbReady(true));
  }, []);

  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{es.common.loading}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default App;
