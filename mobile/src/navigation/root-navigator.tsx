import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { colors } from '../theme';
import { useAuthStore } from '../store/authStore';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { DEEP_LINK_SCHEME } from '../constants';
import { RootStackParamList, AuthStackParamList } from '../types';

import { TabNavigator } from './tab-navigator';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

// Modal screens
import ChatScreen from '../screens/chat/ChatScreen';
import MatchDetailScreen from '../screens/matches/MatchDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import PhotoManagerScreen from '../screens/profile/PhotoManagerScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SupportScreen from '../screens/support/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const linking = {
  prefixes: [Linking.createURL('/'), `${DEEP_LINK_SCHEME}://`],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          Otp: 'otp',
          ForgotPassword: 'forgot-password',
          Onboarding: 'onboarding',
        },
      },
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Search: 'search',
          Matches: 'matches',
          Chat: 'chat',
          Profile: 'profile',
        },
      },
      ChatDetail: 'chat/:conversationId/:userId',
      MatchDetail: 'profile/:userId',
      Settings: 'settings',
      Subscription: 'subscription',
      Notifications: 'notifications',
      Support: 'support',
      EditProfile: 'edit-profile',
      PhotoManager: 'photo-manager',
    },
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        <Stack.Screen
          name="ChatDetail"
          component={ChatScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="MatchDetail"
          component={MatchDetailScreen}
          options={{ presentation: 'modal', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="PhotoManager"
          component={PhotoManagerScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
