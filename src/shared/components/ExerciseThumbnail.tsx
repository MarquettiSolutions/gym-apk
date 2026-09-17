import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface ExerciseThumbnailProps {
  localPath?: string | null;
  remoteUrl?: string | null;
  size?: number;
}

function toImageUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('http')) {
    return path;
  }
  return `file://${path}`;
}

export function ExerciseThumbnail({
  localPath,
  remoteUrl,
  size = 48,
}: ExerciseThumbnailProps) {
  const uri = localPath ? toImageUri(localPath) : remoteUrl ?? undefined;
  const dimensionStyle = { width: size, height: size, borderRadius: size / 4 };

  if (!uri) {
    return <View style={[styles.placeholder, dimensionStyle]} />;
  }
  return <Image source={{ uri }} style={[styles.image, dimensionStyle]} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#E0E0E0',
  },
  image: {
    backgroundColor: '#F0F0F0',
  },
});
