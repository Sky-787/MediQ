// src/pages/admin/ReportsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { Calendar, FileText, FileSpreadsheet } from 'lucide-react';
import useApi from '../../hooks/useApi';
import useToastStore from '../../stores/useToastStore';
import CustomCard from '../../components/ui/CustomCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#0F766E', '#1E3A5F', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899'];

const ReportsPage = () => {
  const { fetchData, loading } = useApi();
  const { showToast } = useToastStore();
  const [occupancyData, setOccupancyData] = useState([]);
  const [specialtyData, setSpecialtyData] = useState([]);
  const [periodData, setPeriodData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const [occupancy, specialty] = await Promise.all([
        fetchData({ url: '/reports/ocupacion' }),
        fetchData({ url: '/reports/especialidades' })
      ]);
      if (!isMounted.current) return;
      const transformedOccupancy = occupancy.data?.map(item => ({
        name: item._id?.nombre || 'Médico',
        citas: item.totalCitas || 0
      })) || [];
      const transformedSpecialty = specialty.data?.map(item => ({
        name: item._id || 'Otra',
        value: item.total || 0
      })) || [];
      setOccupancyData(transformedOccupancy);
      setSpecialtyData(transformedSpecialty);
      setInitialLoadComplete(true);
    } catch {
      if (isMounted.current) {
        showToast('Error al cargar los reportes', 'error');
        setInitialLoadComplete(true);
      }
    }
  }, [fetchData, showToast]);

  const loadPeriodData = useCallback(async () => {
    if (!initialLoadComplete) return;
    try {
      const response = await fetchData({ url: '/reports/periodo', params: dateRange });
      if (!isMounted.current) return;
      const transformed = response.data?.map(item => ({
        fecha: new Date(item.fecha).toLocaleDateString('es-CO'),
        citas: item.total || 0
      })) || [];
      setPeriodData(transformed);
    } catch {
      if (isMounted.current) showToast('Error al cargar datos del período', 'error');
    }
  }, [fetchData, dateRange, showToast, initialLoadComplete]);

  const handleExportCSV = useCallback(() => {
    try {
      const headers = ['Médico', 'Total Citas', 'Especialidad', 'Fecha'];
      const rows = [];
      specialtyData.forEach(spec => rows.push([spec.name, spec.value, spec.name, '']));
      occupancyData.forEach(occ => rows.push([occ.name, occ.citas, '', '']));
      periodData.forEach(period => rows.push(['', '', '', period.fecha, period.citas]));
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-mediq-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Reporte exportado exitosamente', 'success');
    } catch {
      showToast('Error al exportar el reporte', 'error');
    }
  }, [specialtyData, occupancyData, periodData, showToast]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  useEffect(() => {
    let isActive = true;
    const initializeData = async () => { if (isActive) await loadReports(); };
    initializeData();
    return () => { isActive = false; };
  }, [loadReports]);

  useEffect(() => {
    let isActive = true;
    const fetchPeriodData = async () => {
      if (isActive && dateRange.startDate && dateRange.endDate) await loadPeriodData();
    };
    const timeoutId = setTimeout(fetchPeriodData, 300);
    return () => { isActive = false; clearTimeout(timeoutId); };
  }, [dateRange, loadPeriodData]);

  if (loading && !occupancyData.length && !specialtyData.length) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Reportes y Estadísticas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Visualiza el rendimiento y la ocupación del sistema</p>
        </div>

        <div className="flex flex-wrap justify-end gap-2 sm:gap-3 mb-4 sm:mb-6 print:hidden">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <CustomCard className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Ocupación por Médico</h2>
            <div className="h-64 sm:h-80">
              {occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="citas" fill="#0F766E" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">No hay datos de ocupación</div>
              )}
            </div>
          </CustomCard>

          <CustomCard className="p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Citas por Especialidad</h2>
            <div className="h-64 sm:h-80">
              {specialtyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={specialtyData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {specialtyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">No hay datos de especialidades</div>
              )}
            </div>
          </CustomCard>
        </div>

        <CustomCard className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Reporte por Período</h2>
            <div className="flex flex-wrap items-center gap-2 print:hidden w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
                <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">a</span>
              <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} className="flex-1 sm:flex-none px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
            </div>
          </div>
          {periodData.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="citas" fill="#1E3A5F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 text-gray-500 dark:text-gray-400 text-sm">No hay datos para el período seleccionado</div>
          )}
        </CustomCard>
      </div>
    </div>
  );
};

export default ReportsPage;
