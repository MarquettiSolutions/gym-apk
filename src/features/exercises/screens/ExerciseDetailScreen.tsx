import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useExerciseDetail } from '../hooks/useExerciseDetail';
import { useTheme } from '../../../shared/theme/ThemeContext';
import type { ThemeColors } from '../../../shared/theme/colors';
import { spacing } from '../../../shared/theme/spacing';
import { useTranslation } from '../../../shared/i18n';
import { toImageUri } from '../../../shared/utils/mediaUri';

interface ExerciseDetailScreenProps {
  route: { params: { exerciseId: string } };
}

export function ExerciseDetailScreen({ route }: ExerciseDetailScreenProps) {
  const { exerciseId } = route.params;
  const { colors } = useTheme();
  const { t: translations } = useTranslation();
  const t = translations.exerciseDetail;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { exercise, isLoading } = useExerciseDetail(exerciseId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{translations.common.loading}</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{t.notFound}</Text>
      </View>
    );
  }

  // Prioriza el video/GIF ya cacheado; si todavía no está (o nunca hubo
  // proveedor de video para este ejercicio) cae a la miniatura estática, que
  // siempre está disponible offline desde la importación del catálogo.
  const heroUri = exercise.videoLocalPath
    ? toImageUri(exercise.videoLocalPath)
    : exercise.thumbnailLocalPath
    ? toImageUri(exercise.thumbnailLocalPath)
    : exercise.thumbnailRemoteUrl ?? undefined;
  // Solo tiene sentido pedir conexión si hay un proveedor de video asignado
  // a este ejercicio y todavía no se descargó — si nunca hubo match con
  // ningún proveedor, no hay nada que "conectarse a buscar".
  const showOfflineBanner =
    !exercise.videoLocalPath && Boolean(exercise.videoRemoteUrl);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {heroUri ? (
        <Image
          source={{ uri: heroUri }}
          style={styles.hero}
          accessibilityLabel={exercise.name}
        />
      ) : (
        <View style={styles.hero} />
      )}
      {showOfflineBanner && (
        <Text style={styles.offlineBanner}>{t.offlineBannerMessage}</Text>
      )}

      <Text style={styles.name}>{exercise.name}</Text>

      {(exercise.muscleGroup || exercise.equipment) && (
        <View style={styles.metaRow}>
          {exercise.muscleGroup && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t.muscleGroupLabel}</Text>
              <Text style={styles.metaValue}>{exercise.muscleGroup}</Text>
            </View>
          )}
          {exercise.equipment && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t.equipmentLabel}</Text>
              <Text style={styles.metaValue}>{exercise.equipment}</Text>
            </View>
          )}
        </View>
      )}

      {exercise.instructions && (
        <View style={styles.instructionsBlock}>
          <Text style={styles.sectionTitle}>{t.instructionsTitle}</Text>
          <Text style={styles.instructionsText}>{exercise.instructions}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      padding: spacing.md,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      backgroundColor: colors.background,
    },
    message: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
    },
    hero: {
      width: '100%',
      height: 240,
      borderRadius: 12,
      backgroundColor: colors.surfaceActive,
    },
    offlineBanner: {
      marginTop: spacing.sm,
      fontSize: 13,
      color: colors.muted,
      fontStyle: 'italic',
    },
    name: {
      marginTop: spacing.md,
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    metaItem: {
      minWidth: 120,
    },
    metaLabel: {
      fontSize: 12,
      color: colors.muted,
    },
    metaValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    instructionsBlock: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    instructionsText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });
}
