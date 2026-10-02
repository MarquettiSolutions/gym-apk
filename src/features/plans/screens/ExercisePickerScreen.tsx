import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PlansStackParamList } from '../../../navigation/types';
import { useExerciseCatalog } from '../hooks/useExerciseCatalog';
import { plansService } from '../services';
import { repositories } from '../../../db/client';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { ExerciseThumbnail } from '../../../shared/components/ExerciseThumbnail';
import { FormSheet } from '../../../shared/components/FormSheet';
import { Button } from '../../../shared/components/Button';
import { DayExerciseForm } from '../components/DayExerciseForm';
import { CreateExerciseForm } from '../../exercises/components/CreateExerciseForm';
import { createCustomExercise } from '../../exercises/services/customExercisesService';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { normalizeSearchText, useTranslation } from '../../../shared/i18n';
import { useSettings } from '../../settings/context/SettingsContext';
import type { DayExerciseFormValues, Exercise } from '../types';
import type { CreateCustomExerciseInput } from '../../exercises/types';

const emptyCreateForm: CreateCustomExerciseInput = {
  name: '',
  muscleGroup: null,
  equipment: null,
  thumbnailUri: null,
  videoUri: null,
};

type Props = NativeStackScreenProps<PlansStackParamList, 'ExercisePicker'>;

export function ExercisePickerScreen({ route, navigation }: Props) {
  const { dayId } = route.params;
  const { colors } = useTheme();
  const {
    t: translations,
    exerciseName,
    exerciseMuscleGroup,
    exerciseEquipment,
    matchesExerciseSearch,
  } = useTranslation();
  const t = translations.plans.exercisePicker;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { settings } = useSettings();
  const { exercises, isLoading, isCatalogImporting, reload } =
    useExerciseCatalog();
  const userId = useLocalUserId();
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [form, setForm] = useState<DayExerciseFormValues>(() => ({
    targetSets: 3,
    targetReps: 10,
    targetWeight: null,
    restSeconds: settings.defaultRestSeconds,
    notes: null,
  }));
  const [isCreating, setCreating] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateCustomExerciseInput>(emptyCreateForm);

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    for (const exercise of exercises) {
      if (exercise.muscleGroup) {
        groups.add(exercise.muscleGroup);
      }
    }
    return Array.from(groups).sort();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = normalizeSearchText(search.trim());
    return exercises.filter(exercise => {
      const matchesSearch =
        normalizedSearch === '' ||
        matchesExerciseSearch(exercise, normalizedSearch);
      const matchesGroup =
        muscleGroup === null || exercise.muscleGroup === muscleGroup;
      return matchesSearch && matchesGroup;
    });
  }, [exercises, search, muscleGroup, matchesExerciseSearch]);

  function openConfigureSheet(exercise: Exercise) {
    setSelectedExercise(exercise);
    setForm({
      targetSets: 3,
      targetReps: 10,
      targetWeight: null,
      restSeconds: settings.defaultRestSeconds,
      notes: null,
    });
  }

  async function handleConfirm() {
    if (!selectedExercise) {
      return;
    }
    await plansService.addExerciseToDay(dayId, selectedExercise.id, form);
    setSelectedExercise(null);
    navigation.goBack();
  }

  function openCreateSheet() {
    setCreateForm(emptyCreateForm);
    setCreating(true);
  }

  async function handleCreateExercise() {
    if (!userId || createForm.name.trim() === '') {
      return;
    }
    try {
      const created = await createCustomExercise(
        repositories,
        userId,
        createForm,
      );
      setCreating(false);
      await reload();
      openConfigureSheet(created);
    } catch (error) {
      Alert.alert(
        translations.exercises.createErrorTitle,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder={t.searchPlaceholder}
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: muscleGroup === null }}
          onPress={() => setMuscleGroup(null)}
          style={[styles.chip, muscleGroup === null && styles.chipSelected]}
        >
          <Text
            style={[
              styles.chipLabel,
              muscleGroup === null && styles.chipLabelSelected,
            ]}
          >
            {t.allMuscleGroups}
          </Text>
        </Pressable>
        {muscleGroups.map(group => {
          const selected = group === muscleGroup;
          return (
            <Pressable
              key={group}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setMuscleGroup(group)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text
                style={[styles.chipLabel, selected && styles.chipLabelSelected]}
              >
                {exerciseMuscleGroup({ muscleGroup: group, isCustom: false })}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        contentContainerStyle={
          filteredExercises.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          isLoading ? (
            <Text style={styles.emptyText}>{translations.common.loading}</Text>
          ) : isCatalogImporting ? (
            <Text style={styles.emptyText}>{t.loadingCatalog}</Text>
          ) : (
            <Text style={styles.emptyText}>{t.empty}</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            style={styles.row}
            onPress={() => openConfigureSheet(item)}
          >
            <ExerciseThumbnail
              localPath={item.thumbnailLocalPath}
              remoteUrl={item.thumbnailRemoteUrl}
            />
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{exerciseName(item)}</Text>
              {(item.muscleGroup || item.equipment) && (
                <Text style={styles.rowMeta}>
                  {[exerciseMuscleGroup(item), exerciseEquipment(item)]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Button
          label={t.createButton}
          variant="secondary"
          onPress={openCreateSheet}
        />
      </View>

      <FormSheet
        visible={selectedExercise !== null}
        title={
          selectedExercise ? exerciseName(selectedExercise) : t.configureTitle
        }
        onCancel={() => setSelectedExercise(null)}
        onSubmit={handleConfirm}
        submitLabel={translations.common.add}
      >
        {selectedExercise && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              const exerciseId = selectedExercise.id;
              setSelectedExercise(null);
              navigation.navigate('ExerciseDetail', { exerciseId });
            }}
          >
            <Text style={styles.viewDetailLink}>
              {translations.exerciseDetail.viewDetailLink}
            </Text>
          </Pressable>
        )}
        <DayExerciseForm values={form} onChange={setForm} />
      </FormSheet>

      <FormSheet
        visible={isCreating}
        title={translations.exercises.createTitle}
        onCancel={() => setCreating(false)}
        onSubmit={handleCreateExercise}
        submitLabel={translations.common.create}
        submitDisabled={createForm.name.trim() === ''}
      >
        <CreateExerciseForm values={createForm} onChange={setCreateForm} />
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
    search: {
      margin: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      fontSize: 15,
      color: colors.text,
    },
    chipsRow: {
      flexGrow: 0,
    },
    chipsContent: {
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    chip: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      marginRight: spacing.xs,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipLabel: {
      fontSize: 13,
      color: colors.text,
    },
    chipLabelSelected: {
      color: colors.onPrimary,
      fontWeight: '600',
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowInfo: {
      marginLeft: spacing.sm,
      flex: 1,
    },
    rowName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    rowMeta: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    viewDetailLink: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}
