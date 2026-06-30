"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, AuthUser, AuthTokens } from "@/lib/store/auth-store";
import api, { apiEndpoints, getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  dateOfBirth: string;
}

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const res = await api.post<any>(
          apiEndpoints.auth.login,
          credentials
        );
        const { user, tokens } = res.data.data;
        store.login(user, tokens);
        toast.success(`Welcome back, ${user.firstName}!`);
        router.push(user.profileCompleted ? "/dashboard" : "/profile/wizard");
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [store, router]
  );

  const register = useCallback(
    async (registerData: RegisterData) => {
      try {
        const { data } = await api.post<{ message: string }>(
          apiEndpoints.auth.register,
          registerData
        );
        toast.success(data.message ?? "Registration successful! Please check your email to verify.");
        router.push("/auth/login");
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post(apiEndpoints.auth.logout);
    } catch {
      // continue regardless
    }
    store.logout();
    router.push("/login");
  }, [store, router]);

  const refreshToken = useCallback(
    async (): Promise<boolean> => {
      try {
        const { data } = await api.post<{ tokens: AuthTokens }>(
          apiEndpoints.auth.refresh,
          { refreshToken: store.refreshToken }
        );
        store.refreshTokenAction(data.tokens);
        return true;
      } catch {
        store.logout();
        router.push("/auth/login");
        return false;
      }
    },
    [store, router]
  );

  const updateProfile = useCallback(
    async (updates: Partial<AuthUser>) => {
      try {
        const { data } = await api.patch<{ user: AuthUser }>(
          apiEndpoints.users.updateProfile,
          updates
        );
        store.updateUser(data.user);
        toast.success("Profile updated successfully");
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [store]
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        const { data } = await api.post<{ message: string }>(
          apiEndpoints.auth.forgotPassword,
          { email }
        );
        toast.success(data.message ?? "Password reset link sent to your email");
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        return { success: false, error: message };
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (token: string, password: string) => {
      try {
        const { data } = await api.post<{ message: string }>(
          apiEndpoints.auth.resetPassword,
          { token, password }
        );
        toast.success(data.message ?? "Password reset successfully");
        router.push("/auth/login");
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [router]
  );

  const isTokenExpired = useMemo(() => {
    if (!store.expiresAt) return true;
    return Date.now() > store.expiresAt;
  }, [store.expiresAt]);

  useEffect(() => {
    store.hydrate();
  }, []);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isTokenExpired,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    forgotPassword,
    resetPassword,
  };
}
