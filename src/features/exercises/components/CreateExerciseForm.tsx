import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { TextField } from '../../../shared/components/TextField';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { useTranslation } from '../../../shared/i18n';
import type { CreateCustomExerciseInput } from '../types';

interface CreateExerciseFormProps {
  values: CreateCustomExerciseInput;
  onChange: (values: CreateCustomExerciseInput) => void;
}

export function CreateExerciseForm({
  values,
  onChange,
}: CreateExerciseFormProps) {
  const { colors } = useTheme();
  const { t: translations } = useTranslation();
  const t = translations.exercises;
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function pickThumbnail() {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      onChange({ ...values, thumbnailUri: uri });
    }
  }

  async function pickVideo() {
    const result = await launchImageLibrary({ mediaType: 'video' });
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      onChange({ ...values, videoUri: uri });
    }
  }

  return (
    <>
      <TextField
        label={t.nameLabel}
        value={values.name}
        onChangeText={text => onChange({ ...values, name: text })}
      />
      <TextField
        label={t.muscleGroupLabel}
        value={values.muscleGroup ?? ''}
        onChangeText={text =>
          onChange({ ...values, muscleGroup: text.trim() === '' ? null : text })
        }
      />
      <TextField
        label={t.equipmentLabel}
        value={values.equipment ?? ''}
        onChangeText={text =>
          onChange({ ...values, equipment: text.trim() === '' ? null : text })
        }
      />

      <View style={styles.mediaRow}>
        {values.thumbnailUri ? (
          <Image source={{ uri: values.thumbnailUri }} style={styles.preview} />
        ) : null}
        <Button
          label={
            values.thumbnailUri ? t.changePhotoButton : t.choosePhotoButton
          }
          variant="secondary"
          onPress={pickThumbnail}
        />
      </View>

      <View style={styles.mediaRow}>
        {values.videoUri ? (
          <Text style={styles.videoSelected}>{t.videoSelectedLabel}</Text>
        ) : null}
        <Button
          label={values.videoUri ? t.changeVideoButton : t.chooseVideoButton}
          variant="secondary"
          onPress={pickVideo}
        />
      </View>
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    mediaRow: {
      marginBottom: spacing.md,
      gap: spacing.sm,
      alignItems: 'flex-start',
    },
    preview: {
      width: 96,
      height: 96,
      borderRadius: 12,
      backgroundColor: colors.surfaceActive,
    },
    videoSelected: {
      fontSize: 13,
      color: colors.muted,
    },
  });
}
