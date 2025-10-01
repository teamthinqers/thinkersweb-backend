/**
 * DotSpark Design System
 * 
 * Complete brand identity, colors, fonts, and theme configuration
 * Can be imported and used in any project to maintain brand consistency
 * 
 * Usage in another project:
 * 1. Copy this file to your new project
 * 2. Import the values you need:
 *    import { brandColors, typography, animations } from './dotspark-design-system'
 * 3. Use in your Tailwind config or CSS
 */

// ============================================================================
// BRAND IDENTITY
// ============================================================================

export const brandIdentity = {
  name: "DotSpark",
  tagline: "Your Neural Extension for Cognitive Enhancement",
  domain: "dotspark.in",
  socialDomain: "dotspark.social (planned)",
  description: "Personalized learning management system with neural extension capabilities",
};

// ============================================================================
// COLOR SYSTEM
// ============================================================================

/**
 * Primary Color Palette (Amber/Orange - Personal/Cognitive)
 * Used for: Personal content, dots, wheels, chakras, cognitive features
 */
export const personalColors = {
  // Amber shades
  amber50: { hsl: "33 100% 96%", hex: "#FFFBEB" },
  amber100: { hsl: "33 92% 90%", hex: "#FEF3C7" },
  amber200: { hsl: "32 98% 83%", hex: "#FDE68A" },
  amber300: { hsl: "32 95% 70%", hex: "#FCD34D" },
  amber400: { hsl: "30 95% 60%", hex: "#FBBF24" },
  amber500: { hsl: "30 85% 55%", hex: "#F59E0B" },
  amber600: { hsl: "30 85% 45%", hex: "#D97706" },
  amber700: { hsl: "28 85% 35%", hex: "#B45309" },
  amber800: { hsl: "25 75% 28%", hex: "#92400E" },
  amber900: { hsl: "23 70% 22%", hex: "#78350F" },
  
  // Orange shades
  orange50: { hsl: "33 100% 96%", hex: "#FFF7ED" },
  orange100: { hsl: "34 100% 92%", hex: "#FFEDD5" },
  orange200: { hsl: "32 97% 83%", hex: "#FED7AA" },
  orange300: { hsl: "31 97% 72%", hex: "#FDBA74" },
  orange400: { hsl: "27 96% 61%", hex: "#FB923C" },
  orange500: { hsl: "25 95% 53%", hex: "#F97316" },
  orange600: { hsl: "21 90% 48%", hex: "#EA580C" },
  orange700: { hsl: "17 88% 40%", hex: "#C2410C" },
  orange800: { hsl: "15 79% 34%", hex: "#9A3412" },
  orange900: { hsl: "13 75% 28%", hex: "#7C2D12" },
};

/**
 * AI Colors (Purple/Indigo)
 * Used for: AI-powered features, neural processing, AI mode
 */
export const aiColors = {
  purple50: { hsl: "270 100% 98%", hex: "#FAF5FF" },
  purple100: { hsl: "269 100% 95%", hex: "#F3E8FF" },
  purple200: { hsl: "269 100% 92%", hex: "#E9D5FF" },
  purple300: { hsl: "269 97% 85%", hex: "#D8B4FE" },
  purple400: { hsl: "270 95% 75%", hex: "#C084FC" },
  purple500: { hsl: "271 91% 65%", hex: "#A855F7" },
  purple600: { hsl: "271 81% 56%", hex: "#9333EA" },
  purple700: { hsl: "272 72% 47%", hex: "#7E22CE" },
  purple800: { hsl: "273 67% 39%", hex: "#6B21A8" },
  purple900: { hsl: "274 66% 32%", hex: "#581C87" },
  
  indigo50: { hsl: "226 100% 97%", hex: "#EEF2FF" },
  indigo100: { hsl: "226 100% 94%", hex: "#E0E7FF" },
  indigo200: { hsl: "228 96% 89%", hex: "#C7D2FE" },
  indigo300: { hsl: "230 94% 82%", hex: "#A5B4FC" },
  indigo400: { hsl: "234 89% 74%", hex: "#818CF8" },
  indigo500: { hsl: "239 84% 67%", hex: "#6366F1" },
  indigo600: { hsl: "243 75% 59%", hex: "#4F46E5" },
  indigo700: { hsl: "245 58% 51%", hex: "#4338CA" },
  indigo800: { hsl: "244 55% 41%", hex: "#3730A3" },
  indigo900: { hsl: "242 47% 34%", hex: "#312E81" },
};

