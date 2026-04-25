// src/stores/useAuthStore.js
import { create } from 'zustand'
import axiosInstance from '../api/axiosInstance'

export const useAuthStore = create((set, get) => ({
  // ─── Estado ───────────────────────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  isLoading: true,   // true desde el inicio → evita flicker al recargar (F5)
  error: null,

  // ─── Acciones ─────────────────────────────────────────────────────────────

  /**
   * checkSession()
   * Verifica si hay una cookie activa llamando a GET /auth/me.
   * Se llama automáticamente desde ProtectedRoute al montar.
   */
  checkSession: async () => {
    try {
      const { data } = await axiosInstance.get('/auth/me')
      if (data && data.data) {
        set({ user: data.data, isAuthenticated: true })
      } else {
        set({ user: null, isAuthenticated: false })
      }
    } catch {
      // 401 u otro error → sin sesión activa, no es error de la app
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * login(email, password)
   * Llama POST /auth/login y guarda el usuario en el store.
   */
  login: async (email, password) => {
    try {
      set({ error: null })
      const { data } = await axiosInstance.post('/auth/login', {
        email,
        contrasena: password,
      })
      if (data && data.data) {
        set({ user: data.data, isAuthenticated: true })
      } else {
        set({ user: data, isAuthenticated: true })
      }
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error al iniciar sesión. Verifica tus credenciales.'
      set({ error: mensaje })
      throw error
    }
  },

  /**
   * logout()
   * Llama POST /auth/logout y limpia el estado.
   */
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch {
      // Ignorar errores de red en logout
    } finally {
      set({ user: null, isAuthenticated: false, error: null })
    }
  },

  /** clearError() — limpia el último error sin hacer logout */
  clearError: () => set({ error: null }),

  // ─── Helpers de rol ───────────────────────────────────────────────────────
  isPaciente: () => get().user?.rol === 'paciente',
  isMedico: () => get().user?.rol === 'medico',
  isAdmin: () => get().user?.rol === 'admin',
}))
