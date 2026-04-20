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
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-6">
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                      : 'text-gray-700 hover:bg-gray-100'
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