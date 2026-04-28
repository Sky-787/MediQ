// src/pages/patient/SearchDoctorsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../stores/useAuthStore';
import useDoctorStore from '../../stores/useDoctorStore';
import { SkeletonCard } from '../../components/ui/Skeleton';

function AvailabilityGrid({ doctor, onClose }) {
  const navigate = useNavigate();
  const [disponibilidad, setDisponibilidad] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/doctors/${doctor._id}`)
      .then(res => {
        // La data puede venir en res.data.disponibilidad o res.data.data.disponibilidad
        const raw = res.data?.disponibilidad || res.data?.data?.disponibilidad || [];
        setDisponibilidad(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setDisponibilidad([]));
  }, [doctor._id]);

  const handleSlot = (dia, horario) => {
    onClose();
    navigate(`/patient/book/${doctor._id}`, { state: { dia, horario } });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Disponibilidad — {doctor.nombre}</h3>
        {disponibilidad.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin disponibilidad registrada.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {disponibilidad.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSlot(item.dia, item.horario)}
                className="bg-teal-100 text-teal-800 px-4 py-2 rounded-lg text-sm hover:bg-teal-200 text-left"
              >
                <span className="font-semibold">{item.dia}</span>
                <span className="ml-2 text-teal-600">{item.horario}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:underline">Cerrar</button>
      </div>
    </div>
  );
}

function DoctorCard({ doctor, onVerDisponibilidad }) {
  const disponibilidad = Array.isArray(doctor.disponibilidad) ? doctor.disponibilidad : [];
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {doctor.foto ? (
          <img src={doctor.foto} alt={doctor.nombre} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
            <User className="text-teal-600" size={24} />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800">{doctor.nombre}</p>
          <p className="text-sm text-gray-500">{doctor.especialidad}</p>
        </div>
      </div>
      {/* Mostrar primeros 2 días de disponibilidad como preview */}
      <div className="flex flex-wrap gap-1">
        {disponibilidad.slice(0, 2).map((item, i) => (
          <span key={i} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full">
            {item.dia} · {item.horario}
          </span>
        ))}
        {disponibilidad.length > 2 && (
          <span className="text-xs text-gray-500 px-2 py-1">+{disponibilidad.length - 2} más</span>
        )}
        {disponibilidad.length === 0 && (
          <span className="text-xs text-gray-400 px-2 py-1">Sin horarios</span>
        )}
      </div>
      <button
        onClick={() => onVerDisponibilidad(doctor)}
        className="mt-1 bg-teal-700 text-white text-sm px-4 py-2 rounded hover:bg-teal-800 transition-colors"
      >
        Ver disponibilidad
      </button>
    </div>
  );
}

export default function SearchDoctorsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { doctors, isLoading, error, fetchDoctors } = useDoctorStore();

  const [especialidad, setEspecialidad] = useState('');
  const [fecha, setFecha] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const params = {};
    if (especialidad) params.especialidad = especialidad;
    if (fecha) params.fecha = fecha;
    fetchDoctors(params);
  }, [especialidad, fecha, fetchDoctors]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (isLoading && doctors.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Buscar Médico</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
            {user?.nombre} ({user?.rol})
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Especialidad"
          value={especialidad}
          onChange={e => setEspecialidad(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-3 py-2 flex-1 focus:outline-none focus:border-teal-500 text-sm"
        />
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:border-teal-500 text-sm w-full sm:w-auto"
        />
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-4 text-sm">{error}</div>}

      {doctors.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 text-sm">No se encontraron médicos.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <DoctorCard key={doc._id} doctor={doc} onVerDisponibilidad={setSelectedDoctor} />
          ))}
        </div>
      )}

      {selectedDoctor && (
        <AvailabilityGrid doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
      )}
    </div>
  );
}
