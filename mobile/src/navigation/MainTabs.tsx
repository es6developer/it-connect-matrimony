import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { MatchesScreen } from '../screens/matches/MatchesScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Matches: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, { focused: string; default: string }> = {
  Home: { focused: 'home', default: 'home-outline' },
  Search: { focused: 'search', default: 'search-outline' },
  Matches: { focused: 'heart', default: 'heart-outline' },
  Chat: { focused: 'chatbubbles', default: 'chatbubbles-outline' },
  Profile: { focused: 'person', default: 'person-outline' },
};

const TabBarIcon: React.FC<{
  routeName: keyof MainTabParamList;
  focused: boolean;
  color: string;
  size: number;
}> = ({ routeName, focused, color, size }) => {
  const icons = TAB_ICONS[routeName];
  return (
    <Ionicons
      name={focused ? icons.focused : (icons.default as any)}
      size={size}
      color={color}
    />
  );
};

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon routeName={route.name as keyof MainTabParamList} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: 'Search' }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

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
