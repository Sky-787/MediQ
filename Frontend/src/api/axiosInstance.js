// src/api/axiosInstance.js
import axios from 'axios'
import { env } from '../config/env'

const axiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true, // necesario para enviar cookies HttpOnly
})

let isHandlingUnauthorized = false
const ignoredUnauthorizedPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/me',
  '/auth/logout',
]

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url || ''

    const shouldIgnoreUnauthorized = ignoredUnauthorizedPaths.some((path) =>
      requestUrl.includes(path),
    )

    if (status !== 401 || shouldIgnoreUnauthorized) {
      return Promise.reject(error)
    }

    if (isHandlingUnauthorized) {
      return Promise.reject(error)
    }

    isHandlingUnauthorized = true

    try {
      await axiosInstance.post('/auth/logout')
    } catch {
      // Ignorar errores al intentar cerrar sesión en backend
    }

    try {
      const [
        { useAuthStore },
        { default: useAppointmentStore },
        { default: useDoctorStore },
      ] = await Promise.all([
        import('../stores/useAuthStore'),
        import('../stores/useAppointmentStore'),
        import('../stores/useDoctorStore'),
      ])

      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })

      useAppointmentStore.setState({
        appointments: [],
        isLoading: false,
        error: null,
      })

      useDoctorStore.setState({
        doctors: [],
        isLoading: false,
        error: null,
      })
    } catch {
      // Si falla la carga dinámica de stores, igual seguimos con la limpieza base
    }

    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/login'

    return Promise.reject(error)
  },
)

export default axiosInstance
