import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  uuid?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  role: "user" | "admin";
  status?: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: string | null;
  isTwoFactorEnabled?: boolean;
  profileCompleted: boolean;
  subscriptionTier: "free" | "basic" | "premium" | "platinum";
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: any, tokens: AuthTokens) => void;
  logout: () => void;
  refreshTokenAction: (tokens: AuthTokens) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: true,

      login: (user, tokens) =>
        set({
          user: {
            ...user,
            id: user.id ?? user.uuid,
            email: user.email ?? "",
            name: user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            subscriptionTier: user.subscriptionTier || "free",
            isEmailVerified: user.isEmailVerified ?? !!user.emailVerifiedAt,
            profileCompleted: user.profileCompleted ?? false,
            role: user.role === "admin" || user.role === "super_admin" ? "admin" : "user",
          } as AuthUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      refreshTokenAction: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      hydrate: () => {
        const state = get();
        if (state.accessToken && state.expiresAt) {
          const isExpired = Date.now() > state.expiresAt;
          if (isExpired) {
            state.logout();
          } else {
            set({ isAuthenticated: true, isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
