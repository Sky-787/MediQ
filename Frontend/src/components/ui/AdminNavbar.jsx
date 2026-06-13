import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

// Los links de navegación viven en el sidebar de AdminLayout

const AdminNavbar = () => {
  const { logout } = useAuthStore();
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
            className="text-xl font-bold text-teal-700 dark:text-teal-400 shrink-0 hover:opacity-80 transition-opacity"
          >
            MediQ · Admin
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
