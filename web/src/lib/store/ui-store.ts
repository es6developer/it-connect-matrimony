import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

interface Modal {
  id: string;
  isOpen: boolean;
  data?: Record<string, unknown>;
}

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  modals: Modal[];
  toasts: Toast[];
  isMobile: boolean;
  isScrolled: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setMobile: (isMobile: boolean) => void;
  setScrolled: (isScrolled: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  theme: "system",
  modals: [],
  toasts: [],
  isMobile: false,
  isScrolled: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),

  openModal: (id, data) =>
    set((state) => ({
      modals: [
        ...state.modals.filter((m) => m.id !== id),
        { id, isOpen: true, data },
      ],
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    })),

  closeAllModals: () => set({ modals: [] }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = { ...toast, id };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
  setMobile: (isMobile) => set({ isMobile }),
  setScrolled: (isScrolled) => set({ isScrolled }),
}));
