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

  // 🔍 DEPURACIÓN
  console.log('🔍 ProtectedRoute - allowedRoles:', allowedRoles);
  console.log('🔍 ProtectedRoute - user:', user);
  console.log('🔍 ProtectedRoute - user?.rol:', user?.rol);
  console.log('🔍 ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('🔍 ProtectedRoute - isLoading:', isLoading);
  
  if (allowedRoles && user?.rol) {
    console.log('🔍 ProtectedRoute - rol permitido?', allowedRoles.includes(user.rol));
  }

  // 1. Esperando que AuthContext verifique la sesión con /auth/me
  if (isLoading) {
    console.log('🔍 ProtectedRoute - MOSTRANDO LOADING');
    return <LoadingSpinnerFallback />
  }

  // 2. No autenticado → ir al login
  if (!isAuthenticated) {
    console.log('🔍 ProtectedRoute - NO AUTENTICADO, redirigiendo a /login');
    return <Navigate to="/login" replace />
  }

  // 3. Rol no autorizado → ir al inicio
  if (allowedRoles && user?.rol && !allowedRoles.includes(user.rol)) {
    console.log('🔍 ProtectedRoute - ROL NO AUTORIZADO, redirigiendo a /');
    return <Navigate to="/" replace />
  }

  // 4. Todo OK
  console.log('🔍 ProtectedRoute - TODO OK, mostrando contenido');
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