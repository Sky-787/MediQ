// src/components/shared/ProtectedRoute.jsx
import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../stores/useAuthStore'

/**
 * ProtectedRoute
 * Props:
 *   allowedRoles?: string[]  — array de roles permitidos (ej: ['paciente'])
 *
 * Lógica en orden:
 *  1. isLoading  → spinner (espera verificación de sesión) — evita flicker al F5
 *  2. !isAuthenticated → <Navigate to="/login" replace />
 *  3. allowedRoles y rol no incluido → <Navigate to="/" replace />
 *  4. todo OK → <Outlet />
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user, checkSession } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  if (isLoading) {
    return <LoadingSpinnerFallback />
  }

  // 2. No autenticado → ir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 3. Rol no autorizado → ir al inicio
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
    return <Navigate to="/" replace />
  }

  // 4. Todo OK
  return <Outlet />
}

function LoadingSpinnerFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
      <div className="h-12 w-12 rounded-full border-4 border-teal-700 border-t-transparent animate-spin" />
    </div>
  )
}
