import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer 
} from 'recharts';
import { Download, Calendar, FileText, FileSpreadsheet } from 'lucide-react';
import useApi from '../../hooks/useApi';
import CustomCard from '../../components/ui/CustomCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ToastNotification from '../../components/shared/ToastNotification';

const COLORS = ['#0F766E', '#1E3A5F', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899'];

const ReportsPage = () => {
  const { fetchData, loading } = useApi();
  const [occupancyData, setOccupancyData] = useState([]);
  const [specialtyData, setSpecialtyData] = useState([]);
  const [periodData, setPeriodData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Usamos useRef para evitar renders innecesarios
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const showToast = useCallback((message, type) => {
    if (isMounted.current) {
      setToast({ show: true, message, type });
    }
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const [occupancy, specialty] = await Promise.all([
        fetchData({ url: '/reports/ocupacion' }),
        fetchData({ url: '/reports/especialidades' })
      ]);

      if (!isMounted.current) return;

      // Transformar datos de ocupación para la gráfica
      const transformedOccupancy = occupancy.data?.map(item => ({
        name: item._id?.nombre || 'Médico',
        citas: item.totalCitas || 0
      })) || [];

      // Transformar datos de especialidades
      const transformedSpecialty = specialty.data?.map(item => ({
        name: item._id || 'Otra',
        value: item.total || 0
      })) || [];

      setOccupancyData(transformedOccupancy);
      setSpecialtyData(transformedSpecialty);
      setInitialLoadComplete(true);
    } catch (error) {
      if (isMounted.current) {
        showToast('Error al cargar los reportes', error.message);
        setInitialLoadComplete(true);
      }
    }
  }, [fetchData, showToast]);

  const loadPeriodData = useCallback(async () => {
    // Solo cargar datos del período si ya se completó la carga inicial
    if (!initialLoadComplete) return;
    
    try {
      const response = await fetchData({
        url: '/reports/periodo',
        params: dateRange
      });

      if (!isMounted.current) return;

      // Transformar datos para la gráfica de período
      const transformed = response.data?.map(item => ({
        fecha: new Date(item.fecha).toLocaleDateString('es-CO'),
        citas: item.total || 0
      })) || [];

      setPeriodData(transformed);
    } catch (error) {
      if (isMounted.current) {
        showToast('Error al cargar datos del período', error.message);
      }
    }
  }, [fetchData, dateRange, showToast, initialLoadComplete]);

  const handleExportCSV = useCallback(() => {
    try {
      const headers = ['Médico', 'Total Citas', 'Especialidad', 'Fecha'];
      const rows = [];

      // Combinar datos para exportación
      specialtyData.forEach(spec => {
        rows.push([spec.name, spec.value, spec.name, '']);
      });

      occupancyData.forEach(occ => {
        rows.push([occ.name, occ.citas, '', '']);
      });

      periodData.forEach(period => {
        rows.push(['', '', '', period.fecha, period.citas]);
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-mediq-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      showToast('Reporte exportado exitosamente', 'success');
    } catch (error) {
      showToast('Error al exportar el reporte', error.message);
    }
  }, [specialtyData, occupancyData, periodData, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Efecto para carga inicial - con manejo de montaje
  useEffect(() => {
    let isActive = true;

    const initializeData = async () => {
      if (isActive) {
        await loadReports();
      }
    };

    initializeData();

    return () => {
      isActive = false;
    };
  }, [loadReports]);

  // Efecto para datos del período - con manejo de montaje
  useEffect(() => {
    let isActive = true;

    const fetchPeriodData = async () => {
      if (isActive && dateRange.startDate && dateRange.endDate) {
        await loadPeriodData();
      }
    };

    // Pequeño delay para evitar múltiples llamadas durante cambios rápidos en el rango de fechas
    const timeoutId = setTimeout(fetchPeriodData, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [dateRange, loadPeriodData]);

  // Mostrar loading solo en la carga inicial
  if (loading && !occupancyData.length && !specialtyData.length) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">
            Visualiza el rendimiento y la ocupación del sistema
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-end gap-3 mb-6 print:hidden">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Imprimir / PDF
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Occupancy Chart */}
          <CustomCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ocupación por Médico
            </h2>
            <div className="h-80">
              {occupancyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="citas" fill="#0F766E" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hay datos de ocupación
                </div>
              )}
            </div>
          </CustomCard>

          {/* Specialty Chart */}
          <CustomCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Citas por Especialidad
            </h2>
            <div className="h-80">
              {specialtyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={specialtyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {specialtyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hay datos de especialidades
                </div>
              )}
            </div>
          </CustomCard>
        </div>

        {/* Period Report */}
        <CustomCard className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Reporte por Período
            </h2>
            
            {/* Date Filters */}
            <div className="flex gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <span className="text-gray-500">a</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {periodData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="citas" fill="#1E3A5F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay datos para el período seleccionado
            </div>
          )}
        </CustomCard>
      </div>

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

export default ReportsPage;