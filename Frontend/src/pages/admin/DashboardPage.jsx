// src/pages/admin/DashboardPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users, LogOut, Filter, Edit, XCircle, FileText, BarChart3,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import useToastStore from '../../stores/useToastStore';
import useApi from '../../hooks/useApi';
import CustomCard from '../../components/ui/CustomCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/shared/Pagination';
import EmptyState from '../../components/shared/EmptyState';
import ModalWrapper from '../../components/shared/ModalWrapper';
import Badge from '../../components/ui/Badge';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { fetchData, loading: apiLoading } = useApi();
  const { showToast } = useToastStore();

  const isAuthorized = isAuthenticated && user?.rol === 'admin';

  const [stats, setStats] = useState({ todayAppointments: 0, activeDoctors: 0, totalPatients: 0, totalUsers: 0 });
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ doctor: '', specialty: '', status: '', startDate: '', endDate: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const isMounted = useRef(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

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
      if (user.rol === 'medico') handleRedirect('/doctor/agenda');
      else if (user.rol === 'paciente') handleRedirect('/patient/search');
    }
  }, [isAuthenticated, user, navigate]);

  const loadDashboardData = useCallback(async () => {
    if (!isAuthorized) return;
    try {
      const [appointmentsData, doctorsData, usersData] = await Promise.all([
        fetchData({ url: '/appointments', params: { page: pagination.page, limit: pagination.limit, ...filters } }),
        fetchData({ url: '/doctors' }),
        fetchData({ url: '/users' }),
      ]);
      if (!isMounted.current) return;
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointmentsData.data?.filter(apt => apt.fechaHora?.startsWith(today)).length || 0;
      setStats({
        todayAppointments,
        activeDoctors: doctorsData.data?.length || 0,
        totalPatients: usersData.data?.filter(u => u.rol === 'paciente').length || 0,
        totalUsers: usersData.data?.length || 0,
      });
      setAppointments(appointmentsData.data || []);
      setPagination(prev => ({ ...prev, total: appointmentsData.total || 0 }));
    } catch (error) {
      if (isMounted.current) showToast('Error al cargar los datos del dashboard', 'error');
    }
  }, [fetchData, pagination.page, pagination.limit, filters, showToast, isAuthorized]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      showToast('Error al cerrar sesión', 'error');
    }
  }, [logout, navigate, showToast]);

  const handleNavigateToUsers = () => { window.location.href = '/admin/users'; };
  const handleNavigateToReports = () => { window.location.href = '/admin/reports'; };

  useEffect(() => {
    let isActive = true;
    const fetchDataAsync = async () => {
      if (isActive && isAuthorized) await loadDashboardData();
    };
    fetchDataAsync();
    return () => { isActive = false; };
  }, [loadDashboardData, isAuthorized]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isMounted.current && isAuthorized) {
        setPagination(prev => ({ ...prev, page: 1 }));
        loadDashboardData();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters, loadDashboardData, isAuthorized]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleCancelAppointment = useCallback(async (appointmentId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    try {
      await fetchData({ url: `/appointments/${appointmentId}/status`, method: 'PATCH', data: { estado: 'cancelada' } });
      if (isMounted.current) {
        showToast('Cita cancelada exitosamente', 'success');
        await loadDashboardData();
      }
    } catch {
      if (isMounted.current) showToast('Error al cancelar la cita', 'error');
    }
  }, [fetchData, showToast, loadDashboardData]);

  const getStatusBadge = useCallback((status) => {
    const variants = { confirmada: 'success', pendiente: 'warning', cancelada: 'danger', completada: 'info' };
    return <Badge text={status} variant={variants[status] || 'info'} />;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }, []);

  if (!isAuthenticated || !isAuthorized) return null;
  if (apiLoading && !appointments.length) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Bienvenido, {user?.nombre} ·{' '}
                <span className="font-semibold text-teal-700 dark:text-teal-400">({user?.rol})</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleNavigateToReports} className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Reportes</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats — 2 columnas en móvil, 4 en desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleNavigateToReports}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Reportes</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{stats.todayAppointments}</p>
              </div>
              <div className="bg-teal-100 dark:bg-teal-900/40 p-2 sm:p-3 rounded-full">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700 dark:text-teal-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleNavigateToUsers}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{stats.totalPatients}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total: {stats.totalUsers}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-2 sm:p-3 rounded-full">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <CustomCard className="p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Filtros de Citas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <input type="text" placeholder="Médico" value={filters.doctor} onChange={e => handleFilterChange('doctor', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            <input type="text" placeholder="Especialidad" value={filters.specialty} onChange={e => handleFilterChange('specialty', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </select>
            <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
          </div>
        </CustomCard>

        {/* Tabla de citas */}
        <CustomCard className="overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Todas las citas</h2>
            <button onClick={handleNavigateToReports} className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Ver reportes completos</span>
              <span className="sm:hidden">Reportes</span>
            </button>
          </div>
          {appointments.length === 0 ? (
            <EmptyState icon={Calendar} title="No hay citas" description="No se encontraron citas con los filtros aplicados." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paciente</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Médico</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {appointments.map(apt => (
                      <tr key={apt._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{apt._id?.slice(-6) || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{apt.paciente?.nombre || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{apt.medico?.nombre || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-gray-200 whitespace-nowrap">{apt.fechaHora ? formatDate(apt.fechaHora) : 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4">{apt.estado ? getStatusBadge(apt.estado) : 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setSelectedAppointment(apt); setShowAssignModal(true); }} className="p-1 text-gray-600 hover:text-teal-700 hover:bg-teal-50 dark:text-gray-400 dark:hover:text-teal-400 dark:hover:bg-teal-900/30 rounded transition-colors" title="Editar cita">
                              <Edit className="w-4 h-4" />
                            </button>
                            {apt.estado !== 'cancelada' && apt.estado !== 'completada' && (
                              <button onClick={() => handleCancelAppointment(apt._id)} className="p-1 text-gray-600 hover:text-red-700 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors" title="Cancelar cita">
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
              <Pagination total={pagination.total} page={pagination.page} limit={pagination.limit} onPageChange={handlePageChange} />
            </>
          )}
        </CustomCard>
      </main>

      <ModalWrapper isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Editar cita">
        {selectedAppointment && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
              <input type="text" value={selectedAppointment.paciente?.nombre || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select defaultValue={selectedAppointment.estado} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="completada">Completada</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors">Guardar cambios</button>
            </div>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
};

export default DashboardPage;
