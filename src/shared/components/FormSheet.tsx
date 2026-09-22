import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Button } from './Button';
import { useTranslation } from '../i18n';

interface FormSheetProps {
  visible: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  children: ReactNode;
}

export function FormSheet({
  visible,
  title,
  onCancel,
  onSubmit,
  submitLabel,
  submitDisabled = false,
  children,
}: FormSheetProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button
                label={t.common.cancel}
                variant="secondary"
                onPress={onCancel}
              />
            </View>
            <View style={styles.actionButton}>
              <Button
                label={submitLabel ?? t.common.save}
                onPress={onSubmit}
                disabled={submitDisabled}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
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
      maxHeight: '85%',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    actions: {
      flexDirection: 'row',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
}
