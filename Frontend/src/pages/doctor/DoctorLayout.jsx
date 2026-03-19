// src/pages/doctor/DoctorLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DoctorNavbar from '../../components/ui/DoctorNavbar';
import { useAuth } from '../../context/AuthContext';

const DoctorLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Panel del Médico</h1>
          <p className="text-sm text-gray-600 mt-1">
            Bienvenido, Dr. {user?.nombre} · {user?.email}
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default DoctorLayout;