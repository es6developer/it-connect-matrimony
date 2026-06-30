import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants';

const TAB_ICONS: Record<string, { focused: string; default: string }> = {
  index: { focused: 'home', default: 'home-outline' },
  search: { focused: 'search', default: 'search-outline' },
  matches: { focused: 'heart', default: 'heart-outline' },
  chat: { focused: 'chatbubbles', default: 'chatbubbles-outline' },
  profile: { focused: 'person', default: 'person-outline' },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return (
            <Ionicons
              name={focused ? icons.focused : (icons.default as any)}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: true,
      })}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
      <Tabs.Screen name="search" options={{ tabBarLabel: 'Search' }} />
      <Tabs.Screen name="matches" options={{ tabBarLabel: 'Matches' }} />
      <Tabs.Screen name="chat" options={{ tabBarLabel: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: SPACING.xs,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});
