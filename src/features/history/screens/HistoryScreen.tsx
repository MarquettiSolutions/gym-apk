import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HistoryStackParamList } from '../../../navigation/types';
import { useHistory } from '../hooks/useHistory';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { useTranslation } from '../../../shared/i18n';
import type { Translations } from '../../../shared/i18n';
import { formatDateTime } from '../../../shared/utils/dates';
import type { SessionSummary } from '../types';

type Props = NativeStackScreenProps<HistoryStackParamList, 'HistoryList'>;

function statusLabel(
  status: string,
  t: Translations['history']['list'],
): string {
  if (status === 'completed') {
    return t.statusCompleted;
  }
  if (status === 'skipped') {
    return t.statusSkipped;
  }
  return t.statusInProgress;
}

export function HistoryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t: translations } = useTranslation();
  const t = translations.history.list;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const userId = useLocalUserId();
  const { sessions, streak, isLoading, reload } = useHistory(userId);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const showEmptyState = !isLoading && sessions.length === 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={item => item.session.id}
        contentContainerStyle={
          showEmptyState ? styles.emptyContainer : styles.listContent
        }
        ListHeaderComponent={
          sessions.length > 0 ? (
            <View style={styles.streakBanner}>
              <Text style={styles.streakText}>
                {streak.days > 0 ? t.streakLabel(streak.days) : t.noStreak}
              </Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>{translations.common.loading}</Text>
          ) : (
            <Text style={styles.emptyText}>{t.empty}</Text>
          )
        }
        renderItem={({ item }: { item: SessionSummary }) => (
          <Pressable
            accessibilityRole="button"
            style={styles.card}
            onPress={() =>
              navigation.navigate('SessionDetail', {
                sessionId: item.session.id,
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.dayLabel}>
                {item.dayLabel ?? t.deletedPlanLabel}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {statusLabel(item.session.status, t)}
                </Text>
              </View>
            </View>
            <Text style={styles.dateText}>
              {formatDateTime(item.session.startedAt)}
            </Text>
            <Text style={styles.setsText}>
              {t.setsFormat(item.completedSets, item.totalSets)}
            </Text>
          </Pressable>
        )}
      />
      <View style={styles.footer}>
        <Button
          label={t.bodyWeightButton}
          variant="secondary"
          onPress={() => navigation.navigate('BodyWeight')}
        />
      </View>
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
    streakBanner: {
      backgroundColor: colors.accentSoft,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    streakText: {
      color: colors.primary,
      fontWeight: '600',
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dayLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    statusBadge: {
      backgroundColor: colors.surfaceActive,
      borderRadius: 10,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
    },
    dateText: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    setsText: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}
