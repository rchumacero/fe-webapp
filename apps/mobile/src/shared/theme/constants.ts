/** Color palette for the KPLIAN Mobile App, following the Web App dark/deep navy style */
export const Colors = {
  primary: '#10b981', // Emerald 500
  background: '#161c2d', // Deep navy
  card: '#1c2233', // Slightly lighter navy
  sidebar: '#141a29', // Darkest navy
  foreground: '#ececec', // Light grey text
  muted: '#94a3b8', // Slate 400
  border: 'rgba(255, 255, 255, 0.08)',
  accent: 'rgba(255, 255, 255, 0.05)',
  destructive: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Typography = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
  },
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
} as const;
