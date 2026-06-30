import { create } from "zustand";
import type { AdminUser } from "@/types";

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
}));

interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: AdminUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("admin_token") : null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem("admin_token", token);
    } else {
      localStorage.removeItem("admin_token");
    }
    set({ token });
  },
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem("admin_token");
    set({ user: null, token: null });
  },
}));

interface FilterState {
  search: string;
  status: string;
  role: string;
  dateRange: { from: string; to: string } | null;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setRole: (role: string) => void;
  setDateRange: (range: { from: string; to: string } | null) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  status: "",
  role: "",
  dateRange: null,
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setRole: (role) => set({ role }),
  setDateRange: (dateRange) => set({ dateRange }),
  reset: () => set({ search: "", status: "", role: "", dateRange: null }),
}));
