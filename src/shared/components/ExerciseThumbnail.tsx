import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { toImageUri } from '../utils/mediaUri';

interface ExerciseThumbnailProps {
  localPath?: string | null;
  remoteUrl?: string | null;
  size?: number;
}

export function ExerciseThumbnail({
  localPath,
  remoteUrl,
  size = 48,
}: ExerciseThumbnailProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const uri = localPath ? toImageUri(localPath) : remoteUrl ?? undefined;
  const dimensionStyle = { width: size, height: size, borderRadius: size / 4 };

  if (!uri) {
    return <View style={[styles.placeholder, dimensionStyle]} />;
  }
  return <Image source={{ uri }} style={[styles.image, dimensionStyle]} />;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    placeholder: {
      backgroundColor: colors.surfaceActive,
    },
    image: {
      backgroundColor: colors.surfaceActive,
    },
  });
}
