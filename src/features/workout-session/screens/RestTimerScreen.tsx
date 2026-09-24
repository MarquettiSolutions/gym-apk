import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WorkoutSessionStackParamList } from '../../../navigation/types';
import { useRestTimer } from '../hooks/useRestTimer';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { useTranslation } from '../../../shared/i18n';
import { REST_TIMER_STEP_SECONDS } from '../constants';
import { formatMinutesSeconds } from '../utils/restTimer';
import { useSettings } from '../../settings/context/SettingsContext';

type Props = NativeStackScreenProps<WorkoutSessionStackParamList, 'RestTimer'>;

export function RestTimerScreen({ route, navigation }: Props) {
  const { seconds } = route.params;
  const { colors } = useTheme();
  const { t: translations } = useTranslation();
  const t = translations.workoutSession.restTimer;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { settings } = useSettings();

  // Al terminar el descanso (o si el usuario lo salta) volvemos directo a la
  // pantalla de la sesión; no hay nada más que mostrar en esta pantalla.
  const handleFinish = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const timer = useRestTimer({
    initialSeconds: seconds,
    onFinish: handleFinish,
    soundEnabled: settings.timerSoundEnabled,
    vibrationEnabled: settings.timerVibrationEnabled,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.countdown}>
        {formatMinutesSeconds(timer.remainingSeconds)}
      </Text>

      <View style={styles.stepRow}>
        <View style={styles.stepButton}>
          <Button
            label={t.subtractSecondsButton(REST_TIMER_STEP_SECONDS)}
            variant="secondary"
            onPress={() => timer.addSeconds(-REST_TIMER_STEP_SECONDS)}
          />
        </View>
        <View style={styles.stepButton}>
          <Button
            label={t.addSecondsButton(REST_TIMER_STEP_SECONDS)}
            variant="secondary"
            onPress={() => timer.addSeconds(REST_TIMER_STEP_SECONDS)}
          />
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.mainButton}>
          <Button
            label={timer.isPaused ? t.resumeButton : t.pauseButton}
            variant="secondary"
            onPress={timer.isPaused ? timer.resume : timer.pause}
          />
        </View>
        <View style={styles.mainButton}>
          <Button label={t.skipButton} onPress={timer.skip} />
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    countdown: {
      fontSize: 64,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xl,
    },
    stepRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    stepButton: {
      minWidth: 90,
    },
    mainRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    mainButton: {
      minWidth: 140,
    },
  });
}
