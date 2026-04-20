// src/components/shared/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * ProtectedRoute
 * Props:
 *   allowedRoles?: string[]  — array de roles permitidos (ej: ['paciente'])
 *
 * Lógica en orden:
 *  1. isLoading  → <LoadingSpinner fullPage />  (espera verificación de sesión)
 *  2. !isAuthenticated → <Navigate to="/login" replace />
 *  3. allowedRoles y rol no incluido → <Navigate to="/" replace />
 *  4. todo OK → <Outlet />
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  // 1. Esperando que AuthContext verifique la sesión con /auth/me
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

/**
 * Fallback de carga interno para no crear una dependencia circular con LoadingSpinner.
 * Persona B reemplazará esto cuando cree el componente real.
 */
function LoadingSpinnerFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
      <div className="h-12 w-12 rounded-full border-4 border-teal-700 border-t-transparent animate-spin" />
    </div>
  )
}