/**
 * Social Colors (Red/Orange)
 * Used for: Social features, community, shared content, collective intelligence
 */
export const socialColors = {
  red50: { hsl: "0 86% 97%", hex: "#FEF2F2" },
  red100: { hsl: "0 93% 94%", hex: "#FEE2E2" },
  red200: { hsl: "0 96% 89%", hex: "#FECACA" },
  red300: { hsl: "0 94% 82%", hex: "#FCA5A5" },
  red400: { hsl: "0 91% 71%", hex: "#F87171" },
  red500: { hsl: "0 84% 60%", hex: "#EF4444" },
  red600: { hsl: "0 72% 51%", hex: "#DC2626" },
  red700: { hsl: "0 74% 42%", hex: "#B91C1C" },
  red800: { hsl: "0 70% 35%", hex: "#991B1B" },
  red900: { hsl: "0 63% 31%", hex: "#7F1D1D" },
};

/**
 * WhatsApp Integration Colors
 * Used for: WhatsApp integration features
 */
export const whatsAppColors = {
  green: { hsl: "142 70% 45%", hex: "#25D366" },
  darkGreen: { hsl: "158 100% 16%", hex: "#075E54" },
  lightGreen: { hsl: "94 56% 92%", hex: "#DCF8C6" },
  background: { hsl: "36 33% 91%", hex: "#ECE5DD" },
  // Dark mode variants
  darkModeGreen: { hsl: "142 70% 45%", hex: "#25D366" },
  darkModeDarkGreen: { hsl: "158 90% 20%", hex: "#128C7E" },
};

/**
 * Core UI Colors (Theme System)
 * Base colors for the application UI
 */
export const coreColors = {
  light: {
    background: { hsl: "33 20% 96%", hex: "#F5F2EE" },
    foreground: { hsl: "25 30% 15%", hex: "#2D2418" },
    card: { hsl: "30 25% 98%", hex: "#FAF8F6" },
    cardForeground: { hsl: "25 30% 15%", hex: "#2D2418" },
    popover: { hsl: "30 25% 98%", hex: "#FAF8F6" },
    popoverForeground: { hsl: "25 30% 15%", hex: "#2D2418" },
    primary: { hsl: "30 85% 35%", hex: "#AF5F0B" },
    primaryForeground: { hsl: "30 15% 95%", hex: "#F7F3EF" },
    secondary: { hsl: "35 65% 45%", hex: "#C97416" },
    secondaryForeground: { hsl: "30 15% 95%", hex: "#F7F3EF" },
    muted: { hsl: "32 25% 90%", hex: "#EFEAE3" },
    mutedForeground: { hsl: "28 20% 50%", hex: "#998466" },
    accent: { hsl: "38 75% 55%", hex: "#E5A327" },
    accentForeground: { hsl: "30 15% 95%", hex: "#F7F3EF" },
    destructive: { hsl: "0 84.2% 60.2%", hex: "#EF4444" },
    destructiveForeground: { hsl: "30 15% 95%", hex: "#F7F3EF" },
    border: { hsl: "32 20% 85%", hex: "#E3DCD1" },
    input: { hsl: "32 20% 85%", hex: "#E3DCD1" },
    ring: { hsl: "30 85% 35%", hex: "#AF5F0B" },
  },
  dark: {
    background: { hsl: "25 30% 8%", hex: "#1A130D" },
    foreground: { hsl: "30 15% 92%", hex: "#EAE6E2" },
    card: { hsl: "25 25% 10%", hex: "#1F1812" },
    cardForeground: { hsl: "30 15% 92%", hex: "#EAE6E2" },
    popover: { hsl: "25 25% 10%", hex: "#1F1812" },
    popoverForeground: { hsl: "30 15% 92%", hex: "#EAE6E2" },
    primary: { hsl: "35 75% 55%", hex: "#E5A327" },
    primaryForeground: { hsl: "25 20% 10%", hex: "#211A14" },
    secondary: { hsl: "30 45% 35%", hex: "#825F2C" },
    secondaryForeground: { hsl: "30 15% 92%", hex: "#EAE6E2" },
    muted: { hsl: "28 20% 15%", hex: "#2E251D" },
    mutedForeground: { hsl: "32 15% 65%", hex: "#B3A394" },
    accent: { hsl: "38 65% 45%", hex: "#C98A21" },
    accentForeground: { hsl: "25 20% 10%", hex: "#211A14" },
    destructive: { hsl: "0 62.8% 50%", hex: "#DC2626" },
    destructiveForeground: { hsl: "30 15% 92%", hex: "#EAE6E2" },
    border: { hsl: "28 20% 18%", hex: "#36291E" },
    input: { hsl: "28 20% 18%", hex: "#36291E" },
    ring: { hsl: "35 75% 55%", hex: "#E5A327" },
  },
};

