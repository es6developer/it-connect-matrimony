import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZING, SPACING } from '../../constants';

type CardVariant = 'elevated' | 'outlined' | 'flat';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  padded = true,
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.card,
    borderRadius: SIZING.borderRadius.xl,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  flat: {
    backgroundColor: COLORS.background,
  },
  padded: {
    padding: SPACING.md,
  },
});

