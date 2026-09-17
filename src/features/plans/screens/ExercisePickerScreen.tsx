import React, { useMemo, useState } from 'react';
import {
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
import { ExerciseThumbnail } from '../../../shared/components/ExerciseThumbnail';
import { FormSheet } from '../../../shared/components/FormSheet';
import { DayExerciseForm } from '../components/DayExerciseForm';
import { colors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import { DEFAULT_REST_SECONDS } from '../constants';
import type { DayExerciseFormValues, Exercise } from '../types';

type Props = NativeStackScreenProps<PlansStackParamList, 'ExercisePicker'>;

const t = es.plans.exercisePicker;

const DEFAULT_FORM: DayExerciseFormValues = {
  targetSets: 3,
  targetReps: 10,
  targetWeight: null,
  restSeconds: DEFAULT_REST_SECONDS,
  notes: null,
};

export function ExercisePickerScreen({ route, navigation }: Props) {
  const { dayId } = route.params;
  const { exercises, isLoading } = useExerciseCatalog();
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [form, setForm] = useState<DayExerciseFormValues>(DEFAULT_FORM);

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
    const normalizedSearch = search.trim().toLowerCase();
    return exercises.filter(exercise => {
      const matchesSearch =
        normalizedSearch === '' ||
        exercise.name.toLowerCase().includes(normalizedSearch);
      const matchesGroup =
        muscleGroup === null || exercise.muscleGroup === muscleGroup;
      return matchesSearch && matchesGroup;
    });
  }, [exercises, search, muscleGroup]);

  function openConfigureSheet(exercise: Exercise) {
    setSelectedExercise(exercise);
    setForm(DEFAULT_FORM);
  }

  async function handleConfirm() {
    if (!selectedExercise) {
      return;
    }
    await plansService.addExerciseToDay(dayId, selectedExercise.id, form);
    setSelectedExercise(null);
    navigation.goBack();
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
                {group}
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
            <Text style={styles.emptyText}>{es.common.loading}</Text>
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
              <Text style={styles.rowName}>{item.name}</Text>
              {(item.muscleGroup || item.equipment) && (
                <Text style={styles.rowMeta}>
                  {[item.muscleGroup, item.equipment]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />

      <FormSheet
        visible={selectedExercise !== null}
        title={selectedExercise ? selectedExercise.name : t.configureTitle}
        onCancel={() => setSelectedExercise(null)}
        onSubmit={handleConfirm}
        submitLabel={es.common.add}
      >
        <DayExerciseForm values={form} onChange={setForm} />
      </FormSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  search: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#DDDDDD',
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
    borderColor: '#DDDDDD',
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
    color: '#FFFFFF',
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
    borderBottomColor: '#EEEEEE',
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
});
