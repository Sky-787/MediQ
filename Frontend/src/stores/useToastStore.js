// src/stores/useToastStore.js
import { create } from 'zustand';

const useToastStore = create((set) => ({
  toast: {
    show: false,
    message: '',
    type: 'info', // 'info' | 'success' | 'error' | 'warning'
  },

  /**
   * showToast(message, type)
   * Muestra una notificación global.
   */
  showToast: (message, type = 'info') => {
    set({ toast: { show: true, message, type } });
  },

  /**
   * hideToast()
   * Oculta la notificación actual.
   */
  hideToast: () => {
    set({ toast: { show: false, message: '', type: 'info' } });
  },
}));

export default useToastStore;
