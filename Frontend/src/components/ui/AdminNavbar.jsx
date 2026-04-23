import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Users, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/reports',   label: 'Reportes',  icon: BarChart3 },
  { path: '/admin/users',     label: 'Usuarios',  icon: Users },
];

const itemClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
    isActive
      ? 'bg-teal-700 text-white dark:bg-teal-600'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
  }`;

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
          {/* Logo */}
          <h2 className="text-xl font-bold text-teal-700 dark:text-teal-400 shrink-0">
            MediQ · Admin
          </h2>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={itemClass}>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

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
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={itemClass}
            onClick={() => setMenuOpen(false)}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
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
