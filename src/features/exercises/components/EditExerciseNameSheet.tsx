import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Modal, StyleSheet, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Button } from '../../../shared/components/Button';
import { FormSheet } from '../../../shared/components/FormSheet';
import { TextField } from '../../../shared/components/TextField';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { useTranslation } from '../../../shared/i18n';
import {
  MAX_EXERCISE_NAME_LENGTH,
  buildNameSuggestionUrl,
  validateExerciseName,
} from '../services/exerciseNameEditService';
import type { Exercise } from '../types';

interface EditExerciseNameSheetProps {
  visible: boolean;
  exercise: Exercise;
  onClose: () => void;
}

export function EditExerciseNameSheet({
  visible,
  exercise,
  onClose,
}: EditExerciseNameSheetProps) {
  const { colors } = useTheme();
  const {
    language,
    t: translations,
    exerciseName,
    exerciseBaseName,
    hasExerciseNameOverride,
    saveExerciseNameOverride,
    restoreExerciseName,
  } = useTranslation();
  const t = translations.exerciseDetail;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const currentName = exerciseName(exercise);
  const [text, setText] = useState(currentName);
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setText(currentName);
      setStep('edit');
      setError(null);
    }
    // Solo al abrir: reescribir el texto mientras el usuario edita lo pisaría.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const validation = validateExerciseName(text);

  function goToConfirm() {
    if (!validation.ok) {
      setError(
        validation.reason === 'empty'
          ? t.nameEmptyError
          : t.nameTooLongError(MAX_EXERCISE_NAME_LENGTH),
      );
      return;
    }
    setError(null);
    setStep('confirm');
  }

  async function save(sendSuggestion: boolean) {
    if (!validation.ok || isBusy) {
      return;
    }
    setIsBusy(true);
    try {
      // Sin cambios respecto al nombre base: se equipara a restaurar.
      if (validation.name === exerciseBaseName(exercise)) {
        await restoreExerciseName(exercise.id);
      } else {
        await saveExerciseNameOverride(exercise.id, validation.name);
      }
      onClose();
      if (sendSuggestion && validation.name !== currentName) {
        try {
          await Linking.openURL(
            buildNameSuggestionUrl({
              originalName: exercise.name,
              language,
              currentName,
              suggestedName: validation.name,
              appVersion: DeviceInfo.getVersion(),
            }),
          );
        } catch {
          Alert.alert(t.editNameTitle, t.openBrowserError);
        }
      }
    } finally {
      setIsBusy(false);
    }
  }

  async function restore() {
    setIsBusy(true);
    try {
      await restoreExerciseName(exercise.id);
      onClose();
    } finally {
      setIsBusy(false);
    }
  }

  if (step === 'confirm') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setStep('edit')}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{t.confirmTitle}</Text>
            <Text style={styles.newName}>
              {validation.ok ? validation.name : ''}
            </Text>
            <Text style={styles.message}>{t.confirmMessage}</Text>
            <View style={styles.stack}>
              <Button
                label={t.saveLocalOnly}
                variant="secondary"
                onPress={() => save(false)}
                disabled={isBusy}
              />
              <Button
                label={t.saveAndSend}
                onPress={() => save(true)}
                disabled={isBusy}
              />
              <Button
                label={translations.common.cancel}
                variant="secondary"
                onPress={() => setStep('edit')}
                disabled={isBusy}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <FormSheet
      visible={visible}
      title={t.editNameTitle}
      onCancel={onClose}
      onSubmit={goToConfirm}
      submitDisabled={isBusy}
    >
      <TextField
        label={t.nameFieldLabel}
        value={text}
        onChangeText={value => {
          setText(value);
          setError(null);
        }}
        maxLength={MAX_EXERCISE_NAME_LENGTH + 20}
        autoFocus
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {hasExerciseNameOverride(exercise.id) && (
        <Button
          label={t.restoreOriginal}
          variant="secondary"
          onPress={restore}
          disabled={isBusy}
        />
      )}
    </FormSheet>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: spacing.lg,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    newName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    message: {
      fontSize: 14,
      color: colors.muted,
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    stack: {
      gap: spacing.sm,
    },
    error: {
      fontSize: 13,
      color: colors.danger,
      marginBottom: spacing.sm,
    },
  });
}
