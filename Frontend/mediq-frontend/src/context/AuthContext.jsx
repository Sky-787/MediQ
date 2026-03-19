// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axiosInstance from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Al montar: restaurar sesión si existe cookie
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axiosInstance.get('/auth/me')
        setUser(data)
        setIsAuthenticated(true)
      } catch {
        // 401 u otro error → no hay sesión activa, no es un error de la app
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  /**
   * login(email, password)
   * Llama POST /api/auth/login con { email, contrasena: password }
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null)
      const { data } = await axiosInstance.post('/auth/login', {
        email,
        contrasena: password,
      })
      setUser(data)
      setIsAuthenticated(true)
    } catch (err) {
      const mensaje =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al iniciar sesión. Verifica tus credenciales.'
      setError(mensaje)
    }
  }, [])

  /**
   * logout()
   * Llama POST /api/auth/logout y limpia el estado
   */
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch {
      // Ignorar errores de red en logout
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setError(null)
    }
  }, [])

  /** clearError() — limpia el último error sin hacer logout */
  const clearError = useCallback(() => setError(null), [])

  /** Helpers de rol */
  const isPaciente = useCallback(() => user?.rol === 'paciente', [user])
  const isMedico = useCallback(() => user?.rol === 'medico', [user])
  const isAdministrador = useCallback(() => user?.rol === 'admin', [user])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    isPaciente,
    isMedico,
    isAdministrador,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth() — hook para consumir el AuthContext en cualquier componente
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}

export default AuthContext
