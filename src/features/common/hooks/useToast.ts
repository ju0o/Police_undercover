import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: ToastItem) => void;
  push: (message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast: ToastItem) =>
    set((s) => ({ toasts: [...s.toasts, toast] })),
  push: (message: string) =>
    set((s) => ({ toasts: [...s.toasts, { id: `${Date.now()}-${Math.random()}`, message }] })),
  remove: (id: string) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));



