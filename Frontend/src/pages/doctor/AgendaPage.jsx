import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import useAppointmentStore from '../../stores/useAppointmentStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ToastNotification from '../../components/shared/ToastNotification';
import EmptyState from '../../components/shared/EmptyState';

const AgendaPage = () => {
  const { appointments, isLoading, error, fetchAppointments, updateAppointment, cancelAppointment } = useAppointmentStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Horas del día para mostrar (8 AM a 6 PM)
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  // Generar los 7 días de la semana
  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Empezar domingo
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Cargar citas del médico
  const loadAppointments = useCallback(async () => {
    try {
      await fetchAppointments();
    } catch (error) {
      setToast({ show: true, message: 'Error al cargar citas', type: 'error' });
    }
  }, [fetchAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Manejar cambio de semana
  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  // Encontrar cita en un slot específico
  const getAppointmentAt = (day, hour) => {
    const dateStr = day.toISOString().split('T')[0];
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    
    return appointments.find(apt => {
      const aptDate = new Date(apt.fechaHora);
      const aptDateStr = aptDate.toISOString().split('T')[0];
      const aptHourStr = `${aptDate.getHours().toString().padStart(2, '0')}:00`;
      
      return aptDateStr === dateStr && aptHourStr === hourStr;
    });
  };

  // Obtener color según estado
  const getStatusColor = (estado) => {
    const colors = {
      confirmada: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
      pendiente: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
      cancelada: 'bg-gray-100 border-gray-300 line-through opacity-50',
      completada: 'bg-green-100 border-green-300',
    };
    return colors[estado] || 'bg-gray-100 border-gray-300';
  };

  // Confirmar cita
  const handleConfirm = async (appointmentId) => {
    try {
      await updateAppointment(appointmentId, { estado: 'confirmada' });
      setToast({ show: true, message: 'Cita confirmada', type: 'success' });
      setShowActions(false);
    } catch (error) {
      setToast({ show: true, message: 'Error al confirmar', type: 'error' });
    }
  };

  // Rechazar/Cancelar cita
  const handleReject = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      setToast({ show: true, message: 'Cita cancelada', type: 'success' });
      setShowActions(false);
    } catch (error) {
      setToast({ show: true, message: 'Error al cancelar', type: 'error' });
    }
  };

  if (isLoading && !appointments.length) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación de semanas */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => changeWeek(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-lg font-semibold">
          Semana del {weekDays[0].toLocaleDateString()} al {weekDays[6].toLocaleDateString()}
        </h2>
        
        <button
          onClick={() => changeWeek(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendario semanal */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day, index) => (
            <div key={index} className="p-4 text-center border-r last:border-r-0">
              <p className="font-semibold">
                {day.toLocaleDateString('es', { weekday: 'short' })}
              </p>
              <p className="text-sm text-gray-600">
                {day.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* Horas del día */}
        <div className="grid grid-cols-7">
          {hours.map(hour => (
            <React.Fragment key={hour}>
              {weekDays.map((day, dayIndex) => {
                const appointment = getAppointmentAt(day, hour);
                
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className={`border border-gray-200 p-2 min-h-[100px] cursor-pointer transition-colors ${
                      appointment ? getStatusColor(appointment.estado) : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (appointment) {
                        setSelectedSlot(appointment);
                        setShowActions(true);
                      }
                    }}
                  >
                    <p className="text-xs text-gray-500 mb-1">{hour}:00</p>
                    {appointment && (
                      <div className="text-sm">
                        <p className="font-medium">{appointment.paciente?.nombre}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {appointment.estado}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Panel de acciones lateral */}
      {showActions && selectedSlot && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Detalles de la cita</h3>
            <button
              onClick={() => setShowActions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Paciente</label>
              <p className="text-lg">{selectedSlot.paciente?.nombre}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Fecha y hora</label>
              <p>{new Date(selectedSlot.fechaHora).toLocaleString()}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Estado actual</label>
              <p className={`inline-block px-2 py-1 rounded text-sm ${
                selectedSlot.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                selectedSlot.estado === 'pendiente' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedSlot.estado}
              </p>
            </div>

            {selectedSlot.estado === 'pendiente' && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleConfirm(selectedSlot._id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => handleReject(selectedSlot._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Rechazar
                </button>
              </div>
            )}

            {selectedSlot.estado === 'confirmada' && (
              <button
                onClick={() => handleReject(selectedSlot._id)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancelar cita
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {(toast.show || error) && (
        <ToastNotification
          message={toast.message || error}
          type={error && !toast.show ? 'error' : toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default AgendaPage;