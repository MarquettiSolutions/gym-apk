import type { WeightUnit } from '../../features/settings/types';

const KG_PER_LB = 0.45359237;

// Convierte al vuelo para mostrar en la unidad preferida actual, sin tocar
// el dato crudo guardado (spec 4.4: los registros históricos nunca se
// reescriben cuando cambia la preferencia global de unidad en Ajustes).
export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit,
): number {
  if (from === to) {
    return value;
  }
  return from === 'kg' ? value / KG_PER_LB : value * KG_PER_LB;
}

export function formatWeight(
  value: number,
  from: WeightUnit,
  displayUnit: WeightUnit,
): string {
  const converted = convertWeight(value, from, displayUnit);
  const rounded = Math.round(converted * 10) / 10;
  return `${rounded} ${displayUnit}`;
}