/**
 * Brand Color Gradients
 * Pre-defined gradient combinations for consistent branding
 */
export const brandGradients = {
  // Personal/Cognitive gradients
  personalPrimary: "from-amber-500 to-orange-500",
  personalSecondary: "from-amber-600 to-orange-600",
  personalLight: "from-amber-400 to-orange-400",
  personalSubtle: "from-amber-50 to-orange-100",
  
  // AI gradients
  aiPrimary: "from-purple-500 to-indigo-500",
  aiSecondary: "from-purple-600 to-indigo-600",
  aiLight: "from-purple-400 to-indigo-400",
  aiSubtle: "from-purple-50 to-indigo-100",
  
  // Social gradients
  socialPrimary: "from-red-500 to-orange-500",
  socialSecondary: "from-red-600 to-orange-600",
  socialLight: "from-red-400 to-orange-400",
  socialSubtle: "from-red-50 to-orange-100",
  
  // Text gradients (for headings)
  headingPersonal: "from-amber-700 to-orange-600",
  headingAI: "from-purple-700 to-indigo-600",
  headingSocial: "from-red-700 to-orange-600",
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  /**
   * Font Families
   * Note: You'll need to import these fonts in your project
   */
  fonts: {
    sans: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif',
    ].join(', '),
    
    display: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      'sans-serif',
    ].join(', '),
  },
  
  /**
   * Font Sizes
   */
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  /**
   * Font Weights
   */
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  /**
   * Line Heights
   */
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// ============================================================================
// SPACING & SIZING
// ============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
};

