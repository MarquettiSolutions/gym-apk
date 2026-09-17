export interface ThemeColors {
  background: string;
  surface: string;
  surfaceActive: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  border: string;
  inputBorder: string;
  danger: string;
  accentSoft: string;
  overlay: string;
}

const light: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F7F7F7',
  surfaceActive: '#ECECEC',
  text: '#1A1A1A',
  muted: '#8A8A8A',
  primary: '#2E7D32',
  onPrimary: '#FFFFFF',
  border: '#EEEEEE',
  inputBorder: '#DDDDDD',
  danger: '#C62828',
  accentSoft: '#E8F5E9',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

const dark: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceActive: '#2A2A2A',
  text: '#F5F5F5',
  muted: '#A0A0A0',
  primary: '#66BB6A',
  onPrimary: '#0A1F0B',
  border: '#2E2E2E',
  inputBorder: '#3A3A3A',
  danger: '#EF5350',
  accentSoft: '#1B3A1D',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const palette = { light, dark };
