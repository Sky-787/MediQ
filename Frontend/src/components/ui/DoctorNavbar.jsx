// src/components/ui/DoctorNavbar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Clock, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

const DoctorNavbar = () => {
  const { logout } = useAuthStore();
  const [unreadCount] = useState(3); // Simulado, luego conectar a API

  const navItems = [
    { path: '/doctor/agenda', label: 'Agenda', icon: Calendar },
    { path: '/doctor/availability', label: 'Disponibilidad', icon: Clock },
    { path: '/doctor/notifications', label: 'Notificaciones', icon: Bell },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-bold text-teal-700">MediQ · Médicos</h2>
            <div className="flex gap-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-teal-700 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.label === 'Notificaciones' && unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DoctorNavbar;