export const borderRadius = {
  none: '0',
  sm: 'calc(0.5rem - 4px)',  // 4px
  DEFAULT: '0.5rem',          // 8px
  md: 'calc(0.5rem - 2px)',  // 6px
  lg: '0.5rem',              // 8px
  xl: '0.75rem',             // 12px
  '2xl': '1rem',             // 16px
  '3xl': '1.5rem',           // 24px
  full: '9999px',
};

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  /**
   * Keyframe Definitions
   */
  keyframes: {
    // Floating animation
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    floatSlow: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-6px)' },
    },
    
    // Pulsing animations
    pulseSlow: {
      '0%, 100%': { opacity: '0.8' },
      '50%': { opacity: '0.4' },
    },
    pulsate: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.7' },
    },
    
    // Sparkling effect
    sparkling: {
      '0%': { transform: 'scale(1)', opacity: '0.8' },
      '50%': { transform: 'scale(1.2)', opacity: '1' },
      '100%': { transform: 'scale(1)', opacity: '0.8' },
    },
    
    // Ping effects
    pingSlow: {
      '0%': { transform: 'scale(1)', opacity: '1' },
      '75%, 100%': { transform: 'scale(1.2)', opacity: '0' },
    },
    pingSlower: {
      '0%': { transform: 'scale(1)', opacity: '0.8' },
      '75%, 100%': { transform: 'scale(1.3)', opacity: '0' },
    },
    
    // Ripple effect
    ripple: {
      '0%': { transform: 'scale(0)', opacity: '0.7' },
      '80%': { transform: 'scale(1)', opacity: '0.2' },
      '100%': { transform: 'scale(1)', opacity: '0' },
    },
    
    // Typewriter effect
    typing: {
      '0%': { width: '0%', borderColor: 'transparent' },
      '5%': { borderColor: 'hsl(var(--primary))' },
      '50%': { width: '100%' },
      '95%': { borderColor: 'hsl(var(--primary))' },
      '100%': { borderColor: 'transparent' },
    },
    
    // Gradient animation
    gradient: {
      '0%': { backgroundPosition: '0% 50%' },
      '50%': { backgroundPosition: '100% 50%' },
      '100%': { backgroundPosition: '0% 50%' },
    },
    
    // Orbit animation
    orbit: {
      '0%': { transform: 'translateX(6px) translateY(0px)' },
      '25%': { transform: 'translateX(4px) translateY(4px)' },
      '50%': { transform: 'translateX(0px) translateY(6px)' },
      '75%': { transform: 'translateX(-4px) translateY(4px)' },
      '100%': { transform: 'translateX(-6px) translateY(0px)' },
    },
  },
  
  /**
   * Animation Classes
   */
  classes: {
    float: 'animate-float',
    floatSlow: 'animate-float-slow',
    pulseSlow: 'animate-pulse-slow',
    pulsate: 'animate-pulsate',
    sparkling: 'animate-sparkling',
    pingSlow: 'animate-ping-slow',
    pingSlower: 'animate-ping-slower',
    ripple: 'animate-ripple',
    typing: 'animate-typing',
    gradient: 'animate-gradient',
    orbit: 'animate-orbit',
  },
  
  /**
   * Transition Durations
   */
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  
  /**
   * Easing Functions
   */
  easings: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================================================
// COMPONENT STYLES
// ============================================================================

/**
 * Common component style patterns
 */
export const componentStyles = {
  /**
   * Card styles
   */
  card: {
    base: 'bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800',
    hover: 'transition-all duration-300 hover:shadow-md hover:-translate-y-1',
    interactive: 'cursor-pointer hover:border-amber-300 dark:hover:border-amber-700',
  },
  
  /**
   * Button styles
   */
  button: {
    primary: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md transition-all',
    secondary: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md transition-all',
    social: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-md transition-all',
    outline: 'border-2 border-amber-500 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all',
    ghost: 'text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all',
  },
  
  /**
   * Badge/Tag styles
   */
  badge: {
    personal: 'bg-amber-100 text-amber-800 border border-amber-200',
    ai: 'bg-purple-100 text-purple-800 border border-purple-200',
    social: 'bg-red-100 text-red-800 border border-red-200',
  },
  
  /**
   * Input styles
   */
  input: {
    base: 'border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
  },
};

// ============================================================================
// FEATURE-SPECIFIC COLORS
// ============================================================================

/**
 * Cognitive Structure Colors
 */
export const cognitiveColors = {
  dot: {
    natural: 'from-amber-500 to-orange-500',   // Natural mode dots
    ai: 'from-purple-500 to-indigo-500',       // AI mode dots
    text: 'text-amber-700',
    border: 'border-amber-300',
    background: 'bg-amber-50',
  },
  wheel: {
    primary: 'from-amber-600 to-orange-600',
    text: 'text-amber-800',
    border: 'border-amber-400',
    background: 'bg-amber-100',
  },
  chakra: {
    primary: 'from-orange-600 to-red-500',
    text: 'text-orange-800',
    border: 'border-orange-400',
    background: 'bg-orange-100',
  },
};

// ============================================================================
// LOGO & BRAND ASSETS
// ============================================================================

