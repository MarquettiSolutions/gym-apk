import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlansStackParamList } from '../../../navigation/types';
import { usePlans } from '../hooks/usePlans';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { plansService } from '../services';
import { Button } from '../../../shared/components/Button';
import {
  SwipeableCard,
  type SwipeAction,
} from '../../../shared/components/SwipeableCard';
import { TextField } from '../../../shared/components/TextField';
import { FormSheet } from '../../../shared/components/FormSheet';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { useTranslation } from '../../../shared/i18n';
import type { Plan } from '../types';

type Props = NativeStackScreenProps<PlansStackParamList, 'PlansList'>;

export function PlansScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t: translations } = useTranslation();
  const t = translations.plans.list;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const userId = useLocalUserId();
  const { plans, isLoading, reload } = usePlans(userId);
  const [isCreateVisible, setCreateVisible] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  function closeCreateSheet() {
    setCreateVisible(false);
    setNewPlanName('');
  }

  async function handleCreate() {
    const trimmedName = newPlanName.trim();
    if (!userId || trimmedName === '') {
      return;
    }
    const plan = await plansService.createPlan(userId, trimmedName);
    closeCreateSheet();
    navigation.navigate('PlanEditor', { planId: plan.id });
  }

  async function handleActivate(plan: Plan) {
    if (!userId) {
      return;
    }
    await plansService.setActivePlan(userId, plan.id);
    await reload();
  }

  async function handleDuplicate(plan: Plan) {
    if (!userId) {
      return;
    }
    await plansService.duplicatePlan(userId, plan.id);
    await reload();
  }

  function handleDelete(plan: Plan) {
    Alert.alert(t.deleteConfirmTitle, t.deleteConfirmMessage(plan.name), [
      { text: translations.common.cancel, style: 'cancel' },
      {
        text: translations.common.confirmDeleteButton,
        style: 'destructive',
        onPress: async () => {
          await plansService.deletePlan(plan.id);
          await reload();
        },
      },
    ]);
  }

  function buildActions(plan: Plan): SwipeAction[] {
    return [
      ...(plan.isActive
        ? []
        : [
            {
              key: 'activate',
              label: translations.common.activate,
              onPress: () => handleActivate(plan),
            },
          ]),
      {
        key: 'duplicate',
        label: translations.common.duplicate,
        onPress: () => handleDuplicate(plan),
      },
      {
        key: 'delete',
        label: translations.common.delete,
        variant: 'danger',
        onPress: () => handleDelete(plan),
      },
    ];
  }

  const showEmptyState = !isLoading && plans.length === 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={item => item.id}
        contentContainerStyle={
          showEmptyState ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>{translations.common.loading}</Text>
          ) : (
            <Text style={styles.emptyText}>{t.empty}</Text>
          )
        }
        renderItem={({ item }) => (
          <SwipeableCard
            style={styles.cardWrapper}
            contentStyle={styles.card}
            accessibilityLabel={
              item.isActive
                ? `${item.name}, ${translations.common.activeBadge}`
                : item.name
            }
            onPress={() =>
              navigation.navigate('PlanEditor', { planId: item.id })
            }
            actions={buildActions(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.planName}>{item.name}</Text>
              {item.isActive && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>
                    {translations.common.activeBadge}
                  </Text>
                </View>
              )}
            </View>
          </SwipeableCard>
        )}
      />
      <View style={styles.footer}>
        <Button label={t.createButton} onPress={() => setCreateVisible(true)} />
      </View>
      <FormSheet
        visible={isCreateVisible}
        title={t.newPlanTitle}
        onCancel={closeCreateSheet}
        onSubmit={handleCreate}
        submitDisabled={newPlanName.trim() === ''}
      >
        <TextField
          label={t.nameLabel}
          placeholder={t.namePlaceholder}
          value={newPlanName}
          onChangeText={setNewPlanName}
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
    cardWrapper: {
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    planName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    activeBadge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    activeBadgeText: {
      color: colors.onPrimary,
      fontSize: 11,
      fontWeight: '700',
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}
