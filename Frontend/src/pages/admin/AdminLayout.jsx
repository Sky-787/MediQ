// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import AdminNavbar from '../../components/ui/AdminNavbar';

const AdminLayout = () => {
  const sidebarItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/reports', label: 'Reportes' },
    { path: '/admin/users', label: 'Usuarios' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavbar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-6">
        <aside className="h-fit rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm dark:shadow-lg">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Navegacion
          </p>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;