import { create } from 'zustand';

interface UIState {
  isDarkMode: boolean;
  isGlobalLoading: boolean;
  activeModal: string | null;

  toggleDarkMode: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setActiveModal: (modal: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: false,
  isGlobalLoading: false,
  activeModal: null,

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  setGlobalLoading: (isGlobalLoading: boolean) => {
    set({ isGlobalLoading });
  },

  setActiveModal: (activeModal: string | null) => {
    set({ activeModal });
  },
}));
