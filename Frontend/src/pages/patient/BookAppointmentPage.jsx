import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// ── ConfirmModal ──────────────────────────────────────────────────
function ConfirmModal({ doctor, fechaHora, motivo, onCancel, onConfirm, loading, error }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Confirmar reserva</h3>
        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Médico:</span> {doctor?.nombre}</p>
        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Fecha/Hora:</span> {fechaHora}</p>
        <p className="text-sm text-gray-600 mb-4"><span className="font-medium">Motivo:</span> {motivo}</p>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-teal-700 text-white rounded px-4 py-2 text-sm hover:bg-teal-800 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Sí, confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BookAppointmentPage ───────────────────────────────────────────
export default function BookAppointmentPage() {
  const { doctorId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(state?.slot || null);
  const [motivo, setMotivo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/doctors/${doctorId}`)
      .then(res => {
        setDoctor(res.data);
        setSlots(res.data.slots || []);
      })
      .catch(() => {});
  }, [doctorId]);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/appointments', {
        doctorId,
        fechaHora: selectedSlot?.fechaHora || selectedSlot,
        motivo,
      });
      setSuccess(true);
      setShowModal(false);
    } catch {
      setError('Error al reservar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <CheckCircle className="text-teal-600 animate-bounce" size={64} />
        <p className="text-xl font-semibold text-gray-700">¡Cita reservada con éxito!</p>
        <button
          onClick={() => navigate('/patient/appointments')}
          className="bg-teal-700 text-white px-6 py-2 rounded hover:bg-teal-800"
        >
          Ver mis citas
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reservar Cita</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda — TimeSlotPicker */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Selecciona un horario</h3>
          {slots.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin horarios disponibles.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot, i) => {
                const label = slot.fechaHora || slot;
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'border-gray-300 hover:border-teal-500'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna derecha — BookingSummary */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
          <h3 className="font-semibold text-gray-700">Resumen de la cita</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Médico:</span> {doctor?.nombre || '...'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Especialidad:</span> {doctor?.especialidad || '...'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Horario:</span>{' '}
            {selectedSlot ? (selectedSlot.fechaHora || selectedSlot) : 'No seleccionado'}
          </p>
          <textarea
            placeholder="Motivo de la consulta (mínimo 10 caracteres)"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            rows={3}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 resize-none"
          />
          <button
            onClick={() => setShowModal(true)}
            disabled={!selectedSlot || motivo.length < 10}
            className="bg-teal-700 text-white px-4 py-2 rounded text-sm hover:bg-teal-800 disabled:opacity-50"
          >
            Confirmar reserva
          </button>
        </div>
      </div>

      {showModal && (
        <ConfirmModal
          doctor={doctor}
          fechaHora={selectedSlot?.fechaHora || selectedSlot}
          motivo={motivo}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirm}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}