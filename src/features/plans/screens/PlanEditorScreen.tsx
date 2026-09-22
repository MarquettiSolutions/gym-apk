import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlansStackParamList } from '../../../navigation/types';
import { usePlanDetail } from '../hooks/usePlanDetail';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { plansService } from '../services';
import { Button } from '../../../shared/components/Button';
import { SwipeableCard } from '../../../shared/components/SwipeableCard';
import { TextField } from '../../../shared/components/TextField';
import { FormSheet } from '../../../shared/components/FormSheet';
import { WeekdayPicker } from '../components/WeekdayPicker';
import { WEEKDAY_DISPLAY_ORDER } from '../constants';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { useTranslation } from '../../../shared/i18n';
import type { PlanDayDetail } from '../types';

type Props = NativeStackScreenProps<PlansStackParamList, 'PlanEditor'>;

function sortByWeekdayDisplayOrder(days: PlanDayDetail[]): PlanDayDetail[] {
  return [...days].sort(
    (a, b) =>
      WEEKDAY_DISPLAY_ORDER.indexOf(
        a.day.weekday as (typeof WEEKDAY_DISPLAY_ORDER)[number],
      ) -
      WEEKDAY_DISPLAY_ORDER.indexOf(
        b.day.weekday as (typeof WEEKDAY_DISPLAY_ORDER)[number],
      ),
  );
}

