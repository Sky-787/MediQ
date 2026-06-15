import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const linkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-700 text-white dark:bg-teal-600'
      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
  }`

export default function PublicNavbar() {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-teal-700 dark:text-teal-400">
          MediQ
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" className={linkClass}>Inicio</NavLink>
          <NavLink to="/login" className={linkClass}>Login</NavLink>
          <NavLink to="/register" className={linkClass}>Registro</NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
