// SafeSpace Design System — Calm + Playful (Q1)
// Low-stimulation, accessibility-first, large touch targets

export const theme = {
  // Primary Palette — Calm Lavender
  primary: '#8B7EC8',
  primaryLight: '#B8ADE8',
  primaryDark: '#6B5EA6',
  primarySoft: 'rgba(139, 126, 200, 0.12)',

  // Accent — Warm Mint
  accent: '#6BC5A0',
  accentLight: '#A8E6CF',
  accentDark: '#4BA882',
  accentSoft: 'rgba(107, 197, 160, 0.12)',

  // Warm — Peach
  warm: '#F2A977',
  warmLight: '#FDDCBF',
  warmDark: '#D98B55',
  warmSoft: 'rgba(242, 169, 119, 0.12)',

  // Mood Colors
  moodGreat: '#6BC5A0',
  moodGood: '#87CEEB',
  moodOkay: '#F2D06B',
  moodLow: '#F2A977',
  moodBad: '#E88B8B',

  // Backgrounds — Ultra-soft, low stimulation
  background: '#F8F6FF',
  backgroundSecondary: '#F0EDF8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text — Gentle contrast
  textPrimary: '#2D2845',
  textSecondary: '#7B7494',
  textMuted: '#A9A3BF',
  textOnPrimary: '#FFFFFF',

  // Borders
  border: '#E8E4F0',
  borderLight: '#F0EDF8',

  // Status
  success: '#6BC5A0',
  warning: '#F2D06B',
  error: '#E88B8B',
  info: '#87CEEB',

  // Shadows
  shadowColor: '#2D2845',

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Border Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Typography — Accessibility priority, large sizes
  typography: {
    heroData: { fontSize: 48, fontWeight: '700' as const, color: '#2D2845' },
    heroLabel: { fontSize: 13, fontWeight: '600' as const, color: '#7B7494', textTransform: 'uppercase' as const, letterSpacing: 1 },
    title: { fontSize: 24, fontWeight: '700' as const, color: '#2D2845' },
    subtitle: { fontSize: 18, fontWeight: '600' as const, color: '#2D2845' },
    body: { fontSize: 16, fontWeight: '400' as const, color: '#2D2845', lineHeight: 24 },
    bodyLarge: { fontSize: 18, fontWeight: '400' as const, color: '#2D2845', lineHeight: 28 },
    caption: { fontSize: 14, fontWeight: '400' as const, color: '#7B7494' },
    captionSmall: { fontSize: 12, fontWeight: '500' as const, color: '#A9A3BF' },
    button: { fontSize: 16, fontWeight: '600' as const },
    buttonLarge: { fontSize: 18, fontWeight: '600' as const },
    streakCount: { fontSize: 32, fontWeight: '700' as const, color: '#8B7EC8' },
    xpValue: { fontSize: 24, fontWeight: '700' as const, color: '#6BC5A0' },
    timerLarge: { fontSize: 72, fontWeight: '300' as const, color: '#2D2845', letterSpacing: -2 },
    timerMedium: { fontSize: 48, fontWeight: '300' as const, color: '#2D2845' },
    moodEmoji: { fontSize: 36 },
    chatMessage: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  },

  // Touch targets — Accessibility minimum 48pt
  touch: {
    minimum: 44,
    comfortable: 48,
    large: 56,
    extraLarge: 64,
  },

  // Gradients
  gradients: {
    primary: ['#B8ADE8', '#8B7EC8'],
    calm: ['#E8E4F0', '#F8F6FF'],
    mint: ['#A8E6CF', '#6BC5A0'],
    warm: ['#FDDCBF', '#F2A977'],
    hero: ['#F0EDF8', '#E8E4F0'],
  },
};

export type Theme = typeof theme;
export default theme;
