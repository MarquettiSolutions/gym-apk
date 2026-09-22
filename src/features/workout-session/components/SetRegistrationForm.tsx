import React from 'react';
import { TextField } from '../../../shared/components/TextField';
import { useTranslation } from '../../../shared/i18n';

export interface SetRegistrationValues {
  repsDone: number | null;
  weightDone: number | null;
}

interface SetRegistrationFormProps {
  values: SetRegistrationValues;
  onChange: (values: SetRegistrationValues) => void;
}

function parseIntOrNull(text: string): number | null {
  if (text.trim() === '') {
    return null;
  }
  const parsed = parseInt(text, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseFloatOrNull(text: string): number | null {
  if (text.trim() === '') {
    return null;
  }
  const parsed = parseFloat(text);
  return Number.isNaN(parsed) ? null : parsed;
}

export function SetRegistrationForm({
  values,
  onChange,
}: SetRegistrationFormProps) {
  const { t: translations } = useTranslation();
  const t = translations.workoutSession.session;
  return (
    <>
      <TextField
        label={t.repsLabel}
        keyboardType="number-pad"
        value={values.repsDone !== null ? String(values.repsDone) : ''}
        onChangeText={text =>
          onChange({ ...values, repsDone: parseIntOrNull(text) })
        }
        autoFocus
      />
      <TextField
        label={t.weightLabel}
        keyboardType="numeric"
        value={values.weightDone !== null ? String(values.weightDone) : ''}
        onChangeText={text =>
          onChange({ ...values, weightDone: parseFloatOrNull(text) })
        }
      />
    </>
  );
}
