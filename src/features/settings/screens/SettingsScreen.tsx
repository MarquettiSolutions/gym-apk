import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSettings } from '../context/SettingsContext';
import { backupService } from '../services';
import { Button } from '../../../shared/components/Button';
import { TextField } from '../../../shared/components/TextField';
import { SegmentedControl } from '../../../shared/components/SegmentedControl';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import type { ThemePreference, WeightUnit } from '../types';

const t = es.settings;

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function SettingsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { settings, updateSetting, reload } = useSettings();
  const [restSecondsText, setRestSecondsText] = useState(
    String(settings.defaultRestSeconds),
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPickingTime, setIsPickingTime] = useState(false);

  function commitRestSeconds() {
    const parsed = parseInt(restSecondsText, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      updateSetting('defaultRestSeconds', parsed);
    } else {
      setRestSecondsText(String(settings.defaultRestSeconds));
    }
  }

  function handleTimeChange(event: DateTimePickerEvent, date?: Date) {
    setIsPickingTime(false);
    if (event.type !== 'set' || !date) {
      return;
    }
    updateSetting('dailyReminderHour', date.getHours());
    updateSetting('dailyReminderMinute', date.getMinutes());
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const savedUri = await backupService.exportBackupToFile();
      if (savedUri !== null) {
        Alert.alert(t.exportSuccessTitle, t.exportSuccessMessage);
      }
    } catch {
      Alert.alert(t.exportErrorTitle, t.exportErrorMessage);
    } finally {
      setIsExporting(false);
    }
  }

  function handleImport() {
    Alert.alert(t.importConfirmTitle, t.importConfirmMessage, [
      { text: es.common.cancel, style: 'cancel' },
      { text: t.importConfirmButton, onPress: runImport },
    ]);
  }

  async function runImport() {
    setIsImporting(true);
    try {
      const result = await backupService.importBackupFromPicker();
      if (result === null) {
        return;
      }
      await reload();
      const message =
        result.skippedExerciseRefs > 0
          ? `${t.importSuccessMessage} ${t.importSkippedMessage(
              result.skippedExerciseRefs,
            )}`
          : t.importSuccessMessage;
      Alert.alert(t.importSuccessTitle, message);
    } catch {
      Alert.alert(t.importErrorTitle, t.importErrorMessage);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Section title={t.sections.training}>
        <TextField
          label={t.defaultRestSecondsLabel}
          keyboardType="number-pad"
          value={restSecondsText}
          onChangeText={setRestSecondsText}
          onEndEditing={commitRestSeconds}
          onBlur={commitRestSeconds}
        />
      </Section>

      <Section title={t.sections.weight}>
        <SegmentedControl<WeightUnit>
          accessibilityLabel={t.weightUnitLabel}
          value={settings.weightUnit}
          onChange={value => updateSetting('weightUnit', value)}
          options={[
            { value: 'kg', label: t.weightUnitOptions.kg },
            { value: 'lb', label: t.weightUnitOptions.lb },
          ]}
        />
      </Section>

      <Section title={t.sections.appearance}>
        <SegmentedControl<ThemePreference>
          accessibilityLabel={t.themeLabel}
          value={settings.theme}
          onChange={value => updateSetting('theme', value)}
          options={[
            { value: 'light', label: t.themeOptions.light },
            { value: 'dark', label: t.themeOptions.dark },
            { value: 'system', label: t.themeOptions.system },
          ]}
        />
      </Section>

      <Section title={t.sections.timer}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t.timerSoundLabel}</Text>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel={t.timerSoundLabel}
            accessibilityState={{ checked: settings.timerSoundEnabled }}
            value={settings.timerSoundEnabled}
            onValueChange={value => updateSetting('timerSoundEnabled', value)}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t.timerVibrationLabel}</Text>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel={t.timerVibrationLabel}
            accessibilityState={{ checked: settings.timerVibrationEnabled }}
            value={settings.timerVibrationEnabled}
            onValueChange={value =>
              updateSetting('timerVibrationEnabled', value)
            }
            trackColor={{ true: colors.primary }}
          />
        </View>
      </Section>

      <Section title={t.sections.notifications}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t.dailyReminderLabel}</Text>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel={t.dailyReminderLabel}
            accessibilityState={{ checked: settings.dailyReminderEnabled }}
            value={settings.dailyReminderEnabled}
            onValueChange={value =>
              updateSetting('dailyReminderEnabled', value)
            }
            trackColor={{ true: colors.primary }}
          />
        </View>
        {settings.dailyReminderEnabled ? (
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t.dailyReminderTimeLabel}</Text>
            <Button
              label={t.dailyReminderTimeFormat(
                settings.dailyReminderHour,
                settings.dailyReminderMinute,
              )}
              variant="secondary"
              onPress={() => setIsPickingTime(true)}
            />
          </View>
        ) : null}
        {isPickingTime ? (
          <DateTimePicker
            value={
              new Date(
                2000,
                0,
                1,
                settings.dailyReminderHour,
                settings.dailyReminderMinute,
              )
            }
            mode="time"
            is24Hour
            onChange={handleTimeChange}
          />
        ) : null}
      </Section>

      <Section title={t.sections.data}>
        <Text style={styles.hint}>{t.exportHint}</Text>
        <View style={styles.actionButton}>
          <Button
            label={t.exportButton}
            variant="secondary"
            loading={isExporting}
            onPress={handleExport}
          />
        </View>
        <Text style={styles.hint}>{t.importHint}</Text>
        <View style={styles.actionButton}>
          <Button
            label={t.importButton}
            variant="secondary"
            loading={isImporting}
            onPress={handleImport}
          />
        </View>
      </Section>
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.muted,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    switchLabel: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    hint: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: spacing.sm,
    },
    actionButton: {
      marginBottom: spacing.md,
    },
  });
}
