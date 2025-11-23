/**
 * Design System Configuration
 * 
 * Central source of truth for:
 * - Color palette
 * - Typography scale
 * - Spacing system
 * - Animation timings
 * - Component variants
 * 
 * Usage: Import tokens instead of hardcoding values
 * Example: import { colors, spacing } from '@/lib/design-system'
 */

// ============================================
// COLOR SYSTEM
// ============================================

export const colors = {
  // Primary (Trust & Action)
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A', // Brand primary
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // Secondary (Professional Info)
  secondary: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2', // Professional blue
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  
  // Success (Validation Passed)
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669', // Success green
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Warning (Needs Attention)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Warning amber
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Danger (Errors)
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626', // Error red
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Neutral (Backgrounds & Text)
  neutral: {
    50: '#F9FAFB',   // Light background
    100: '#F3F4F6',  // Subtle background
    200: '#E5E7EB',  // Border light
    300: '#D1D5DB',  // Border default
    400: '#9CA3AF',  // Placeholder text
    500: '#6B7280',  // Secondary text
    600: '#4B5563',  // Primary text
    700: '#374151',  // Headings
    800: '#1F2937',  // Dark headings
    900: '#111827',  // Maximum contrast
  },
} as const

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  // Font families
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px - Labels, captions
    sm: '0.875rem',   // 14px - Small text
    base: '1rem',     // 16px - Body text
    lg: '1.125rem',   // 18px - Lead text
    xl: '1.25rem',    // 20px - H3
    '2xl': '1.5rem',  // 24px - H2
    '3xl': '1.875rem', // 30px - H2 large
    '4xl': '2.25rem', // 36px - H1
    '5xl': '3rem',    // 48px - Display/Hero
    '6xl': '3.75rem', // 60px - Large display
  },
  
  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,   // Headings
    normal: 1.5,  // Body text
    relaxed: 1.75, // Spacious text
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const

// ============================================
// SPACING SYSTEM
// ============================================

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px - default
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  '5xl': '8rem',   // 128px
} as const

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',  // Circular
} as const

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

// ============================================
// ANIMATION TIMINGS
// ============================================

export const animation = {
  // Durations
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy
  },
  
  // Transition presets
  transition: {
    default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================
// Z-INDEX LAYERS
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const

// ============================================
// COMPONENT VARIANTS
// ============================================

export const components = {
  // Button sizes
  button: {
    size: {
      sm: {
        padding: '0.5rem 1rem',
        fontSize: typography.fontSize.sm,
        borderRadius: borderRadius.md,
      },
      md: {
        padding: '0.75rem 1.5rem',
        fontSize: typography.fontSize.base,
        borderRadius: borderRadius.lg,
      },
      lg: {
        padding: '1rem 2rem',
        fontSize: typography.fontSize.lg,
        borderRadius: borderRadius.lg,
      },
    },
  },
  
  // Card styles
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    shadow: shadows.lg,
    border: `1px solid ${colors.neutral[200]}`,
  },
  
  // Input styles
  input: {
    padding: '0.75rem 1rem',
    fontSize: typography.fontSize.base,
    borderRadius: borderRadius.lg,
    border: `2px solid ${colors.neutral[300]}`,
    focusBorder: `2px solid ${colors.primary[600]}`,
  },
} as const

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate CSS variables from design tokens
 * Usage: Add to global CSS or Next.js _app
 */
export function generateCSSVariables() {
  return `
    :root {
      /* Primary Colors */
      --color-primary-50: ${colors.primary[50]};
      --color-primary-600: ${colors.primary[600]};
      --color-primary-700: ${colors.primary[700]};
      
      /* Neutral Colors */
      --color-neutral-50: ${colors.neutral[50]};
      --color-neutral-100: ${colors.neutral[100]};
      --color-neutral-300: ${colors.neutral[300]};
      --color-neutral-600: ${colors.neutral[600]};
      --color-neutral-900: ${colors.neutral[900]};
      
      /* Spacing */
      --spacing-xs: ${spacing.xs};
      --spacing-sm: ${spacing.sm};
      --spacing-md: ${spacing.md};
      --spacing-lg: ${spacing.lg};
      --spacing-xl: ${spacing.xl};
      
      /* Typography */
      --font-family: ${typography.fontFamily.sans};
      --font-size-base: ${typography.fontSize.base};
      --line-height-normal: ${typography.lineHeight.normal};
      
      /* Animation */
      --transition-default: ${animation.transition.default};
    }
  `
}

/**
 * Get responsive value based on breakpoint
 */
export function responsive<T>(values: {
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}): string {
  const entries = Object.entries(values)
  return entries
    .map(([breakpoint, value]) => {
      const bp = breakpoints[breakpoint as keyof typeof breakpoints]
      return `@media (min-width: ${bp}) { ${value} }`
    })
    .join(' ')
}

/**
 * Generate color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// ============================================
// SEMANTIC COLOR TOKENS
// ============================================

/**
 * Semantic colors for common UI patterns
 * Use these instead of raw color values
 */
export const semantic = {
  // Backgrounds
  bg: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    elevated: '#FFFFFF',
    overlay: withOpacity(colors.neutral[900], 0.5),
  },
  
  // Text
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[400],
    inverse: '#FFFFFF',
  },
  
  // Borders
  border: {
    default: colors.neutral[300],
    light: colors.neutral[200],
    dark: colors.neutral[400],
  },
  
  // Interactive elements
  interactive: {
    default: colors.primary[600],
    hover: colors.primary[700],
    active: colors.primary[800],
    disabled: colors.neutral[300],
  },
  
  // Status colors
  status: {
    success: colors.success[600],
    warning: colors.warning[500],
    error: colors.danger[600],
    info: colors.secondary[600],
  },
} as const

// ============================================
// EXPORT ALL
// ============================================

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  components,
  semantic,
}
