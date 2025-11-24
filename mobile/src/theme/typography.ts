// Premium typography system for DotSpark Mobile

export const typography = {
  sizes: {
    xs: 12,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 30,
    '5xl': 36,
  },
  
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.65,
  },

  // Letter spacing for premium feel
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};
