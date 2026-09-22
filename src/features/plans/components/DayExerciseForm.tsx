import React from 'react';
import { TextField } from '../../../shared/components/TextField';
import { useTranslation } from '../../../shared/i18n';
import type { DayExerciseFormValues } from '../types';

interface DayExerciseFormProps {
  values: DayExerciseFormValues;
  onChange: (values: DayExerciseFormValues) => void;
}

function parseIntOrZero(text: string): number {
  const parsed = parseInt(text, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseFloatOrZero(text: string): number {
  const parsed = parseFloat(text);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function DayExerciseForm({ values, onChange }: DayExerciseFormProps) {
  const { t: translations } = useTranslation();
  const t = translations.plans.dayEditor;
  return (
    <>
      <TextField
        label={t.setsLabel}
        keyboardType="number-pad"
        value={String(values.targetSets)}
        onChangeText={text =>
          onChange({ ...values, targetSets: parseIntOrZero(text) })
        }
      />
      <TextField
        label={t.repsLabel}
        keyboardType="number-pad"
        value={String(values.targetReps)}
        onChangeText={text =>
          onChange({ ...values, targetReps: parseIntOrZero(text) })
        }
      />
      <TextField
        label={t.weightLabel}
        keyboardType="numeric"
        value={values.targetWeight !== null ? String(values.targetWeight) : ''}
        onChangeText={text =>
          onChange({
            ...values,
            targetWeight: text.trim() === '' ? null : parseFloatOrZero(text),
          })
        }
      />
      <TextField
        label={t.restLabel}
        keyboardType="number-pad"
        value={String(values.restSeconds)}
        onChangeText={text =>
          onChange({ ...values, restSeconds: parseIntOrZero(text) })
        }
      />
      <TextField
        label={t.notesLabel}
        value={values.notes ?? ''}
        onChangeText={text =>
          onChange({ ...values, notes: text.trim() === '' ? null : text })
        }
        multiline
      />
    </>
  );
}
