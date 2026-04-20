import { useState, useEffect } from 'react';
import useAppointmentStore from '../../stores/useAppointmentStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ToastNotification from '../../components/shared/ToastNotification';
import Badge from '../../components/ui/Badge';

const TABS = ['Próximas', 'Pasadas', 'Canceladas'];

// ── CancelModal ───────────────────────────────────────────────────
function CancelModal({ appointment, onClose, onConfirm, loading }) {
  const [motivo, setMotivo] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Cancelar cita</h3>
        <p className="text-sm text-gray-600 mb-3">
          ¿Seguro que deseas cancelar la cita con <span className="font-medium">{appointment.medico?.nombre}</span>?
        </p>
        <textarea
          placeholder="Motivo (opcional)"
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:border-teal-500 resize-none"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50">
            Volver
          </button>
          <button
            onClick={() => onConfirm(motivo)}
            disabled={loading}
            className="flex-1 bg-red-600 text-white rounded px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RescheduleForm ────────────────────────────────────────────────
function RescheduleForm({ appointment, onClose, onDone, updateAppointment }) {
  const [fechaHora, setFechaHora] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!fechaHora) return;
    setLoading(true);
    setError('');
    try {
      await updateAppointment(appointment._id, { fechaHora });
      onDone();
    } catch {
      setError('Error al reprogramar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Reprogramar cita</h3>
        <p className="text-sm text-gray-600 mb-3">
          Cita con <span className="font-medium">{appointment.medico?.nombre}</span>
        </p>
        <input
          type="datetime-local"
          value={fechaHora}
          onChange={e => setFechaHora(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-500"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !fechaHora}
            className="flex-1 bg-teal-700 text-white rounded px-4 py-2 text-sm hover:bg-teal-800 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AppointmentCard ───────────────────────────────────────────────
function AppointmentCard({ appointment, onCancel, onReschedule }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">{appointment.medico?.nombre}</p>
          <p className="text-sm text-gray-500">{appointment.medico?.especialidad}</p>
        </div>
        <Badge estado={appointment.estado} />
      </div>
      <p className="text-sm text-gray-600">
        <span className="font-medium">Fecha:</span> {new Date(appointment.fechaHora).toLocaleString()}
      </p>
      {appointment.estado !== 'cancelada' && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onCancel(appointment)}
            className="flex-1 border border-red-400 text-red-600 rounded px-3 py-1 text-sm hover:bg-red-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onReschedule(appointment)}
            className="flex-1 border border-teal-500 text-teal-700 rounded px-3 py-1 text-sm hover:bg-teal-50"
          >
            Reprogramar
          </button>
        </div>
      )}
    </div>
  );
}

// ── MyAppointmentsPage ────────────────────────────────────────────
export default function MyAppointmentsPage() {
  const { appointments, isLoading, error, fetchAppointments, cancelAppointment, updateAppointment } = useAppointmentStore();
  const [activeTab, setActiveTab] = useState('Próximas');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const filtered = appointments.filter(a => {
    const isFuture = new Date(a.fechaHora) >= new Date();
    if (activeTab === 'Próximas') return (a.estado === 'confirmada' || a.estado === 'pendiente') && isFuture;
    if (activeTab === 'Pasadas') return new Date(a.fechaHora) < new Date();
    if (activeTab === 'Canceladas') return a.estado === 'cancelada';
    return true;
  });

  const handleCancel = async (motivo) => {
    setCancelLoading(true);
    try {
      await cancelAppointment(cancelTarget._id, motivo);
      setCancelTarget(null);
      setToast({ show: true, message: 'Cita cancelada con éxito', type: 'success' });
    } catch {
      setToast({ show: true, message: 'Error al cancelar la cita', type: 'error' });
    } finally {
      setCancelLoading(false);
    }
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
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && appointments.length === 0 ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No hay citas en esta sección.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(a => (
            <AppointmentCard
              key={a._id}
              appointment={a}
              onCancel={setCancelTarget}
              onReschedule={setRescheduleTarget}
            />
          ))}
        </div>
      )}

      {cancelTarget && (
        <CancelModal
          appointment={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
          loading={cancelLoading}
        />
      )}

      {rescheduleTarget && (
        <RescheduleForm
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onDone={() => { 
            setRescheduleTarget(null); 
            setToast({ show: true, message: 'Cita reprogramada', type: 'success' }); 
          }}
          updateAppointment={updateAppointment}
        />
      )}

      {(toast.show || error) && (
        <ToastNotification
          message={toast.message || error}
          type={error ? 'error' : toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}