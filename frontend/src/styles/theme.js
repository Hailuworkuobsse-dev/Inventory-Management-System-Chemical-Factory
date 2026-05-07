/**
 * Theme configuration for AIMS
 * This file exports theme constants that complement tailwind.config.js
 */

// Color palette - matches tailwind.config.js
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
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
};

// Status color mappings
export const statusColors = {
  // Inventory statuses
  active: colors.success[500],
  inactive: colors.gray[400],
  archived: colors.gray[500],
  
  // Stock levels
  inStock: colors.success[500],
  lowStock: colors.warning[500],
  outOfStock: colors.danger[500],
  
  // Order/PO statuses
  pending: colors.warning[500],
  approved: colors.success[500],
  rejected: colors.danger[500],
  cancelled: colors.gray[400],
  completed: colors.success[600],
  processing: colors.primary[500],
  shipped: colors.primary[600],
  delivered: colors.success[600],
  
  // Quality statuses
  quarantine: colors.danger[500],
  released: colors.success[500],
  testing: colors.warning[500],
  passed: colors.success[500],
  failed: colors.danger[500],
  
  // Expiry risk
  expired: colors.danger[600],
  expiringSoon: colors.danger[500],
  expiringMedium: colors.warning[500],
  expiringLate: colors.primary[400],
  fresh: colors.success[500],
};

// Typography
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Breakpoints (matches Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation durations
export const animationDurations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// Theme variants
export const themes = {
  light: {
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    card: '#ffffff',
  },
  dark: {
    background: '#111827',
    backgroundSecondary: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    card: '#1f2937',
  },
};

// Get current theme from system preference
export const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }
  return 'light';
};

// Export theme config for programmatic use
export const themeConfig = {
  colors,
  statusColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  animationDurations,
  zIndex,
  themes,
  getSystemTheme,
};

export default themeConfig;
