import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useBodyWeight } from '../hooks/useBodyWeight';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { bodyWeightService } from '../services';
import { Button } from '../../../shared/components/Button';
import { SwipeableCard } from '../../../shared/components/SwipeableCard';
import { TextField } from '../../../shared/components/TextField';
import { FormSheet } from '../../../shared/components/FormSheet';
import { ProgressChart } from '../../../shared/components/ProgressChart';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import { formatDateTime, formatShortDate } from '../../../shared/utils/dates';
import { convertWeight, formatWeight } from '../../../shared/utils/weight';
import { useSettings } from '../../settings/context/SettingsContext';
import type { BodyWeightLog, BodyWeightRangeFilter } from '../types';

const t = es.bodyWeight;

const FILTERS: Array<{ value: BodyWeightRangeFilter; label: string }> = [
  { value: 'week', label: t.filterWeek },
  { value: 'month', label: t.filterMonth },
  { value: 'all', label: t.filterAll },
];

function parseWeight(text: string): number | null {
  if (text.trim() === '') {
    return null;
  }
  const parsed = parseFloat(text);
  return Number.isNaN(parsed) ? null : parsed;
}

export function BodyWeightScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { settings } = useSettings();
  const userId = useLocalUserId();
  const { logs, filteredLogs, filter, setFilter, isLoading, reload } =
    useBodyWeight(userId);
  const [isAddVisible, setAddVisible] = useState(false);
  const [weightText, setWeightText] = useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  function closeAddSheet() {
    setAddVisible(false);
    setWeightText('');
  }

  async function handleAdd() {
    const weight = parseWeight(weightText);
    if (!userId || weight === null) {
      return;
    }
    await bodyWeightService.addLog(userId, weight, settings.weightUnit);
    closeAddSheet();
    await reload();
  }

  function handleDelete(log: BodyWeightLog) {
    Alert.alert(t.deleteConfirmTitle, t.deleteConfirmMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.common.confirmDeleteButton,
        style: 'destructive',
        onPress: async () => {
          await bodyWeightService.deleteLog(log.id);
          await reload();
        },
      },
    ]);
  }

  const currentLog = logs[0];
  const chartPoints = [...filteredLogs].reverse().map(log => ({
    label: formatShortDate(log.loggedAt),
    value: convertWeight(
      log.weight,
      log.weightUnit as 'kg' | 'lb',
      settings.weightUnit,
    ),
  }));
  const showEmptyState = !isLoading && logs.length === 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredLogs}
        keyExtractor={item => item.id}
        contentContainerStyle={
          showEmptyState ? styles.emptyContainer : styles.listContent
        }
        ListHeaderComponent={
          showEmptyState ? undefined : (
            <View>
              {currentLog && (
                <View style={styles.currentCard}>
                  <Text style={styles.currentLabel}>{t.currentLabel}</Text>
                  <Text style={styles.currentValue}>
                    {formatWeight(
                      currentLog.weight,
                      currentLog.weightUnit as 'kg' | 'lb',
                      settings.weightUnit,
                    )}
                  </Text>
                </View>
              )}
              <View style={styles.filterRow}>
                {FILTERS.map(option => (
                  <View key={option.value} style={styles.filterButton}>
                    <Button
                      label={option.label}
                      variant={
                        filter === option.value ? 'primary' : 'secondary'
                      }
                      onPress={() => setFilter(option.value)}
                    />
                  </View>
                ))}
              </View>
              {chartPoints.length > 0 && (
                <View style={styles.chartCard}>
                  <ProgressChart
                    points={chartPoints}
                    formatValue={value =>
                      `${Math.round(value * 10) / 10} ${settings.weightUnit}`
                    }
                  />
                </View>
              )}
            </View>
          )
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>{es.common.loading}</Text>
          ) : (
            <Text style={styles.emptyText}>{t.empty}</Text>
          )
        }
        renderItem={({ item }) => {
          const displayWeight = formatWeight(
            item.weight,
            item.weightUnit as 'kg' | 'lb',
            settings.weightUnit,
          );
          return (
            <SwipeableCard
              contentStyle={styles.row}
              accessibilityLabel={`${formatDateTime(
                item.loggedAt,
              )}, ${displayWeight}`}
              actions={[
                {
                  key: 'delete',
                  label: es.common.delete,
                  variant: 'danger',
                  onPress: () => handleDelete(item),
                },
              ]}
            >
              <Text style={styles.rowDate}>
                {formatDateTime(item.loggedAt)}
              </Text>
              <Text style={styles.rowValue}>{displayWeight}</Text>
            </SwipeableCard>
          );
        }}
      />
      <View style={styles.footer}>
        <Button label={t.addButton} onPress={() => setAddVisible(true)} />
      </View>
      <FormSheet
        visible={isAddVisible}
        title={t.addTitle}
        onCancel={closeAddSheet}
        onSubmit={handleAdd}
        submitDisabled={parseWeight(weightText) === null}
      >
        <TextField
          label={t.weightLabel(settings.weightUnit)}
          keyboardType="numeric"
          value={weightText}
          onChangeText={setWeightText}
          autoFocus
        />
      </FormSheet>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: spacing.md,
    },
    emptyContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    emptyText: {
      color: colors.muted,
      textAlign: 'center',
    },
    currentCard: {
      backgroundColor: colors.accentSoft,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    currentLabel: {
      fontSize: 12,
      color: colors.muted,
    },
    currentValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.primary,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    filterButton: {
      flex: 1,
    },
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowDate: {
      fontSize: 13,
      color: colors.muted,
    },
    rowValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}
