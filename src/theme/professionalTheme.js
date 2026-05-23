/**
 * Professional Theme for Clinique Marouane
 * Modern, clean design inspired by Facebook/Instagram and professional medical software
 */

// ─── PALETTE ──────────────────────────────────────────────
export const palette = {
  // Primary - Medical Green (trust, health)
  primary: {
    main: '#059669',        // Emerald 600
    light: '#34d399',       // Emerald 400
    dark: '#047857',        // Emerald 700
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Secondary - Professional Blue (trust, professionalism)
  secondary: {
    main: '#3b82f6',        // Blue 500
    light: '#60a5fa',       // Blue 400
    dark: '#2563eb',        // Blue 600
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
  
  // Neutral grays
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
  success: '#059669',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Status colors
  status: {
    en_attente: '#f59e0b',  // Amber
    en_cours: '#3b82f6',    // Blue
    termine: '#059669',     // Green
    paye: '#059669',        // Green
    partiel: '#f59e0b',     // Amber
    annule: '#ef4444',      // Red
  },
}

// ─── TYPOGRAPHY ───────────────────────────────────────────
export const typography = {
  fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  
  h1: {
    fontSize: '2.25rem',    // 36px
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
    color: palette.gray[900],
  },
  h2: {
    fontSize: '1.875rem',   // 30px
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.025em',
    color: palette.gray[900],
  },
  h3: {
    fontSize: '1.5rem',     // 24px
    fontWeight: 700,
    lineHeight: 1.3,
    color: palette.gray[900],
  },
  h4: {
    fontSize: '1.25rem',    // 20px
    fontWeight: 600,
    lineHeight: 1.4,
    color: palette.gray[900],
  },
  h5: {
    fontSize: '1.125rem',   // 18px
    fontWeight: 600,
    lineHeight: 1.4,
    color: palette.gray[800],
  },
  h6: {
    fontSize: '1rem',       // 16px
    fontWeight: 600,
    lineHeight: 1.5,
    color: palette.gray[800],
  },
  body1: {
    fontSize: '1rem',       // 16px
    fontWeight: 400,
    lineHeight: 1.6,
    color: palette.gray[700],
  },
  body2: {
    fontSize: '0.875rem',   // 14px
    fontWeight: 400,
    lineHeight: 1.6,
    color: palette.gray[600],
  },
  caption: {
    fontSize: '0.75rem',    // 12px
    fontWeight: 500,
    lineHeight: 1.5,
    color: palette.gray[500],
  },
  button: {
    fontSize: '0.875rem',   // 14px
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.025em',
  },
}

// ─── SPACING ──────────────────────────────────────────────
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
}

// ─── SHADOWS ──────────────────────────────────────────────
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  cardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  floating: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
}

// ─── BORDER RADIUS ────────────────────────────────────────
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
}

// ─── BREAKPOINTS ──────────────────────────────────────────
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// ─── ANIMATIONS ───────────────────────────────────────────
export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease',
}

// ─── Z-INDEX ──────────────────────────────────────────────
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
}

// ─── COMPONENT STYLES ─────────────────────────────────────
export const componentStyles = {
  // Card
  card: {
    background: '#ffffff',
    borderRadius: borderRadius.lg,
    boxShadow: shadows.card,
    border: `1px solid ${palette.gray[200]}`,
    transition: `all ${transitions.normal}`,
    '&:hover': {
      boxShadow: shadows.cardHover,
      transform: 'translateY(-1px)',
    },
  },
  
  // Button variants
  button: {
    primary: {
      background: palette.primary.main,
      color: '#ffffff',
      '&:hover': {
        background: palette.primary.dark,
        transform: 'translateY(-1px)',
        boxShadow: shadows.md,
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    },
    secondary: {
      background: palette.secondary.main,
      color: '#ffffff',
      '&:hover': {
        background: palette.secondary.dark,
        transform: 'translateY(-1px)',
        boxShadow: shadows.md,
      },
    },
    outlined: {
      background: 'transparent',
      border: `2px solid ${palette.primary.main}`,
      color: palette.primary.main,
      '&:hover': {
        background: palette.primary[50],
      },
    },
    ghost: {
      background: 'transparent',
      color: palette.gray[600],
      '&:hover': {
        background: palette.gray[100],
        color: palette.gray[900],
      },
    },
  },
  
  // Input
  input: {
    border: `1.5px solid ${palette.gray[300]}`,
    borderRadius: borderRadius.md,
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: '0.875rem',
    transition: `all ${transitions.fast}`,
    '&:focus': {
      outline: 'none',
      borderColor: palette.primary.main,
      boxShadow: `0 0 0 3px ${palette.primary[100]}`,
    },
    '&:hover': {
      borderColor: palette.gray[400],
    },
  },
  
  // Badge
  badge: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.full,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
}

// ─── GRADIENTS ────────────────────────────────────────────
export const gradients = {
  primary: `linear-gradient(135deg, ${palette.primary[600]} 0%, ${palette.primary[500]} 100%)`,
  secondary: `linear-gradient(135deg, ${palette.secondary[600]} 0%, ${palette.secondary[500]} 100%)`,
  success: `linear-gradient(135deg, #059669 0%, #10b981 100%)`,
  warning: `linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)`,
  error: `linear-gradient(135deg, #ef4444 0%, #f87171 100%)`,
  hero: `linear-gradient(135deg, #059669 0%, #3b82f6 100%)`,
}

// ─── LAYOUT ───────────────────────────────────────────────
export const layout = {
  sidebar: {
    width: 280,
    collapsedWidth: 72,
  },
  header: {
    height: 64,
  },
  content: {
    maxWidth: 1400,
    padding: spacing['3xl'],
  },
}

// ─── EXPORT DEFAULT THEME ─────────────────────────────────
export default {
  palette,
  typography,
  spacing,
  shadows,
  borderRadius,
  breakpoints,
  transitions,
  zIndex,
  componentStyles,
  gradients,
  layout,
}