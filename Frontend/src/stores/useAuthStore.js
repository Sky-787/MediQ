// src/stores/useAuthStore.js
import { create } from 'zustand'
import axiosInstance from '../api/axiosInstance'

const useAuthStore = create((set, get) => ({
  // ─── Estado ───────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  isLoading: true,   // true al inicio → evita flicker al recargar (F5)
  error: null,

  // ─── Acciones ─────────────────────────────────────────────

  /**
   * checkSession()
   * Llama GET /auth/me para saber si hay sesión activa con la cookie.
   * Se llama automáticamente al montar ProtectedRoute.
   */
  checkSession: async () => {
    try {
      const { data } = await axiosInstance.get('/auth/me')
      if (data && data.data) {
        set({ user: data.data, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      // 401 u otro error → no hay sesión activa
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  /**
   * login(email, password)
   * Llama POST /auth/login con las credenciales.
   */
  login: async (email, password) => {
    try {
      set({ error: null })
      const { data } = await axiosInstance.post('/auth/login', {
        email,
        contrasena: password,
      })

      if (data && data.data) {
        set({ user: data.data, isAuthenticated: true, error: null })
      } else {
        set({ user: data, isAuthenticated: true, error: null })
      }
    } catch (err) {
      const mensaje =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al iniciar sesión. Verifica tus credenciales.'
      set({ error: mensaje })
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

  /** clearError() — limpia el último error sin cerrar sesión */
  clearError: () => set({ error: null }),

  // ─── Helpers de rol ───────────────────────────────────────
  isPaciente: () => get().user?.rol === 'paciente',
  isMedico:   () => get().user?.rol === 'medico',
  isAdmin:    () => get().user?.rol === 'admin',
}))

export default useAuthStore
