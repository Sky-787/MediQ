import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

function getHomeByRole(role) {
  switch (role) {
    case 'admin':    return '/admin/dashboard';
    case 'medico':   return '/doctor';
    case 'paciente': return '/patient/search';
    default:         return '/';
  }
}

const linkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-700 text-white dark:bg-teal-600'
      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handlePanel = () => {
    setMenuOpen(false);
    navigate(getHomeByRole(user?.rol));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold tracking-tight text-teal-700 dark:text-teal-400">
          MediQ
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          <NavLink to="/" className={linkClass}>Inicio</NavLink>
          {!isAuthenticated ? (
            <>
              <NavLink to="/login"    className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={linkClass}>Registro</NavLink>
            </>
          ) : (
            <>
              <button
                onClick={handlePanel}
                className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
              >
                Mi panel
              </button>
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Salir
              </button>
            </>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile: ThemeToggle + hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>Inicio</NavLink>
        {!isAuthenticated ? (
          <>
            <NavLink to="/login"    className={linkClass} onClick={() => setMenuOpen(false)}>Login</NavLink>
            <NavLink to="/register" className={linkClass} onClick={() => setMenuOpen(false)}>Registro</NavLink>
          </>
        ) : (
          <>
            <button
              onClick={handlePanel}
              className="w-full text-left rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
            >
              Mi panel
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Salir
            </button>
          </>
        )}
      </MobileMenu>
    </header>
  );
}
