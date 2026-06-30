import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../theme';
import { Badge } from '../components/ui/Badge';
import { useUIStore } from '../store/uiStore';
import { MainTabParamList } from '../types';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import SearchScreen from '../screens/search/SearchScreen';
import MatchesScreen from '../screens/matches/MatchesScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { focused: 'home', unfocused: 'home-outline' },
  Search: { focused: 'search', unfocused: 'search-outline' },
  Matches: { focused: 'heart', unfocused: 'heart-outline' },
  Chat: { focused: 'chatbubble', unfocused: 'chatbubble-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

export function TabNavigator() {
  const matchCount = useUIStore((s) => s.matchCount);
  const unreadMessages = useUIStore((s) => s.unreadMessages);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const icons = tabIcons[route.name as keyof MainTabParamList];
          return (
            <Ionicons
              name={focused ? icons.focused : icons.unfocused}
              size={size}
              color={focused ? colors.primary : colors.tabInactive}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 56,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarBadge: matchCount > 0 ? matchCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.unreadBadge },
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ focused, size }) => (
            <View>
              <Ionicons
                name={focused ? 'chatbubble' : 'chatbubble-outline'}
                size={size}
                color={focused ? colors.primary : colors.tabInactive}
              />
              {unreadMessages > 0 && (
                <Badge
                  count={unreadMessages}
                  size="sm"
                  style={{ position: 'absolute', top: -4, right: -8 }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


