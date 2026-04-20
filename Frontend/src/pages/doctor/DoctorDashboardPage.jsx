// src/pages/doctor/DoctorDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Bell, Users, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import useApi from '../../hooks/useApi';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CustomCard from '../../components/ui/CustomCard';

const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { fetchData, loading } = useApi();
  
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    notifications: 0,
  });

  const [nextAppointments, setNextAppointments] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const appointments = await fetchData({ url: '/appointments' });
        const today = new Date().toISOString().split('T')[0];
        
        const todayApps = appointments.data?.filter(apt => 
          apt.fechaHora?.startsWith(today)
        ) || [];
        
        const pendingApps = appointments.data?.filter(apt => 
          apt.estado === 'pendiente'
        ) || [];

        const nextApps = [...(appointments.data || [])]
          .filter(apt => new Date(apt.fechaHora) > new Date())
          .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
          .slice(0, 5);

        setStats({
          todayAppointments: todayApps.length,
          pendingAppointments: pendingApps.length,
          totalPatients: new Set(appointments.data?.map(apt => apt.paciente?._id)).size,
          notifications: 3,
        });

        setNextAppointments(nextApps);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, [fetchData]);

  const quickActions = [
    { 
      title: 'Ver Agenda', 
      description: 'Gestiona tus citas del día',
      icon: Calendar,
      path: '/doctor/agenda',
      color: 'bg-blue-500',
    },
    { 
      title: 'Configurar Disponibilidad', 
      description: 'Define tus horarios de atención',
      icon: Clock,
      path: '/doctor/availability',
      color: 'bg-green-500',
    },
    { 
      title: 'Notificaciones', 
      description: 'Revisa tus notificaciones',
      icon: Bell,
      path: '/doctor/notifications',
      color: 'bg-purple-500',
      badge: stats.notifications,
    },
  ];

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel del Médico</h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, Dr. {user?.nombre} · {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CustomCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Citas hoy</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CustomCard>

          <CustomCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingAppointments}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </CustomCard>

          <CustomCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CustomCard>

          <CustomCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notificaciones</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.notifications}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Bell className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CustomCard>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className={`${action.color} p-3 rounded-lg text-white`}>
                  <action.icon className="w-6 h-6" />
                </div>
                {action.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mt-4 group-hover:text-teal-700">{action.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              <div className="flex items-center text-teal-700 text-sm mt-3">
                <span>Acceder</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <CustomCard className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Próximas Citas</h2>
            <button
              onClick={() => navigate('/doctor/agenda')}
              className="text-sm text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {nextAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay citas programadas</p>
          ) : (
            <div className="divide-y">
              {nextAppointments.map((apt) => (
                <div key={apt._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{apt.paciente?.nombre}</p>
                    <p className="text-sm text-gray-600">{new Date(apt.fechaHora).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    apt.estado === 'confirmada' ? 'bg-green-100 text-green-800' :
                    apt.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {apt.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CustomCard>
      </main>
    </div>
  );
};

export default DoctorDashboardPage;
