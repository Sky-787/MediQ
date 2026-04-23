import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';

const AdminNavbar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/reports', label: 'Reportes', icon: BarChart3 },
    { path: '/admin/users', label: 'Usuarios', icon: Users },
  ];
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-bold text-teal-700 dark:text-teal-400">MediQ · Admin</h2>
            <div className="flex gap-4">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path}
                  className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-teal-700 text-white dark:bg-teal-600' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
                  <item.icon className="w-4 h-4" /><span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /><span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
