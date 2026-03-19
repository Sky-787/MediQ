// src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Stethoscope,
  LogOut,
  Filter,
  Edit,
  XCircle,
  UserCog,
  FileText,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import CustomCard from '../../components/ui/CustomCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/shared/Pagination';
import EmptyState from '../../components/shared/EmptyState';
import ModalWrapper from '../../components/shared/ModalWrapper';
import ToastNotification from '../../components/shared/ToastNotification';
import Badge from '../../components/ui/Badge';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { fetchData, loading: apiLoading } = useApi();

  // Verificar autorización directamente
  const isAuthorized = isAuthenticated && user?.rol === 'admin';

  // Estados para los datos
  const [stats, setStats] = useState({
    todayAppointments: 0,
    activeDoctors: 0,
    totalPatients: 0,
    totalUsers: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    doctor: '',
    specialty: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info',
  });

  // Referencia para evitar actualizaciones en componente desmontado
  const isMounted = useRef(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Efecto para redirección basado en autenticación y rol
  useEffect(() => {
    if (hasRedirected.current || isAuthenticated === undefined) return;

    const handleRedirect = (path) => {
      if (!hasRedirected.current && isMounted.current) {
        hasRedirected.current = true;
        setTimeout(() => navigate(path), 0);
      }
    };

    if (!isAuthenticated) {
      handleRedirect('/login');
    } else if (user) {
      switch (user.rol) {
        case 'admin':
          break;
        case 'medico':
          handleRedirect('/doctor/agenda');
          break;
        case 'paciente':
          handleRedirect('/patient/search');
          break;
        default:
          handleRedirect('/login');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Función para mostrar notificaciones
  const showToastMessage = useCallback((message, type) => {
    if (isMounted.current) {
      setToast({ show: true, message, type });
    }
  }, []);

  // Función para cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    if (!isAuthorized) return;

    try {
      const [appointmentsData, doctorsData, usersData] = await Promise.all([
        fetchData({
          url: '/appointments',
          params: {
            page: pagination.page,
            limit: pagination.limit,
            ...filters,
          },
        }),
        fetchData({ url: '/doctors' }),
        fetchData({ url: '/users' }),
      ]);

      if (!isMounted.current) return;

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments =
        appointmentsData.data?.filter((apt) => apt.fechaHora?.startsWith(today))
          .length || 0;

      setStats({
        todayAppointments,
        activeDoctors: doctorsData.data?.length || 0,
        totalPatients:
          usersData.data?.filter((u) => u.rol === 'paciente').length || 0,
        totalUsers: usersData.data?.length || 0,
      });

      setAppointments(appointmentsData.data || []);
      setPagination((prev) => ({
        ...prev,
        total: appointmentsData.total || 0,
      }));
    } catch (error) {
      if (isMounted.current) {
        showToastMessage('Error al cargar los datos del dashboard', error.message);
      }
    }
  }, [
    fetchData,
    pagination.page,
    pagination.limit,
    filters,
    showToastMessage,
    isAuthorized,
  ]);

  // Función para cerrar sesión
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      showToastMessage('Error al cerrar sesión', error.message);
    }
  }, [logout, navigate, showToastMessage]);

  // Navegación a gestión de usuarios usando window.location
  const handleNavigateToUsers = () => {
    window.location.href = '/admin/users';
  };

  // Navegación a reportes usando window.location
  const handleNavigateToReports = () => {
    window.location.href = '/admin/reports';
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    let isActive = true;

    const fetchDataAsync = async () => {
      if (isActive && isAuthorized) {
        await loadDashboardData();
      }
    };

    fetchDataAsync();

    return () => {
      isActive = false;
    };
  }, [loadDashboardData, isAuthorized]);

  // Efecto para manejar cambios en filtros con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isMounted.current && isAuthorized) {
        setPagination((prev) => ({ ...prev, page: 1 }));
        loadDashboardData();
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [filters, loadDashboardData, isAuthorized]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleAssignAppointment = useCallback(
    async (appointmentId, newData) => {
      try {
        await fetchData({
          url: `/appointments/${appointmentId}`,
          method: 'PUT',
          data: newData,
        });

        if (isMounted.current) {
          showToastMessage('Cita actualizada exitosamente', 'success');
          setShowAssignModal(false);
          await loadDashboardData();
        }
      } catch (error) {
        if (isMounted.current) {
          showToastMessage('Error al actualizar la cita', error.message);
        }
      }
    },
    [fetchData, showToastMessage, loadDashboardData],
  );

  const handleCancelAppointment = useCallback(
    async (appointmentId) => {
      if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;

      try {
        await fetchData({
          url: `/appointments/${appointmentId}/status`,
          method: 'PATCH',
          data: { estado: 'cancelada' },
        });

        if (isMounted.current) {
          showToastMessage('Cita cancelada exitosamente', 'success');
          await loadDashboardData();
        }
      } catch (error) {
        if (isMounted.current) {
          showToastMessage('Error al cancelar la cita', error.message);
        }
      }
    },
    [fetchData, showToastMessage, loadDashboardData],
  );

  const getStatusBadge = useCallback((status) => {
    const variants = {
      confirmada: 'success',
      pendiente: 'warning',
      cancelada: 'danger',
      completada: 'info',
    };
    return <Badge text={status} variant={variants[status] || 'info'} />;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, []);

  if (isAuthenticated === undefined) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  if (apiLoading && !appointments.length) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bienvenido, {user?.nombre} · {user?.email} ·{' '}
                <span className="font-semibold text-teal-700">
                  ({user?.rol})
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNavigateToReports}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Reportes</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Card de Citas hoy */}
          <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleNavigateToReports}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citas hoy</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.todayAppointments}
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-teal-700" />
              </div>
            </div>
          </div>

          {/* Card de Médicos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Médicos activos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.activeDoctors}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Stethoscope className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>

          {/* Card de Pacientes */}
          <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleNavigateToUsers}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalPatients}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total usuarios: {stats.totalUsers}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>

          {/* Card de Gestión */}
          {/* <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-teal-50 to-white"
            onClick={handleNavigateToUsers}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gestión</p>
                <p className="text-xl font-bold text-gray-900 mt-2">Usuarios</p>
                <p className="text-xs text-teal-600 mt-1">
                  Click para administrar →
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <UserCog className="w-6 h-6 text-teal-700" />
              </div>
            </div>
          </div> */}
        </div>

        {/* Filters Section */}
        <CustomCard className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros de Citas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Médico"
              value={filters.doctor}
              onChange={(e) => handleFilterChange('doctor', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Especialidad"
              value={filters.specialty}
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </CustomCard>

        {/* Appointments Table */}
        <CustomCard className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Todas las citas</h2>
            <button
              onClick={handleNavigateToReports}
              className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
            >
              <FileText className="w-4 h-4" />
              Ver reportes completos
            </button>
          </div>

          {appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No hay citas"
              description="No se encontraron citas con los filtros aplicados."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {appointments.map((apt) => (
                      <tr key={apt._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{apt._id?.slice(-6) || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apt.paciente?.nombre || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apt.medico?.nombre || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{apt.fechaHora ? formatDate(apt.fechaHora) : 'N/A'}</td>
                        <td className="px-6 py-4">{apt.estado ? getStatusBadge(apt.estado) : 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setShowAssignModal(true);
                              }}
                              className="p-1 text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                              title="Editar cita"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {apt.estado !== 'cancelada' && apt.estado !== 'completada' && (
                              <button
                                onClick={() => handleCancelAppointment(apt._id)}
                                className="p-1 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Cancelar cita"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                total={pagination.total}
                page={pagination.page}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CustomCard>
      </main>

      {/* Assign Modal */}
      <ModalWrapper isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Editar cita">
        {selectedAppointment && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
              <input
                type="text"
                value={selectedAppointment.paciente?.nombre || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                defaultValue={selectedAppointment.medico?._id}
              >
                <option value="">Seleccionar médico</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
              <input
                type="datetime-local"
                defaultValue={selectedAppointment.fechaHora?.slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                defaultValue={selectedAppointment.estado}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="completada">Completada</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAssignAppointment(selectedAppointment._id, {})}
                className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        )}
      </ModalWrapper>

      {/* Toast Notification */}
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default DashboardPage;