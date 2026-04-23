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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Panel del Médico</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Bienvenido, Dr. {user?.nombre} · {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats — 2 cols en móvil, 4 en desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <CustomCard className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Citas hoy</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{stats.todayAppointments}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 p-2 sm:p-3 rounded-full">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 dark:text-blue-400" />
              </div>
            </div>
          </CustomCard>

          <CustomCard className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{stats.pendingAppointments}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 sm:p-3 rounded-full">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 dark:text-yellow-400" />
              </div>
            </div>
          </CustomCard>

          <CustomCard className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pacientes</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{stats.totalPatients}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/40 p-2 sm:p-3 rounded-full">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 dark:text-green-400" />
              </div>
            </div>
          </CustomCard>

          <CustomCard className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Notificaciones</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{stats.notifications}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-2 sm:p-3 rounded-full">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700 dark:text-purple-400" />
              </div>
            </div>
          </CustomCard>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6 text-left hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className={`${action.color} p-2 sm:p-3 rounded-lg text-white`}>
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                {action.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mt-3 sm:mt-4 group-hover:text-teal-700 dark:group-hover:text-teal-400 text-sm sm:text-base">{action.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
              <div className="flex items-center text-teal-700 dark:text-teal-400 text-sm mt-2 sm:mt-3">
                <span>Acceder</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <CustomCard className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Próximas Citas</h2>
            <button
              onClick={() => navigate('/doctor/agenda')}
              className="text-sm text-teal-700 dark:text-teal-400 hover:text-teal-800 flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {nextAppointments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">No hay citas programadas</p>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {nextAppointments.map((apt) => (
                <div key={apt._id} className="py-3 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{apt.paciente?.nombre}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(apt.fechaHora).toLocaleString()}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 text-xs rounded-full ${
                    apt.estado === 'confirmada' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' :
                    apt.estado === 'pendiente'  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
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
