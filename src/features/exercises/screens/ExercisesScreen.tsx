import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { repositories } from '../../../db/client';
import { useExerciseCatalog } from '../../plans/hooks/useExerciseCatalog';
import { useLocalUserId } from '../../../shared/hooks/useLocalUserId';
import { ExerciseThumbnail } from '../../../shared/components/ExerciseThumbnail';
import { FormSheet } from '../../../shared/components/FormSheet';
import { Button } from '../../../shared/components/Button';
import { CreateExerciseForm } from '../components/CreateExerciseForm';
import { createCustomExercise } from '../services/customExercisesService';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { es } from '../../../shared/i18n/es';
import type { CreateCustomExerciseInput } from '../types';

const t = es.exercises;

const emptyForm: CreateCustomExerciseInput = {
  name: '',
  muscleGroup: null,
  equipment: null,
  thumbnailUri: null,
  videoUri: null,
};

export function ExercisesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { exercises, isLoading, reload } = useExerciseCatalog();
  const userId = useLocalUserId();
  const [search, setSearch] = useState('');
  const [isCreating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateCustomExerciseInput>(emptyForm);

  const filteredExercises = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (normalized === '') {
      return exercises;
    }
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(normalized),
    );
  }, [exercises, search]);

  function openCreateSheet() {
    setForm(emptyForm);
    setCreating(true);
  }

  async function handleCreate() {
    if (!userId || form.name.trim() === '') {
      return;
    }
    try {
      await createCustomExercise(repositories, userId, form);
      setCreating(false);
      await reload();
    } catch (error) {
      Alert.alert(
        t.createErrorTitle,
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
          <View style={styles.row}>
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
          </View>
        )}
      />
      <View style={styles.footer}>
        <Button label={t.createButton} onPress={openCreateSheet} />
      </View>

      <FormSheet
        visible={isCreating}
        title={t.createTitle}
        onCancel={() => setCreating(false)}
        onSubmit={handleCreate}
        submitLabel={es.common.create}
        submitDisabled={form.name.trim() === ''}
      >
        <CreateExerciseForm values={form} onChange={setForm} />
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
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}