export const brandAssets = {
  logo: {
    // SVG paths or URLs would go here
    primary: 'DotSpark logo with amber-orange gradient',
    monochrome: 'DotSpark logo in single color',
    icon: 'DotSpark icon (just the spark symbol)',
  },
  
  favicon: {
    sizes: ['16x16', '32x32', '48x48', '64x64'],
    format: 'ICO or PNG',
  },
  
  socialMediaAssets: {
    ogImage: '1200x630px with DotSpark branding',
    twitterCard: '1200x675px with DotSpark branding',
  },
};

// ============================================================================
// USAGE GUIDELINES
// ============================================================================

export const usageGuidelines = {
  colorMapping: {
    personal: 'Use amber/orange colors for personal content, user-specific features',
    ai: 'Use purple/indigo colors for AI-powered features, neural processing',
    social: 'Use red/orange colors for social features, community, shared content',
    whatsapp: 'Use official WhatsApp green for WhatsApp integration features',
  },
  
  typography: {
    headings: 'Use gradient text for main headings with bg-gradient-to-r and bg-clip-text',
    body: 'Use foreground color for body text',
    emphasis: 'Use amber-700 or orange-600 for emphasized text',
  },
  
  animations: {
    cognitive: 'Use floating, pulsing, and sparkling animations for cognitive elements',
    interactive: 'Use subtle hover effects (scale, shadow) for interactive elements',
    loading: 'Use pulse or ripple animations for loading states',
  },
};

// ============================================================================
// TAILWIND CSS CONFIGURATION EXPORT
// ============================================================================

/**
 * Ready-to-use Tailwind CSS theme configuration
 * Copy this into your tailwind.config.ts extend section
 */
export const tailwindThemeExtension = {
  colors: {
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    // Add other colors as needed
  },
  animation: {
    'float': 'float 4s ease-in-out infinite',
    'float-slow': 'float-slow 5s ease-in-out infinite',
    'pulsate': 'pulsate 2s ease-in-out infinite',
    'sparkling': 'sparkling 2s ease-in-out infinite',
    'ping-slow': 'ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite',
    'ripple': 'ripple 0.6s ease-out',
  },
};

// ============================================================================
// CSS CUSTOM PROPERTIES EXPORT
// ============================================================================

/**
 * CSS Custom Properties for direct use in CSS files
 * Copy these into your :root selector
 */
export const cssVariables = {
  light: `
    --background: 33 20% 96%;
    --foreground: 25 30% 15%;
    --primary: 30 85% 35%;
    --primary-foreground: 30 15% 95%;
    --secondary: 35 65% 45%;
    --secondary-foreground: 30 15% 95%;
    --accent: 38 75% 55%;
    --accent-foreground: 30 15% 95%;
    --border: 32 20% 85%;
    --radius: 0.5rem;
  `,
  dark: `
    --background: 25 30% 8%;
    --foreground: 30 15% 92%;
    --primary: 35 75% 55%;
    --primary-foreground: 25 20% 10%;
    --secondary: 30 45% 35%;
    --secondary-foreground: 30 15% 92%;
    --accent: 38 65% 45%;
    --accent-foreground: 25 20% 10%;
    --border: 28 20% 18%;
    --radius: 0.5rem;
  `,
};

// ============================================================================
// QUICK REFERENCE
// ============================================================================

export const quickReference = {
  primaryBrand: {
    color: 'Amber/Orange',
    gradient: 'from-amber-500 to-orange-500',
    use: 'Personal features, cognitive elements',
  },
  aiBrand: {
    color: 'Purple/Indigo',
    gradient: 'from-purple-500 to-indigo-500',
    use: 'AI features, neural processing',
  },
  socialBrand: {
    color: 'Red/Orange',
    gradient: 'from-red-500 to-orange-500',
    use: 'Social features, community',
  },
};

export default {
  brandIdentity,
  personalColors,
  aiColors,
  socialColors,
  whatsAppColors,
  coreColors,
  brandGradients,
  typography,
  spacing,
  borderRadius,
  animations,
  componentStyles,
  cognitiveColors,
  brandAssets,
  usageGuidelines,
  tailwindThemeExtension,
  cssVariables,
  quickReference,
};
