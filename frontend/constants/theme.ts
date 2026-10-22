import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  mode: ThemeMode;
  isDark: boolean;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgCardHover: string;
  bgSurfaceSubtle: string;
  bgInput: string;
  border: string;
  borderSubtle: string;
  borderFocus: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  statusBar: 'dark' | 'light';
  cardShadow: any;

  // Semantic convenience tokens
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  inputPlaceholder: string;
  inputText: string;
  headerBg: string;
  headerBorder: string;
  bgTertiary: string;
  divider: string;
  navy: string;
  shadowColor: string;
  overlay: string;

  status: {
    submitted: { bg: string; text: string; border: string };
    assigned: { bg: string; text: string; border: string };
    inProgress: { bg: string; text: string; border: string };
    resolved: { bg: string; text: string; border: string };
    rejected: { bg: string; text: string; border: string };
  };
}

export const lightTheme: ThemeColors = {
  mode: 'light',
  isDark: false,
  // Creamy and soft whitish palette
  bgPrimary: '#FBF9F5',
  bgSecondary: '#F3EFE6',
  bgCard: '#FFFFFF',
  bgCardHover: '#F7F4EE',
  bgSurfaceSubtle: '#EFEAE1',
  bgInput: '#FFFFFF',
  border: '#E8E3D9',
  borderSubtle: '#EDE8DF',
  borderFocus: '#2563EB',
  textPrimary: '#1A1816',
  textSecondary: '#5C554D',
  textMuted: '#8E867C',
  accent: '#2563EB',
  accentHover: '#1D4ED8',
  accentSoft: 'rgba(37, 99, 235, 0.10)',
  statusBar: 'dark',

  // Semantic convenience tokens
  cardBg: '#FFFFFF',
  cardBorder: '#E8E3D9',
  inputBg: '#FFFFFF',
  inputBorder: '#E8E3D9',
  inputPlaceholder: '#8E867C',
  inputText: '#1A1816',
  headerBg: '#FFFFFF',
  headerBorder: '#E8E3D9',
  bgTertiary: '#EFEAE1',
  divider: '#E8E3D9',
  navy: '#173B70',
  shadowColor: '#172033',
  overlay: 'rgba(26, 24, 22, 0.45)',

  cardShadow: Platform.select({
    web: { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)' } as any,
    default: {
      shadowColor: '#172033',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
  }),
  status: {
    submitted: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
    assigned: { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' },
    inProgress: { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
    resolved: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
    rejected: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
  },
};

export const darkTheme: ThemeColors = {
  mode: 'dark',
  isDark: true,
  // Exact login page dark theme palette
  bgPrimary: '#121216',
  bgSecondary: '#161822',
  bgCard: '#181820',
  bgCardHover: '#1F1F2A',
  bgSurfaceSubtle: '#22222D',
  bgInput: '#0E0E12',
  border: '#262632',
  borderSubtle: '#1F1F28',
  borderFocus: '#3B82F6',
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  accent: '#3B82F6',
  accentHover: '#2563EB',
  accentSoft: 'rgba(59, 130, 246, 0.15)',
  statusBar: 'light',

  // Semantic convenience tokens
  cardBg: '#181820',
  cardBorder: '#262632',
  inputBg: '#0E0E12',
  inputBorder: '#262632',
  inputPlaceholder: '#6B7280',
  inputText: '#FFFFFF',
  headerBg: '#181820',
  headerBorder: '#262632',
  bgTertiary: '#232330',
  divider: '#262632',
  navy: '#3B82F6',
  shadowColor: '#000000',
  overlay: 'rgba(0, 0, 0, 0.70)',

  cardShadow: Platform.select({
    web: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)' } as any,
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 4,
    },
  }),
  status: {
    submitted: { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.3)' },
    assigned: { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
    inProgress: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
    resolved: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.3)' },
    rejected: { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  },
};

export const Themes: Record<ThemeMode, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
};

// Backward compatibility with default Expo starter templates
export const Colors = {
  light: {
    text: lightTheme.textPrimary,
    background: lightTheme.bgPrimary,
    tint: lightTheme.accent,
    icon: lightTheme.textMuted,
    tabIconDefault: lightTheme.textMuted,
    tabIconSelected: lightTheme.accent,
  },
  dark: {
    text: darkTheme.textPrimary,
    background: darkTheme.bgPrimary,
    tint: darkTheme.accent,
    icon: darkTheme.textMuted,
    tabIconDefault: darkTheme.textMuted,
    tabIconSelected: darkTheme.accent,
  },
};

export const Fonts = {
  rounded: 'System',
  mono: 'SpaceMono',
};

