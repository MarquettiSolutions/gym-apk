import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { TextField } from '../../../shared/components/TextField';
import { FormSheet } from '../../../shared/components/FormSheet';
import { ExerciseThumbnail } from '../../../shared/components/ExerciseThumbnail';
import { WeekdayPicker } from '../components/WeekdayPicker';
import { DayExerciseForm } from '../components/DayExerciseForm';
import { WEEKDAY_LABELS } from '../constants';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import { useSettings } from '../../settings/context/SettingsContext';
import { groupConsecutiveBy } from '../../../shared/utils/grouping';
import type { DayExerciseFormValues, PlanDayExerciseDetail } from '../types';

type Props = NativeStackScreenProps<PlansStackParamList, 'DayEditor'>;
type ExerciseBlock = { groupId: string | null; items: PlanDayExerciseDetail[] };

const t = es.plans.dayEditor;
const editorT = es.plans.editor;

export function DayEditorScreen({ route, navigation }: Props) {
  const { planId, dayId } = route.params;
  const { colors } = useTheme();
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
      const weekdayLabel = WEEKDAY_LABELS[detail.day.weekday] ?? '';
      navigation.setOptions({
        title: detail.day.label
          ? `${weekdayLabel} · ${detail.day.label}`
          : weekdayLabel,
      });
    }
  }, [detail, navigation]);

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
        { text: es.common.cancel, style: 'cancel' },
        {
          text: es.common.confirmDeleteButton,
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
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.common.confirmDeleteButton,
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
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.common.confirmDeleteButton,
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

  function renderExerciseActions(item: PlanDayExerciseDetail) {
    return (
      <View style={styles.cardActions}>
        <View style={styles.cardActionButton}>
          <Button
            label={es.common.edit}
            variant="secondary"
            onPress={() => openEditExerciseSheet(item)}
          />
        </View>
        <View style={styles.cardActionButton}>
          <Button
            label={es.common.delete}
            variant="danger"
            onPress={() => handleRemoveExercise(item.planDayExercise.id)}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isSelectingGroup ? (
        <View style={styles.dayActions}>
          <View style={styles.dayActionButton}>
            <Button
              label={es.common.edit}
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
              label={es.common.delete}
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
            <Text style={styles.emptyText}>{es.common.loading}</Text>
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

          if (!isGroup) {
            const exerciseItem = block.items[0] as PlanDayExerciseDetail;
            const isSelected = selectedIds.includes(
              exerciseItem.planDayExercise.id,
            );
            return (
              <ScaleDecorator>
                <View
                  style={[
                    styles.card,
                    isActive && styles.cardActive,
                    isSelected && styles.cardSelected,
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t.dragHandleLabel}
                    onPress={
                      isSelectingGroup
                        ? () => toggleSelected(exerciseItem.planDayExercise.id)
                        : undefined
                    }
                    onLongPress={isSelectingGroup ? undefined : drag}
                    disabled={isActive}
                    style={styles.cardMain}
                  >
                    {renderExerciseDetails(exerciseItem)}
                    {!isSelectingGroup ? (
                      <Text style={styles.dragHandle}>⠿</Text>
                    ) : null}
                  </Pressable>
                  {!isSelectingGroup ? (
                    <View style={styles.cardActions}>
                      <View style={styles.cardActionButton}>
                        <Button
                          label={t.moveUp}
                          variant="secondary"
                          disabled={index === 0}
                          onPress={() => handleMove(index, -1)}
                        />
                      </View>
                      <View style={styles.cardActionButton}>
                        <Button
                          label={t.moveDown}
                          variant="secondary"
                          disabled={index === blocks.length - 1}
                          onPress={() => handleMove(index, 1)}
                        />
                      </View>
                      {renderExerciseActions(exerciseItem)}
                    </View>
                  ) : null}
                </View>
              </ScaleDecorator>
            );
          }

          return (
            <ScaleDecorator>
              <View style={[styles.groupCard, isActive && styles.cardActive]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t.dragHandleLabel}
                  onLongPress={isSelectingGroup ? undefined : drag}
                  disabled={isActive}
                  style={styles.groupHeader}
                >
                  <Text style={styles.groupHeaderLabel}>
                    {t.supersetBadgeLabel}
                  </Text>
                  {!isSelectingGroup ? (
                    <Text style={styles.dragHandle}>⠿</Text>
                  ) : null}
                </Pressable>
                {block.items.map(exerciseItem => (
                  <View
                    key={exerciseItem.planDayExercise.id}
                    style={styles.groupMemberCard}
                  >
                    <View style={styles.cardMain}>
                      {renderExerciseDetails(exerciseItem)}
                    </View>
                    {!isSelectingGroup
                      ? renderExerciseActions(exerciseItem)
                      : null}
                  </View>
                ))}
                {!isSelectingGroup ? (
                  <View style={styles.cardActions}>
                    <View style={styles.cardActionButton}>
                      <Button
                        label={t.moveUp}
                        variant="secondary"
                        disabled={index === 0}
                        onPress={() => handleMove(index, -1)}
                      />
                    </View>
                    <View style={styles.cardActionButton}>
                      <Button
                        label={t.moveDown}
                        variant="secondary"
                        disabled={index === blocks.length - 1}
                        onPress={() => handleMove(index, 1)}
                      />
                    </View>
                    <View style={styles.cardActionButton}>
                      <Button
                        label={t.ungroupButton}
                        variant="danger"
                        onPress={() =>
                          handleDissolveGroup(block.groupId as string)
                        }
                      />
                    </View>
                  </View>
                ) : null}
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
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
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
      marginBottom: spacing.sm,
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
    cardActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    cardActionButton: {
      minWidth: 74,
    },
    groupCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      marginBottom: spacing.sm,
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
