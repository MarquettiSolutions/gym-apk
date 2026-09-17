import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HistoryStackParamList } from '../../../navigation/types';
import { useHistory } from '../hooks/useHistory';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { Button } from '../../../shared/components/Button';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import { formatDateTime } from '../../../shared/utils/dates';
import type { SessionSummary } from '../types';

type Props = NativeStackScreenProps<HistoryStackParamList, 'HistoryList'>;

const t = es.history.list;

function statusLabel(status: string): string {
  if (status === 'completed') {
    return t.statusCompleted;
  }
  if (status === 'skipped') {
    return t.statusSkipped;
  }
  return t.statusInProgress;
}

export function HistoryScreen({ navigation }: Props) {
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
            <Text style={styles.emptyText}>{es.common.loading}</Text>
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
                  {statusLabel(item.session.status)}
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

const styles = StyleSheet.create({
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
    backgroundColor: '#E8F5E9',
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
    backgroundColor: '#F7F7F7',
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
    backgroundColor: '#E0E0E0',
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
    borderTopColor: '#EEEEEE',
  },
});
