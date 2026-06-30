import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZING } from '../../constants';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface AvatarProps {
  source?: { uri: string } | undefined;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  isOnline?: boolean;
  isPremium?: boolean;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: SIZING.avatar.sm,
  md: SIZING.avatar.md,
  lg: SIZING.avatar.lg,
  xl: SIZING.avatar.xl,
  xxl: SIZING.avatar.xxl,
};

const iconSizeMap: Record<AvatarSize, number> = {
  sm: SIZING.icon.sm,
  md: SIZING.icon.md,
  lg: SIZING.icon.lg,
  xl: SIZING.icon.xl,
  xxl: SIZING.icon.xxl,
};

const fontMap: Record<AvatarSize, number> = {
  sm: FONTS.sizes.sm,
  md: FONTS.sizes.lg,
  lg: FONTS.sizes.xl,
  xl: FONTS.sizes.xxl,
  xxl: FONTS.sizes.display,
};

const getInitials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const stringToColor = (str: string): string => {
  const colors = [
    '#1A73E8', '#7C3AED', '#06D6A0', '#F59E0B',
    '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  style,
  isOnline,
  isPremium,
}) => {
  const [hasError, setHasError] = useState(false);
  const dimension = sizeMap[size];
  const backgroundColor = name ? stringToColor(name) : COLORS.primaryLight;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.avatar,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor,
          },
        ]}
      >
        {source?.uri && !hasError ? (
          <Image
            source={source}
            style={[
              styles.image,
              {
                width: dimension,
                height: dimension,
                borderRadius: dimension / 2,
              },
            ]}
            onError={() => setHasError(true)}
          />
        ) : name ? (
          <Text
            style={[
              styles.initials,
              { fontSize: fontMap[size] * 0.45 },
            ]}
          >
            {getInitials(name)}
          </Text>
        ) : (
          <Ionicons
            name="person"
            size={iconSizeMap[size]}
            color={COLORS.white}
          />
        )}
      </View>
      {isOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dimension * 0.28,
              height: dimension * 0.28,
              borderRadius: (dimension * 0.28) / 2,
              right: dimension * 0.02,
              bottom: dimension * 0.02,
            },
          ]}
        />
      )}
      {isPremium && (
        <View style={styles.premiumBadge}>
          <Ionicons name="star" size={10} color={COLORS.white} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  premiumBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.premium,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
