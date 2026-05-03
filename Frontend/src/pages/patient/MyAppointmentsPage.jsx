import { useState, useEffect } from 'react';
import useAppointmentStore from '../../stores/useAppointmentStore';
import useToastStore from '../../stores/useToastStore';
import Modal from '../../components/ui/Modal';
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

// ── CancelModal (función interna) ─────────────────────────────────
function CancelModal({ isOpen, motivo, onMotivoChange, onConfirm, onClose, isLoading, error }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancelar cita">
      <textarea
        value={motivo}
        onChange={e => onMotivoChange(e.target.value)}
        placeholder="Motivo de cancelación (opcional)"
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-teal-500 resize-none"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50">
          Volver
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white rounded px-4 py-2 text-sm hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Cancelando...' : 'Confirmar cancelación'}
        </button>
      </div>
    </Modal>
  );
}

// ── EditModal (función interna) ───────────────────────────────────
function EditModal({ isOpen, motivo, onMotivoChange, onConfirm, onClose, isLoading, error }) {
  const canConfirm = motivo.trim().length >= 3;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar motivo de cita">
      <textarea
        value={motivo}
        onChange={e => onMotivoChange(e.target.value)}
        placeholder="Motivo de la consulta"
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:border-teal-500 resize-none"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <div className="flex gap-3 mt-4">
        <button onClick={onClose} className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading || !canConfirm}
          className="flex-1 bg-teal-600 text-white rounded px-4 py-2 text-sm hover:bg-teal-700 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </Modal>
  );
}

// ── AppointmentCard ───────────────────────────────────────────────
function AppointmentCard({ appointment, onCancel, onEdit }) {
  const especialidad   = appointment.doctorId?.especialidad   || 'Especialidad no disponible';
  const registroMedico = appointment.doctorId?.registroMedico || null;
  const fecha  = new Date(appointment.fechaHora);
  const estado = appointment.estado || 'pendiente';
  const horas  = horasRestantes(appointment.fechaHora);
  const isFuture = horas > 0;
  const isCancellable = isFuture && ['pendiente', 'confirmada'].includes(estado) && horas > 24;
  const isEditable = isFuture && estado === 'pendiente';

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

      {/* Acciones */}
      <div className="flex flex-col gap-2 mt-1">
        {!isFuture || estado === 'cancelada' || estado === 'completada' ? null : (
          <>
            {horas < 24 ? (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                🚫 No es posible cancelar con menos de 24 horas de anticipación. Contacta directamente al consultorio.
              </div>
            ) : (
              <div className="flex gap-2">
                {isCancellable && (
                  <button
                    onClick={() => onCancel(appointment._id)}
                    className="flex-1 border border-red-400 text-red-600 rounded px-3 py-1 text-sm hover:bg-red-50"
                  >
                    Cancelar
                  </button>
                )}
                {isEditable && (
                  <button
                    onClick={() => onEdit(appointment._id, appointment.motivo ?? '')}
                    className="flex-1 border border-teal-500 text-teal-700 rounded px-3 py-1 text-sm hover:bg-teal-50"
                  >
                    Editar
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── MyAppointmentsPage ────────────────────────────────────────────
export default function MyAppointmentsPage() {
  const { appointments, isLoading, error, fetchAppointments, cancelAppointment, updateAppointment } = useAppointmentStore();
  const { showToast } = useToastStore();

  const [activeTab, setActiveTab] = useState('Próximas');
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    appointmentId: null,
    motivo: '',
    error: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    appointmentId: null,
    motivo: '',
    error: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        await fetchAppointments();
      } catch (err) {
        if (!err.response) {
          showToast('Error de conexión. Verificá tu red e intentá de nuevo.', 'error');
        }
      }
    };
    load();
  }, [fetchAppointments, showToast]);

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

  // ── Handlers cancelación ─────────────────────────────────────────
  const handleOpenCancel = (id) => {
    setCancelModal({ isOpen: true, appointmentId: id, motivo: '', error: null });
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelAppointment(cancelModal.appointmentId, cancelModal.motivo);
      setCancelModal({ isOpen: false, appointmentId: null, motivo: '', error: null });
      showToast('Cita cancelada exitosamente', 'success');
    } catch (err) {
      if (!err.response) {
        // NetworkError: cerrar modal + toast de red
        setCancelModal({ isOpen: false, appointmentId: null, motivo: '', error: null });
        showToast('Error de conexión. Verificá tu red e intentá de nuevo.', 'error');
      } else {
        // ServerError: error inline dentro del modal, modal permanece abierto
        setCancelModal(prev => ({
          ...prev,
          error: err.response.data?.message || 'Error al cancelar la cita',
        }));
      }
    }
  };

  // ── Handlers edición ─────────────────────────────────────────────
  const handleOpenEdit = (id, motivoActual) => {
    setEditModal({ isOpen: true, appointmentId: id, motivo: motivoActual, error: null });
  };

  const handleConfirmEdit = async () => {
    try {
      await updateAppointment(editModal.appointmentId, { motivo: editModal.motivo });
      setEditModal({ isOpen: false, appointmentId: null, motivo: '', error: null });
      showToast('Cita actualizada exitosamente', 'success');
    } catch (err) {
      if (!err.response) {
        setEditModal(prev => ({ ...prev, isOpen: false }));
        showToast('Error de conexión. Verificá tu red e intentá de nuevo.', 'error');
      } else {
        setEditModal(prev => ({
          ...prev,
          error: err.response.data?.message || 'Error al actualizar la cita',
        }));
      }
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
            <AppointmentCard
              key={a._id}
              appointment={a}
              onCancel={handleOpenCancel}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 py-4 text-sm">{error}</div>
      )}

      <CancelModal
        isOpen={cancelModal.isOpen}
        motivo={cancelModal.motivo}
        onMotivoChange={(v) => setCancelModal(prev => ({ ...prev, motivo: v }))}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelModal({ isOpen: false, appointmentId: null, motivo: '', error: null })}
        isLoading={isLoading}
        error={cancelModal.error}
      />

      <EditModal
        isOpen={editModal.isOpen}
        motivo={editModal.motivo}
        onMotivoChange={(v) => setEditModal(prev => ({ ...prev, motivo: v }))}
        onConfirm={handleConfirmEdit}
        onClose={() => setEditModal({ isOpen: false, appointmentId: null, motivo: '', error: null })}
        isLoading={isLoading}
        error={editModal.error}
      />
    </div>
  );
}