export function PlanEditorScreen({ route, navigation }: Props) {
  const { planId } = route.params;
  const { colors } = useTheme();
  const { t: translations } = useTranslation();
  const t = translations.plans.editor;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const userId = useLocalUserId();
  const { detail, isLoading, reload } = usePlanDetail(planId);

  const [isRenameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const [isAddDayVisible, setAddDayVisible] = useState(false);
  const [newDayWeekday, setNewDayWeekday] = useState(1);
  const [newDayLabel, setNewDayLabel] = useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => {
    if (detail) {
      navigation.setOptions({ title: detail.plan.name });
    }
  }, [detail, navigation]);

  function openRenameSheet() {
    setRenameValue(detail?.plan.name ?? '');
    setRenameVisible(true);
  }

  async function handleRename() {
    const trimmedName = renameValue.trim();
    if (trimmedName === '') {
      return;
    }
    await plansService.renamePlan(planId, trimmedName);
    setRenameVisible(false);
    await reload();
  }

  async function handleActivate() {
    if (!userId) {
      return;
    }
    await plansService.setActivePlan(userId, planId);
    await reload();
  }

  async function handleDuplicatePlan() {
    if (!userId) {
      return;
    }
    await plansService.duplicatePlan(userId, planId);
    navigation.navigate('PlansList');
  }

  function handleDeletePlan() {
    Alert.alert(t.deletePlanConfirmTitle, t.deletePlanConfirmMessage, [
      { text: translations.common.cancel, style: 'cancel' },
      {
        text: translations.common.confirmDeleteButton,
        style: 'destructive',
        onPress: async () => {
          await plansService.deletePlan(planId);
          navigation.navigate('PlansList');
        },
      },
    ]);
  }

  function openAddDaySheet() {
    setNewDayWeekday(1);
    setNewDayLabel('');
    setAddDayVisible(true);
  }

  async function handleAddDay() {
    await plansService.addDay(
      planId,
      newDayWeekday,
      newDayLabel.trim() === '' ? null : newDayLabel.trim(),
    );
    setAddDayVisible(false);
    await reload();
  }

  async function handleDuplicateDay(dayId: string) {
    await plansService.duplicateDay(dayId);
    await reload();
  }

  function handleDeleteDay(dayId: string) {
    Alert.alert(t.deleteDayConfirmTitle, t.deleteDayConfirmMessage, [
      { text: translations.common.cancel, style: 'cancel' },
      {
        text: translations.common.confirmDeleteButton,
        style: 'destructive',
        onPress: async () => {
          await plansService.deleteDay(dayId);
          await reload();
        },
      },
    ]);
  }

  const days = detail ? sortByWeekdayDisplayOrder(detail.days) : [];

  return (
    <View style={styles.container}>
      <View style={styles.planActions}>
        <View style={styles.planActionButton}>
          <Button
            label={translations.common.rename}
            variant="secondary"
            onPress={openRenameSheet}
          />
        </View>
        {!detail?.plan.isActive && (
          <View style={styles.planActionButton}>
            <Button
              label={translations.common.activate}
              variant="secondary"
              onPress={handleActivate}
            />
          </View>
        )}
        <View style={styles.planActionButton}>
          <Button
            label={translations.common.duplicate}
            variant="secondary"
            onPress={handleDuplicatePlan}
          />
        </View>
        <View style={styles.planActionButton}>
          <Button
            label={translations.common.delete}
            variant="danger"
            onPress={handleDeletePlan}
          />
        </View>
      </View>
      {detail?.plan.isActive && (
        <View style={styles.activeBanner}>
          <Text style={styles.activeBannerText}>
            {translations.common.activeBadge}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>{t.daysTitle}</Text>

      <FlatList
        data={days}
        keyExtractor={item => item.day.id}
        contentContainerStyle={
          days.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>{translations.common.loading}</Text>
          ) : (
            <Text style={styles.emptyText}>{t.emptyDays}</Text>
          )
        }
        renderItem={({ item }) => {
          const dayTitle = `${translations.weekdays[item.day.weekday] ?? ''}${
            item.day.label ? ` · ${item.day.label}` : ''
          }`;
          return (
            <SwipeableCard
              style={styles.cardWrapper}
              contentStyle={styles.card}
              accessibilityLabel={`${dayTitle}, ${t.exercisesCount(
                item.exercises.length,
              )}`}
              onPress={() =>
                navigation.navigate('DayEditor', {
                  planId,
                  dayId: item.day.id,
                })
              }
              actions={[
                {
                  key: 'duplicate',
                  label: translations.common.duplicate,
                  onPress: () => handleDuplicateDay(item.day.id),
                },
                {
                  key: 'delete',
                  label: translations.common.delete,
                  variant: 'danger',
                  onPress: () => handleDeleteDay(item.day.id),
                },
              ]}
            >
              <Text style={styles.dayTitle}>{dayTitle}</Text>
              <Text style={styles.daySubtitle}>
                {t.exercisesCount(item.exercises.length)}
              </Text>
            </SwipeableCard>
          );
        }}
      />

      <View style={styles.footer}>
        <Button label={t.addDayButton} onPress={openAddDaySheet} />
      </View>

      <FormSheet
        visible={isRenameVisible}
        title={t.renameTitle}
        onCancel={() => setRenameVisible(false)}
        onSubmit={handleRename}
        submitDisabled={renameValue.trim() === ''}
      >
        <TextField
          label={t.planNameLabel}
          value={renameValue}
          onChangeText={setRenameValue}
          autoFocus
        />
      </FormSheet>

      <FormSheet
        visible={isAddDayVisible}
        title={t.addDayTitle}
        onCancel={() => setAddDayVisible(false)}
        onSubmit={handleAddDay}
      >
        <Text style={styles.fieldLabel}>{t.weekdayLabel}</Text>
        <WeekdayPicker value={newDayWeekday} onChange={setNewDayWeekday} />
        <View style={styles.spacer} />
        <TextField
          label={t.dayLabelLabel}
          placeholder={t.dayLabelPlaceholder}
          value={newDayLabel}
          onChangeText={setNewDayLabel}
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
    planActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      padding: spacing.md,
      paddingBottom: 0,
    },
    planActionButton: {
      minWidth: 90,
    },
    activeBanner: {
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.xs,
      alignItems: 'center',
    },
    activeBannerText: {
      color: colors.onPrimary,
      fontWeight: '700',
      fontSize: 12,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.md,
      marginHorizontal: spacing.md,
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
    cardWrapper: {
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
    },
    dayTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    daySubtitle: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    fieldLabel: {
      fontSize: 13,
      color: colors.muted,
      marginBottom: spacing.xs,
    },
    spacer: {
      height: spacing.md,
    },
  });
}
