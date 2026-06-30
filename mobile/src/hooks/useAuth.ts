import { useState, useCallback } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  User,
  LoginPayload,
  RegisterPayload,
  OtpPayload,
  AuthTokens,
} from '../types';
import AsyncStorage from '../services/asyncStorage';

interface UseAuthReturn {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  verifyOtp: (payload: OtpPayload) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setTokens, logout: storeLogout, setOnboardingComplete } = useAuthStore();

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ user: User } & AuthTokens>(
        '/auth/login',
        payload
      );
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [setTokens, setUser]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', payload);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (payload: OtpPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post<{ user: User } & AuthTokens>(
        '/auth/verify-otp',
        payload
      );
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'OTP verification failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [setTokens, setUser]);

  const resendOtp = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/resend-otp', { email });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to resend OTP.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Failed to send reset email.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.post('/auth/reset-password', { token, password });
      } catch (err: any) {
        const message =
          err?.response?.data?.message || 'Failed to reset password.';
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Log out even if server call fails
    } finally {
      storeLogout();
      setOnboardingComplete(true);
    }
  }, [storeLogout, setOnboardingComplete]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
      await AsyncStorage.setItem('user_data', JSON.stringify(data));
    } catch {
      storeLogout();
    }
  }, [setUser, storeLogout]);

  return {
    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout,
    refreshUser,
    isLoading,
    error,
  };
};
