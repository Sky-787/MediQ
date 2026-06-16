// src/pages/patient/SearchDoctorsPage.jsx
import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import useDoctorStore from '../../stores/useDoctorStore';
import useToastStore from '../../stores/useToastStore';
import { SkeletonCard } from '../../components/ui/Skeleton';

// ─── Componentes extraídos y memoizados fuera del componente padre ──────────

const AvailabilityGrid = memo(function AvailabilityGrid({ doctor, onClose }) {
  const navigate = useNavigate();
  const [disponibilidad, setDisponibilidad] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/doctors/${doctor._id}`)
      .then(res => {
        const raw = res.data?.disponibilidad || res.data?.data?.disponibilidad || [];
        const normalized = (Array.isArray(raw) ? raw : []).map(item => ({
          ...item,
          horario: item.horario || (item.horas && item.horas.length > 0 ? item.horas[0] : '')
        }));
        setDisponibilidad(normalized);
      })
      .catch(() => setDisponibilidad([]));
  }, [doctor._id]);

  const handleSlot = useCallback((dia, horario) => {
    onClose();
    navigate(`/patient/book/${doctor._id}`, { state: { dia, horario } });
  }, [onClose, navigate, doctor._id]);

  const doctorName = doctor.userId?.nombre || doctor.nombre || 'Médico';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Disponibilidad — {doctorName}
        </h3>

        {disponibilidad.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sin disponibilidad registrada.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {disponibilidad.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSlot(item.dia, item.horario)}
                className="bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-4 py-2 rounded-lg text-sm hover:bg-teal-200 dark:hover:bg-teal-800 text-left transition-colors"
              >
                <span className="font-semibold">{item.dia}</span>
                {item.horario && <span className="ml-2 text-teal-600 dark:text-teal-400">{item.horario}</span>}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
});

const DoctorCard = memo(function DoctorCard({ doctor, onVerDisponibilidad }) {
  const disponibilidad = Array.isArray(doctor.disponibilidad)
    ? doctor.disponibilidad.map(item => ({
        ...item,
        horario: item.horario || (item.horas && item.horas.length > 0 ? item.horas[0] : '')
      }))
    : [];

  const handleClick = () => {
    onVerDisponibilidad(doctor);
  };

  const doctorName = doctor.userId?.nombre || doctor.nombre || 'Médico';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {doctor.foto ? (
          <img
            src={doctor.foto}
            alt={doctorName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
            <User className="text-teal-600 dark:text-teal-400" size={24} />
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{doctorName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {doctor.especialidad}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {disponibilidad.slice(0, 2).map((item, i) => (
          <span
            key={i}
            className="bg-teal-50 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs px-2 py-1 rounded-full"
          >
            {item.dia}{item.horario ? ` · ${item.horario}` : ''}
          </span>
        ))}

        {disponibilidad.length > 2 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
            +{disponibilidad.length - 2} más
          </span>
        )}

        {disponibilidad.length === 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
            Sin horarios
          </span>
        )}
      </div>

      <button
        onClick={handleClick}
        className="mt-1 bg-teal-700 dark:bg-teal-600 text-white text-sm px-4 py-2 rounded hover:bg-teal-800 dark:hover:bg-teal-700 transition-colors"
      >
        Ver disponibilidad
      </button>
    </div>
  );
});

// ─── Hook personalizado: debounce ────────────────────────────────────────────

function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function SearchDoctorsPage() {
  const { doctors, isLoading, error, fetchDoctors } = useDoctorStore();
  const showToast = useToastStore((state) => state.showToast);

  // Estado local del input (responde inmediatamente al escribir)
  const [especialidadInput, setEspecialidadInput] = useState('');
  const [fecha, setFecha] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Valor debounced: solo dispara la búsqueda 500ms después de dejar de escribir
  const especialidad = useDebounce(especialidadInput, 500);
  const fechaDebounced = useDebounce(fecha, 300);

  // Estabilizamos fetchDoctors con useCallback para que no cambie referencia
  const loadDoctors = useCallback(async (params) => {
    try {
      await fetchDoctors(params);
    } catch (err) {
      if (!err.response) {
        showToast('Error de conexión. Verificá tu red e intentá de nuevo.', 'error');
      } else {
        showToast('Error al cargar los médicos.', 'error');
      }
    }
  }, [fetchDoctors, showToast]);

  useEffect(() => {
    const params = {};
    if (especialidad) params.especialidad = especialidad;
    if (fechaDebounced) params.fecha = fechaDebounced;
    loadDoctors(params);
  }, [especialidad, fechaDebounced, loadDoctors]);

  // Callback estable para pasar a los cards (evita re-renders innecesarios)
  const handleVerDisponibilidad = useCallback((doctor) => {
    setSelectedDoctor(doctor);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDoctor(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          Buscar Médico
          {isLoading && (
            <span className="inline-block w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          )}
        </h2>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          aria-label="Filtrar por especialidad"
          placeholder="Especialidad"
          value={especialidadInput}
          onChange={e => setEspecialidadInput(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-3 py-2 flex-1 focus:outline-none focus:border-teal-500 text-sm"
        />

        <input
          type="date"
          aria-label="Filtrar por fecha"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:border-teal-500 text-sm w-full sm:w-auto"
        />
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* ── Lista de doctores ────────────────────────────────────────────── */}
      {isLoading && doctors.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 text-sm">
          No se encontraron médicos.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <DoctorCard
              key={doc._id}
              doctor={doc}
              onVerDisponibilidad={handleVerDisponibilidad}
            />
          ))}
        </div>
      )}

      {/* ── Modal de disponibilidad ──────────────────────────────────────── */}
      {selectedDoctor && (
        <AvailabilityGrid
          doctor={selectedDoctor}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
