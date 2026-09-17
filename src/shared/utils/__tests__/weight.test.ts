import { convertWeight, formatWeight } from '../weight';

describe('weight', () => {
  it('convertWeight devuelve el mismo valor si la unidad no cambia', () => {
    expect(convertWeight(80, 'kg', 'kg')).toBe(80);
    expect(convertWeight(176, 'lb', 'lb')).toBe(176);
  });

  it('convertWeight convierte kg a lb', () => {
    expect(convertWeight(100, 'kg', 'lb')).toBeCloseTo(220.46, 1);
  });

  it('convertWeight convierte lb a kg', () => {
    expect(convertWeight(220.46, 'lb', 'kg')).toBeCloseTo(100, 1);
  });

  it('formatWeight redondea a un decimal y agrega la unidad de destino', () => {
    expect(formatWeight(100, 'kg', 'lb')).toBe('220.5 lb');
    expect(formatWeight(80, 'kg', 'kg')).toBe('80 kg');
  });
});
