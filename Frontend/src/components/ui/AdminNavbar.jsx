import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

// Los links de navegación viven en el sidebar de AdminLayout

function formatRole(role) {
  if (!role) return ''
  const map = { medico: 'Médico', paciente: 'Paciente', admin: 'Administrador' }
  return map[role] || role
}

const AdminNavbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo → Landing Page */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl font-bold text-teal-700 dark:text-teal-400">MediQ</span>
            <span className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 max-w-[140px] truncate">
                {user?.nombre || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatRole(user?.rol || user?.role)}
              </span>
            </span>
          </Link>

          {/* Links ocultos: la navegación está en el sidebar de AdminLayout */}

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>

          {/* Mobile: ThemeToggle + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
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
      </div>

      {/* Mobile drawer */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </MobileMenu>
    </nav>
  );
};

export default AdminNavbar;
