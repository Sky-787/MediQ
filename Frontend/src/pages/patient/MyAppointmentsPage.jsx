import { useState, useEffect } from 'react';
import useAppointmentStore from '../../stores/useAppointmentStore';
import useToastStore from '../../stores/useToastStore';
import { SkeletonCard } from '../../components/ui/Skeleton';

const TABS = ['Próximas', 'Pasadas', 'Canceladas'];

const ESTADO_STYLES = {
  confirmada: 'bg-green-100 text-green-800',
  pendiente:  'bg-yellow-100 text-yellow-800',
  cancelada:  'bg-red-100 text-red-800',
  completada: 'bg-blue-100 text-blue-800',
};

function horasRestantes(fechaHora) {
  return (new Date(fechaHora) - new Date()) / (1000 * 60 * 60);
}

// ── AppointmentCard ───────────────────────────────────────────────
function AppointmentCard({ appointment }) {
  const especialidad   = appointment.doctorId?.especialidad   || 'Especialidad no disponible';
  const registroMedico = appointment.doctorId?.registroMedico || null;
  const fecha  = new Date(appointment.fechaHora);
  const estado = appointment.estado || 'pendiente';
  const horas  = horasRestantes(appointment.fechaHora);
  const isFuture = horas > 0;

  const renderAcciones = () => {
    if (!isFuture || estado === 'cancelada' || estado === 'completada') return null;

    return (
      <div className="flex flex-col gap-2 mt-1">
        {horas < 24 ? (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            🚫 No es posible cancelar con menos de 24 horas de anticipación. Contacta directamente al consultorio.
          </div>
        ) : (
          <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-2">
            ⚙️ Módulo de cancelación y reprogramación no disponible aún — en desarrollo.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col gap-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-800 text-base">{especialidad}</p>
          {registroMedico && (
            <p className="text-xs text-gray-400 mt-0.5">Reg. médico: {registroMedico}</p>
          )}
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${ESTADO_STYLES[estado] || 'bg-gray-100 text-gray-700'}`}>
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </span>
      </div>

      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Fecha</p>
          <p>{fecha.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Hora</p>
          <p>{fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Motivo */}
      {appointment.motivo && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Motivo</p>
          <p>{appointment.motivo}</p>
        </div>
      )}

      {renderAcciones()}
    </div>
  );
}

// ── MyAppointmentsPage ────────────────────────────────────────────
export default function MyAppointmentsPage() {
  const { appointments, isLoading, fetchAppointments } = useAppointmentStore();
  const [activeTab, setActiveTab] = useState('Próximas');

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const ahora = new Date();

  const filtered = appointments.filter(a => {
    const fecha       = new Date(a.fechaHora);
    const esFutura    = fecha >= ahora;
    const esCancelada = a.estado === 'cancelada';

    if (activeTab === 'Próximas')   return esFutura  && !esCancelada;
    if (activeTab === 'Pasadas')    return !esFutura  && !esCancelada;
    if (activeTab === 'Canceladas') return esCancelada;
    return true;
  });

  const counts = {
    Próximas:   appointments.filter(a => new Date(a.fechaHora) >= ahora && a.estado !== 'cancelada').length,
    Pasadas:    appointments.filter(a => new Date(a.fechaHora) <  ahora && a.estado !== 'cancelada').length,
    Canceladas: appointments.filter(a => a.estado === 'cancelada').length,
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Citas</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === tab
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {counts[tab] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && appointments.length === 0 ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No hay citas en esta sección.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(a => (
            <AppointmentCard key={a._id} appointment={a} />
          ))}
        </div>
      )}
    </div>
  );
}
