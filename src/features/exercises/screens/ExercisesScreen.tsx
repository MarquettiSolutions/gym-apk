import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ExercisesStackParamList } from '../../../navigation/types';
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
import { useTranslation } from '../../../shared/i18n';
import type { CreateCustomExerciseInput } from '../types';

const emptyForm: CreateCustomExerciseInput = {
  name: '',
  muscleGroup: null,
  equipment: null,
  thumbnailUri: null,
  videoUri: null,
};

type Props = NativeStackScreenProps<ExercisesStackParamList, 'ExercisesList'>;

export function ExercisesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t: translations } = useTranslation();
  const t = translations.exercises;
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
            <Text style={styles.emptyText}>{translations.common.loading}</Text>
          ) : (
            <Text style={styles.emptyText}>{t.empty}</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            style={styles.row}
            onPress={() =>
              navigation.navigate('ExerciseDetail', { exerciseId: item.id })
            }
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
      <View style={styles.footer}>
        <Button label={t.createButton} onPress={openCreateSheet} />
      </View>

      <FormSheet
        visible={isCreating}
        title={t.createTitle}
        onCancel={() => setCreating(false)}
        onSubmit={handleCreate}
        submitLabel={translations.common.create}
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
