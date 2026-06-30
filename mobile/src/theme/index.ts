import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, SIZING } from '../constants';

const theme = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  sizing: SIZING,
};

export const typography = StyleSheet.create({
  display: {
    fontSize: FONTS.sizes.display,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: 44,
  },
  h1: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: 38,
  },
  h2: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    lineHeight: 32,
  },
  h3: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  body: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.regular,
    color: COLORS.textTertiary,
    lineHeight: 16,
  },
  button: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textInverse,
    lineHeight: 22,
  },
  buttonSmall: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textInverse,
    lineHeight: 20,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export const shadows = StyleSheet.create({
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
});

export const layout = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  padded: {
    paddingHorizontal: SPACING.md,
  },
  paddedLarge: {
    paddingHorizontal: SPACING.lg,
  },
});

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export default theme;
