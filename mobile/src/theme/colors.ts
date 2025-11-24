// DotSpark Mobile Theme - Matching Web Design System

export const colors = {
  // Primary amber/orange palette (cognitive elements)
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main amber
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Orange palette (dots, wheels)
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c', // Main orange
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Red palette (chakras)
  red: {
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  
  // Purple palette (AI/neural features)
  purple: {
    500: '#a855f7',
    600: '#7c3aed',
    700: '#6d28d9',
  },
  
  // Cyan palette (perspectives)
  cyan: {
    500: '#06b6d4',
    600: '#0891b2',
  },
  
  // Green palette (success, neural strength)
  green: {
    500: '#10b981',
    600: '#059669',
  },
  
  // Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic colors
  background: {
    primary: '#fffbeb', // Amber 50 - for MyDotSpark
    secondary: '#f0fdf4', // Green 50 - for MyNeura
    social: '#fff7ed', // Orange 50 - for Social
    circles: '#fffbeb', // Amber 50 - for ThinQ Circles
  },
  
  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
};

export const gradients = {
  primary: ['#f59e0b', '#ea580c'], // Amber to Orange
  cognitive: ['#fbbf24', '#f59e0b'], // Light to medium amber
  neural: ['#7c3aed', '#a855f7'], // Purple gradient
  social: ['#ea580c', '#dc2626'], // Orange to red
  card: ['rgba(255, 255, 255, 0.95)', 'rgba(245, 158, 11, 0.05)'], // Subtle gradient
};

// Premium spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

// Premium shadow system
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};
