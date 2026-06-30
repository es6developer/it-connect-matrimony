export const API_URL = __DEV__
  ? 'http://localhost:4000/api/v1'
  : 'https://api.itconnectmatrimony.com/api/v1';

export const SOCKET_URL = __DEV__
  ? 'http://localhost:4000'
  : 'https://api.itconnectmatrimony.com';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  AUTH_STATE: 'auth_state',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  THEME_MODE: 'theme_mode',
} as const;

export const COLORS = {
  primary: '#0D1B3E',
  primaryDark: '#0A1530',
  primaryLight: '#1A2744',
  secondary: '#42A5F5',
  secondaryDark: '#1565C0',
  secondaryLight: '#90CAF9',
  accent: '#FFB74D',
  accentDark: '#EF6C00',
  premium: '#FFB74D',
  premiumDark: '#EF6C00',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  disabled: '#CBD5E1',
  disabledBackground: '#F1F5F9',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  tabInactive: '#94A3B8',
  tabActive: '#1A73E8',
} as const;

export const FONTS = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const SIZING = {
  inputHeight: 52,
  buttonHeight: 52,
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
    xxl: 128,
  },
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
} as const;

export const SHADOWS = {
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
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

export const MAX_PROFILE_PHOTOS = 6;

export const DEEP_LINK_SCHEME = 'itconnectmatrimony';

export const ONBOARDING_SLIDES = [
  {
    id: 'welcome',
    title: 'Find Your Perfect\nTech Match',
    description:
      'Connect with like-minded professionals in the IT industry who share your passion for technology and innovation.',
    icon: 'code-slash',
    color: '#1A73E8',
  },
  {
    id: 'it-specific',
    title: 'Built for\nIT Professionals',
    description:
      'Discover matches based on your tech stack, career aspirations, and industry experience. We understand your world.',
    icon: 'hardware-chip',
    color: '#7C3AED',
  },
  {
    id: 'matching',
    title: 'Smart Matching\nPowered by AI',
    description:
      'Our intelligent algorithm considers your preferences, interests, and compatibility factors to find meaningful connections.',
    icon: 'sparkles',
    color: '#06D6A0',
  },
] as const;
