import React, { useCallback, useEffect, useState } from 'react';
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
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import type { DayExerciseFormValues, PlanDayExerciseDetail } from '../types';

type Props = NativeStackScreenProps<PlansStackParamList, 'DayEditor'>;

const t = es.plans.dayEditor;
const editorT = es.plans.editor;

const EMPTY_FORM: DayExerciseFormValues = {
  targetSets: 3,
  targetReps: 10,
  targetWeight: null,
  restSeconds: 30,
  notes: null,
};

export function DayEditorScreen({ route, navigation }: Props) {
  const { planId, dayId } = route.params;
  const { detail, isLoading, reload } = useDayDetail(dayId);

  const [isEditDayVisible, setEditDayVisible] = useState(false);
  const [editWeekday, setEditWeekday] = useState(1);
  const [editLabel, setEditLabel] = useState('');

  const [editingExercise, setEditingExercise] =
    useState<PlanDayExerciseDetail | null>(null);
  const [exerciseForm, setExerciseForm] =
    useState<DayExerciseFormValues>(EMPTY_FORM);

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

  async function handleMove(index: number, direction: -1 | 1) {
    if (!detail) {
      return;
    }
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= detail.exercises.length) {
      return;
    }
    const orderedIds = detail.exercises.map(e => e.planDayExercise.id);
    const [moved] = orderedIds.splice(index, 1);
    orderedIds.splice(targetIndex, 0, moved as string);
    await plansService.reorderDayExercises(dayId, orderedIds);
    await reload();
  }

  async function handleDragEnd({ data }: DragEndParams<PlanDayExerciseDetail>) {
    const orderedIds = data.map(e => e.planDayExercise.id);
    await plansService.reorderDayExercises(dayId, orderedIds);
    await reload();
  }

  const exercises = detail?.exercises ?? [];

  return (
    <View style={styles.container}>
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
            label={es.common.delete}
            variant="danger"
            onPress={handleDeleteDay}
          />
        </View>
      </View>

      <DraggableFlatList
        data={exercises}
        keyExtractor={item => item.planDayExercise.id}
        onDragEnd={handleDragEnd}
        contentContainerStyle={
          exercises.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>{es.common.loading}</Text>
          ) : (
            <Text style={styles.emptyText}>{t.emptyExercises}</Text>
          )
        }
        renderItem={({
          item,
          getIndex,
          drag,
          isActive,
        }: RenderItemParams<PlanDayExerciseDetail>) => {
          const index = getIndex() ?? 0;
          return (
            <ScaleDecorator>
              <View style={[styles.card, isActive && styles.cardActive]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t.dragHandleLabel}
                  onLongPress={drag}
                  disabled={isActive}
                  style={styles.cardMain}
                >
                  <ExerciseThumbnail
                    localPath={item.exercise.thumbnailLocalPath}
                    remoteUrl={item.exercise.thumbnailRemoteUrl}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.exerciseName}>
                      {item.exercise.name}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                      {t.setsRepsFormat(
                        item.planDayExercise.targetSets,
                        item.planDayExercise.targetReps,
                      )}
                      {item.planDayExercise.targetWeight !== null
                        ? ` · ${t.weightFormat(
                            item.planDayExercise.targetWeight,
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
                  <Text style={styles.dragHandle}>⠿</Text>
                </Pressable>
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
                      disabled={index === exercises.length - 1}
                      onPress={() => handleMove(index, 1)}
                    />
                  </View>
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
                      onPress={() =>
                        handleRemoveExercise(item.planDayExercise.id)
                      }
                    />
                  </View>
                </View>
              </View>
            </ScaleDecorator>
          );
        }}
      />

      <View style={styles.footer}>
        <Button
          label={t.addExerciseButton}
          onPress={() =>
            navigation.navigate('ExercisePicker', { planId, dayId })
          }
        />
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

const styles = StyleSheet.create({
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
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardActive: {
    backgroundColor: '#ECECEC',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
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
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
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
