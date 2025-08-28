export const theme = {
  colors: {
    // High-contrast palette optimized for seniors
    background: '#F9FAFB',
    surface: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#4D4D4D',
    textMuted: '#6B7280',
    
    // Accent colors with strong contrast
    accent: '#2BB673',
    accentMuted: '#E6F7EF',
    accentDark: '#1F9D55',
    
    // Status colors
    success: '#2BB673',
    warning: '#FFB020',
    error: '#E5484D',
    info: '#3B82F6',
    
    // Borders and dividers
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#F3F4F6',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.3)',
  },
  
  spacing: {
    // Generous whitespace scale for uncluttered layouts
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  borderRadius: {
    // Senior-friendly rounded corners
    sm: 12,
    md: 20,
    lg: 28,
    xl: 32,
    pill: 9999, // For pill buttons
  },
  
  shadows: {
    // Light shadows for cards (Apple style)
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  typography: {
    // Large, readable fonts for seniors
    titleLarge: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 28,
      letterSpacing: -0.3,
    },
    titleSmall: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 22,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    button: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0.2,
    },
  },
  
  // Component-specific dimensions
  components: {
    button: {
      minHeight: 60, // Large touch target for seniors
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    input: {
      minHeight: 56, // Large touch area
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    card: {
      padding: 20,
      margin: 16,
    },
    navBar: {
      height: 88, // Large navigation area
      paddingHorizontal: 20,
    },
  },
  
  // Animation durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

// Type exports for TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeTypography = typeof theme.typography;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeBorderRadius = typeof theme.borderRadius;
export type ThemeShadows = typeof theme.shadows;
