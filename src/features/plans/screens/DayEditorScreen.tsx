import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  type DragEndParams,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlansStackParamList } from '../../../navigation/types';
import { useDayDetail } from '../hooks/useDayDetail';
import { plansService } from '../services';
import { Button } from '../../../shared/components/Button';
import {
  SwipeableCard,
  type SwipeAction,
} from '../../../shared/components/SwipeableCard';
import { TextField } from '../../../shared/components/TextField';
import { FormSheet } from '../../../shared/components/FormSheet';
import { ExerciseThumbnail } from '../../../shared/components/ExerciseThumbnail';
import { WeekdayPicker } from '../components/WeekdayPicker';
import { DayExerciseForm } from '../components/DayExerciseForm';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { useTranslation } from '../../../shared/i18n';
import { useSettings } from '../../settings/context/SettingsContext';
import { groupConsecutiveBy } from '../../../shared/utils/grouping';
import type { DayExerciseFormValues, PlanDayExerciseDetail } from '../types';

type Props = NativeStackScreenProps<PlansStackParamList, 'DayEditor'>;
type ExerciseBlock = { groupId: string | null; items: PlanDayExerciseDetail[] };

export function DayEditorScreen({ route, navigation }: Props) {
  const { planId, dayId } = route.params;
  const { colors } = useTheme();
  const { t: translations } = useTranslation();
  const t = translations.plans.dayEditor;
  const editorT = translations.plans.editor;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { settings } = useSettings();
  const { detail, isLoading, reload } = useDayDetail(dayId);

  const [isEditDayVisible, setEditDayVisible] = useState(false);
  const [editWeekday, setEditWeekday] = useState(1);
  const [editLabel, setEditLabel] = useState('');

  const [editingExercise, setEditingExercise] =
    useState<PlanDayExerciseDetail | null>(null);
  const [exerciseForm, setExerciseForm] = useState<DayExerciseFormValues>({
    targetSets: 3,
    targetReps: 10,
    targetWeight: null,
    restSeconds: settings.defaultRestSeconds,
    notes: null,
  });

  const [isSelectingGroup, setSelectingGroup] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => {
    if (detail) {
      const weekdayLabel = translations.weekdays[detail.day.weekday] ?? '';
      navigation.setOptions({
        title: detail.day.label
          ? `${weekdayLabel} · ${detail.day.label}`
          : weekdayLabel,
      });
    }
  }, [detail, navigation, translations]);

  function openEditDaySheet() {
    if (!detail) {
      return;
    }
    setEditWeekday(detail.day.weekday);
    setEditLabel(detail.day.label ?? '');
    setEditDayVisible(true);
  }

  async function handleEditDay() {
    await plansService.updateDay(dayId, {
      weekday: editWeekday,
      label: editLabel.trim() === '' ? null : editLabel.trim(),
    });
    setEditDayVisible(false);
    await reload();
  }

  function handleDeleteDay() {
    Alert.alert(
      editorT.deleteDayConfirmTitle,
      editorT.deleteDayConfirmMessage,
      [
        { text: translations.common.cancel, style: 'cancel' },
        {
          text: translations.common.confirmDeleteButton,
          style: 'destructive',
          onPress: async () => {
            await plansService.deleteDay(dayId);
            navigation.navigate('PlanEditor', { planId });
          },
        },
      ],
    );
  }

  function openEditExerciseSheet(item: PlanDayExerciseDetail) {
    setEditingExercise(item);
    setExerciseForm({
      targetSets: item.planDayExercise.targetSets,
      targetReps: item.planDayExercise.targetReps,
      targetWeight: item.planDayExercise.targetWeight,
      restSeconds: item.planDayExercise.restSeconds,
      notes: item.planDayExercise.notes,
    });
  }

  async function handleSaveExercise() {
    if (!editingExercise) {
      return;
    }
    await plansService.updateDayExercise(
      editingExercise.planDayExercise.id,
      exerciseForm,
    );
    setEditingExercise(null);
    await reload();
  }

  function handleRemoveExercise(id: string) {
    Alert.alert(t.deleteExerciseConfirmTitle, t.deleteExerciseConfirmMessage, [
      { text: translations.common.cancel, style: 'cancel' },
      {
        text: translations.common.confirmDeleteButton,
        style: 'destructive',
        onPress: async () => {
          await plansService.removeDayExercise(id);
          await reload();
        },
      },
    ]);
  }

  const blocks = useMemo<ExerciseBlock[]>(
    () =>
      groupConsecutiveBy(
        detail?.exercises ?? [],
        item => item.planDayExercise.supersetGroupId,
      ),
    [detail],
  );

  async function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) {
      return;
    }
    const blockIds = blocks.map(block =>
      block.items.map(item => item.planDayExercise.id),
    );
    const [moved] = blockIds.splice(index, 1);
    blockIds.splice(targetIndex, 0, moved as string[]);
    await plansService.reorderDayExercises(dayId, blockIds.flat());
    await reload();
  }

  async function handleDragEnd({ data }: DragEndParams<ExerciseBlock>) {
    const orderedIds = data.flatMap(block =>
      block.items.map(item => item.planDayExercise.id),
    );
    await plansService.reorderDayExercises(dayId, orderedIds);
    await reload();
  }

  function startGroupSelection() {
    setSelectingGroup(true);
    setSelectedIds([]);
  }

  function cancelGroupSelection() {
    setSelectingGroup(false);
    setSelectedIds([]);
  }

  function toggleSelected(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }

  async function confirmGroupSelection() {
    if (selectedIds.length < 2) {
      return;
    }
    try {
      await plansService.createSupersetGroup(dayId, selectedIds);
      cancelGroupSelection();
      await reload();
    } catch (error) {
      Alert.alert(
        t.createSupersetErrorTitle,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  function handleDissolveGroup(groupId: string) {
    Alert.alert(t.ungroupConfirmTitle, t.ungroupConfirmMessage, [
      { text: translations.common.cancel, style: 'cancel' },
      {
        text: translations.common.confirmDeleteButton,
        style: 'destructive',
        onPress: async () => {
          await plansService.dissolveSupersetGroup(dayId, groupId);
          await reload();
        },
      },
    ]);
  }

  function renderExerciseDetails(item: PlanDayExerciseDetail) {
    return (
      <>
        <ExerciseThumbnail
          localPath={item.exercise.thumbnailLocalPath}
          remoteUrl={item.exercise.thumbnailRemoteUrl}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.exerciseName}>{item.exercise.name}</Text>
          <Text style={styles.exerciseMeta}>
            {t.setsRepsFormat(
              item.planDayExercise.targetSets,
              item.planDayExercise.targetReps,
            )}
            {item.planDayExercise.targetWeight !== null
              ? ` · ${t.weightFormat(
                  item.planDayExercise.targetWeight,
                  settings.weightUnit,
                )}`
              : ''}
            {' · '}
            {t.restFormat(item.planDayExercise.restSeconds)}
          </Text>
          {item.planDayExercise.notes ? (
            <Text style={styles.exerciseNotes}>
              {item.planDayExercise.notes}
            </Text>
          ) : null}
        </View>
      </>
    );
  }

  function exerciseActions(item: PlanDayExerciseDetail): SwipeAction[] {
    return [
      {
        key: 'edit',
        label: translations.common.edit,
        onPress: () => openEditExerciseSheet(item),
      },
      {
        key: 'delete',
        label: translations.common.delete,
        variant: 'danger',
        onPress: () => handleRemoveExercise(item.planDayExercise.id),
      },
    ];
  }

  function exerciseSummary(item: PlanDayExerciseDetail) {
    return `${item.exercise.name}, ${t.setsRepsFormat(
      item.planDayExercise.targetSets,
      item.planDayExercise.targetReps,
    )}`;
  }

  function moveActions(index: number): SwipeAction[] {
    return [
      ...(index > 0
        ? [
            {
              key: 'moveUp',
              label: t.moveUp,
              onPress: () => handleMove(index, -1),
            },
          ]
        : []),
      ...(index < blocks.length - 1
        ? [
            {
              key: 'moveDown',
              label: t.moveDown,
              onPress: () => handleMove(index, 1),
            },
          ]
        : []),
    ];
  }

  return (
    <View style={styles.container}>
      {!isSelectingGroup ? (
        <View style={styles.dayActions}>
          <View style={styles.dayActionButton}>
            <Button
              label={translations.common.edit}
              variant="secondary"
              onPress={openEditDaySheet}
            />
          </View>
          <View style={styles.dayActionButton}>
            <Button
              label={t.groupButton}
              variant="secondary"
              onPress={startGroupSelection}
            />
          </View>
          <View style={styles.dayActionButton}>
            <Button
              label={translations.common.delete}
              variant="danger"
              onPress={handleDeleteDay}
            />
          </View>
        </View>
      ) : (
        <Text style={styles.groupHint}>{t.groupSelectionHint}</Text>
      )}

      <DraggableFlatList
        data={blocks}
        keyExtractor={block =>
          block.groupId ?? block.items[0]?.planDayExercise.id ?? 'empty'
        }
        onDragEnd={handleDragEnd}
        contentContainerStyle={
          blocks.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>{translations.common.loading}</Text>
          ) : (
            <Text style={styles.emptyText}>{t.emptyExercises}</Text>
          )
        }
        renderItem={({
          item: block,
          getIndex,
          drag,
          isActive,
        }: RenderItemParams<ExerciseBlock>) => {
          const index = getIndex() ?? 0;
          const isGroup = block.groupId !== null;
          const swipeEnabled = !isSelectingGroup && !isActive;

          if (!isGroup) {
            const exerciseItem = block.items[0] as PlanDayExerciseDetail;
            const isSelected = selectedIds.includes(
              exerciseItem.planDayExercise.id,
            );
            return (
              <ScaleDecorator>
                <SwipeableCard
                  style={styles.cardWrapper}
                  contentStyle={[
                    styles.card,
                    isActive && styles.cardActive,
                    isSelected && styles.cardSelected,
                  ]}
                  accessibilityLabel={exerciseSummary(exerciseItem)}
                  accessibilityHint={t.dragHandleLabel}
                  enabled={swipeEnabled}
                  onPress={
                    isSelectingGroup
                      ? () => toggleSelected(exerciseItem.planDayExercise.id)
                      : undefined
                  }
                  onLongPress={isSelectingGroup ? undefined : drag}
                  actions={[
                    ...moveActions(index),
                    ...exerciseActions(exerciseItem),
                  ]}
                >
                  <View style={styles.cardMain}>
                    {renderExerciseDetails(exerciseItem)}
                    {!isSelectingGroup ? (
                      <Text style={styles.dragHandle}>⠿</Text>
                    ) : null}
                  </View>
                </SwipeableCard>
              </ScaleDecorator>
            );
          }

          return (
            <ScaleDecorator>
              <View style={[styles.groupCard, isActive && styles.cardActive]}>
                <SwipeableCard
                  style={styles.groupHeaderWrapper}
                  contentStyle={[
                    styles.groupHeader,
                    isActive && styles.groupHeaderActive,
                  ]}
                  accessibilityLabel={t.supersetBadgeLabel}
                  accessibilityHint={t.dragHandleLabel}
                  enabled={swipeEnabled}
                  onLongPress={isSelectingGroup ? undefined : drag}
                  actions={[
                    ...moveActions(index),
                    {
                      key: 'ungroup',
                      label: t.ungroupButton,
                      variant: 'danger',
                      onPress: () =>
                        handleDissolveGroup(block.groupId as string),
                    },
                  ]}
                >
                  <Text style={styles.groupHeaderLabel}>
                    {t.supersetBadgeLabel}
                  </Text>
                  {!isSelectingGroup ? (
                    <Text style={styles.dragHandle}>⠿</Text>
                  ) : null}
                </SwipeableCard>
                {block.items.map(exerciseItem => (
                  <SwipeableCard
                    key={exerciseItem.planDayExercise.id}
                    style={styles.groupMemberWrapper}
                    contentStyle={styles.groupMemberCard}
                    accessibilityLabel={exerciseSummary(exerciseItem)}
                    enabled={swipeEnabled}
                    actions={exerciseActions(exerciseItem)}
                  >
                    <View style={styles.cardMain}>
                      {renderExerciseDetails(exerciseItem)}
                    </View>
                  </SwipeableCard>
                ))}
              </View>
            </ScaleDecorator>
          );
        }}
      />

      <View style={styles.footer}>
        {isSelectingGroup ? (
          <View style={styles.footerRow}>
            <View style={styles.footerButton}>
              <Button
                label={t.cancelGroupButton}
                variant="secondary"
                onPress={cancelGroupSelection}
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                label={t.confirmGroupButton(selectedIds.length)}
                disabled={selectedIds.length < 2}
                onPress={confirmGroupSelection}
              />
            </View>
          </View>
        ) : (
          <Button
            label={t.addExerciseButton}
            onPress={() =>
              navigation.navigate('ExercisePicker', { planId, dayId })
            }
          />
        )}
      </View>

      <FormSheet
        visible={isEditDayVisible}
        title={t.editDayTitle}
        onCancel={() => setEditDayVisible(false)}
        onSubmit={handleEditDay}
      >
        <Text style={styles.fieldLabel}>{editorT.weekdayLabel}</Text>
        <WeekdayPicker value={editWeekday} onChange={setEditWeekday} />
        <View style={styles.spacer} />
        <TextField
          label={editorT.dayLabelLabel}
          placeholder={editorT.dayLabelPlaceholder}
          value={editLabel}
          onChangeText={setEditLabel}
        />
      </FormSheet>

      <FormSheet
        visible={editingExercise !== null}
        title={t.editExerciseTitle}
        onCancel={() => setEditingExercise(null)}
        onSubmit={handleSaveExercise}
      >
        <DayExerciseForm values={exerciseForm} onChange={setExerciseForm} />
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
    dayActions: {
      flexDirection: 'row',
      gap: spacing.xs,
      padding: spacing.md,
      paddingBottom: 0,
    },
    dayActionButton: {
      minWidth: 90,
    },
    groupHint: {
      padding: spacing.md,
      paddingBottom: 0,
      color: colors.muted,
      fontSize: 13,
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
    cardActive: {
      backgroundColor: colors.surfaceActive,
      shadowColor: '#000000',
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    cardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    cardMain: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dragHandle: {
      fontSize: 20,
      color: colors.muted,
      paddingHorizontal: spacing.xs,
    },
    cardInfo: {
      marginLeft: spacing.sm,
      flex: 1,
    },
    exerciseName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    exerciseMeta: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    exerciseNotes: {
      fontSize: 12,
      color: colors.muted,
      fontStyle: 'italic',
      marginTop: 2,
    },
    groupCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    groupHeaderWrapper: {
      marginBottom: spacing.sm,
    },
    // Alto mínimo cómodo para que los botones que se revelan al deslizar
    // (Subir/Bajar/Desagrupar) sean fáciles de tocar.
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
      backgroundColor: colors.surface,
    },
    groupHeaderActive: {
      backgroundColor: colors.surfaceActive,
    },
    groupMemberWrapper: {
      marginBottom: spacing.sm,
    },
    groupHeaderLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
    },
    groupMemberCard: {
      backgroundColor: colors.surfaceActive,
      borderRadius: 10,
      padding: spacing.sm,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    footerButton: {
      flex: 1,
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
