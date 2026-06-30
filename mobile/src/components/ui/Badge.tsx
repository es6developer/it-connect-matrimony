import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, SIZING } from '../../constants';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'premium';

interface BadgeProps {
  count?: number;
  label?: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  maxCount?: number;
  style?: ViewStyle;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  label,
  variant = 'error',
  size = 'sm',
  maxCount = 99,
  style,
  dot = false,
}) => {
  if (dot) {
    return (
      <View style={[styles.dot, styles[`dot_${variant}`], style]} />
    );
  }

  const displayCount = count !== undefined
    ? count > maxCount
      ? `${maxCount}+`
      : count.toString()
    : null;

  const content = label || displayCount;

  if (!content) return null;

  return (
    <View style={[styles.badge, styles[`badge_${variant}`], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${size}`]]} numberOfLines={1}>
        {content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZING.borderRadius.full,
    minWidth: 18,
  },
  size_sm: {
    height: 18,
    paddingHorizontal: 6,
  },
  size_md: {
    height: 22,
    paddingHorizontal: 8,
    minWidth: 22,
  },
  badge_primary: {
    backgroundColor: COLORS.primary,
  },
  badge_secondary: {
    backgroundColor: COLORS.secondary,
  },
  badge_success: {
    backgroundColor: COLORS.success,
  },
  badge_error: {
    backgroundColor: COLORS.error,
  },
  badge_warning: {
    backgroundColor: COLORS.warning,
  },
  badge_premium: {
    backgroundColor: COLORS.premium,
  },
  text: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  text_sm: {
    fontSize: 10,
  },
  text_md: {
    fontSize: FONTS.sizes.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dot_primary: {
    backgroundColor: COLORS.primary,
  },
  dot_secondary: {
    backgroundColor: COLORS.secondary,
  },
  dot_success: {
    backgroundColor: COLORS.success,
  },
  dot_error: {
    backgroundColor: COLORS.error,
  },
  dot_warning: {
    backgroundColor: COLORS.warning,
  },
  dot_premium: {
    backgroundColor: COLORS.premium,
  },
});
