import { create } from 'zustand';
import AsyncStorage from '../services/asyncStorage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingComplete: boolean;

  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
  logout: () => void;
}

import { User } from '../types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isOnboardingComplete: false,

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    set({ accessToken, refreshToken });
    AsyncStorage.setItem('access_token', accessToken);
    AsyncStorage.setItem('refresh_token', refreshToken);
  },

  setOnboardingComplete: (complete: boolean) => {
    set({ isOnboardingComplete: complete });
    AsyncStorage.setItem('onboarding_completed', complete ? 'true' : 'false');
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, userData, onboarding] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('refresh_token'),
        AsyncStorage.getItem('user_data'),
        AsyncStorage.getItem('onboarding_completed'),
      ]);

      if (accessToken && refreshToken && userData) {
        const user: User = JSON.parse(userData);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isOnboardingComplete: onboarding === 'true',
          isLoading: false,
        });
      } else {
        set({
          isOnboardingComplete: onboarding === 'true',
          isLoading: false,
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    Promise.all([
      AsyncStorage.removeItem('access_token'),
      AsyncStorage.removeItem('refresh_token'),
      AsyncStorage.removeItem('user_data'),
    ]);
  },
}));
