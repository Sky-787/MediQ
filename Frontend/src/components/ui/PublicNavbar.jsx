import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import ThemeToggle from './ThemeToggle'

function getRouteByRole(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'medico':
      return '/doctor'
    case 'paciente':
      return '/patient/search'
    default:
      return '/'
  }
}

const linkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-800 text-white dark:bg-teal-600'
      : 'text-white/90 hover:bg-teal-800 dark:text-gray-300 dark:hover:bg-gray-800'
  }`

export default function PublicNavbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  return (
    <header className="border-b border-teal-800 bg-teal-700 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-white dark:text-teal-400">
          MediQ
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" className={linkClass}>Inicio</NavLink>
          {!isLoading && !isAuthenticated && (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={linkClass}>Registro</NavLink>
            </>
          )}
          {!isLoading && isAuthenticated && (
            <button
              onClick={() => navigate(getRouteByRole(user?.rol))}
              className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Mi panel
            </button>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
