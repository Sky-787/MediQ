import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, CalendarDays, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

const navItems = [
  { path: '/patient/search',       label: 'Buscar Médico', icon: Search },
  { path: '/patient/appointments', label: 'Mis Citas',     icon: CalendarDays },
];

const itemClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-800 text-white dark:bg-teal-600'
      : 'text-white/90 hover:bg-teal-800 dark:text-gray-300 dark:hover:bg-gray-800'
  }`;

const mobileItemClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-700 text-white dark:bg-teal-600'
      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
  }`;

export default function PatientNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-teal-700 dark:bg-gray-900 border-b border-teal-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <span className="text-white dark:text-teal-400 font-bold text-lg shrink-0">
            MediQ
          </span>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={itemClass}>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-white/80 dark:text-gray-400 truncate max-w-[140px]">
              {user?.nombre}
            </span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 dark:bg-gray-700 dark:hover:bg-gray-600 text-white dark:text-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>

          {/* Mobile: ThemeToggle + hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="p-2 rounded-lg text-white hover:bg-teal-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        {/* Saludo */}
        <p className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
          {user?.nombre}
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={mobileItemClass}
            onClick={() => setMenuOpen(false)}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </MobileMenu>
    </nav>
  );
}
