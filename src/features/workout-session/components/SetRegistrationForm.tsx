import React from 'react';
import { TextField } from '../../../shared/components/TextField';
import { es } from '../../../shared/i18n/es';

export interface SetRegistrationValues {
  repsDone: number | null;
  weightDone: number | null;
}

interface SetRegistrationFormProps {
  values: SetRegistrationValues;
  onChange: (values: SetRegistrationValues) => void;
}

const t = es.workoutSession.session;

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
