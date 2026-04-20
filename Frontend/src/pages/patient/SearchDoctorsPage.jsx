// src/pages/patient/SearchDoctorsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuthStore } from '../../stores/useAuthStore';

function AvailabilityGrid({ doctor, onClose }) {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/doctors/${doctor._id}`)
      .then(res => {
        const slotsData = res.data?.slots || [];
        setSlots(Array.isArray(slotsData) ? slotsData : []);
      })
      .catch(() => setSlots([]));
  }, [doctor._id]);

  const handleSlot = (slot) => {
    onClose();
    navigate(`/patient/book/${doctor._id}`, { state: { slot } });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Disponibilidad — {doctor.nombre}</h3>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin slots disponibles.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot, i) => (
              <button key={i} onClick={() => handleSlot(slot)} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm hover:bg-teal-200">
                {slot.fechaHora || slot}
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
  const slots = Array.isArray(doctor.slots) ? doctor.slots : [];
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
      <div className="flex flex-wrap gap-1">
        {slots.slice(0, 3).map((slot, i) => (
          <span key={i} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full">
            {slot.fechaHora || slot}
          </span>
        ))}
        {slots.length > 3 && (
          <span className="text-xs text-gray-500 px-2 py-1">+{slots.length - 3} más</span>
        )}
      </div>
      <button onClick={() => onVerDisponibilidad(doctor)} className="mt-1 bg-teal-700 text-white text-sm px-4 py-2 rounded hover:bg-teal-800 transition-colors">
        Ver disponibilidad
      </button>
    </div>
  );
}

export default function SearchDoctorsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [especialidad, setEspecialidad] = useState('');
  const [fecha, setFecha] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (especialidad) params.especialidad = especialidad;
        if (fecha) params.fecha = fecha;
        const res = await axiosInstance.get('/doctors', { params });
        let doctorsData = [];
        if (Array.isArray(res.data)) doctorsData = res.data;
        else if (res.data?.data && Array.isArray(res.data.data)) doctorsData = res.data.data;
        else if (res.data?.doctors && Array.isArray(res.data.doctors)) doctorsData = res.data.doctors;
        setDoctors(doctorsData);
      } catch (err) {
        setError('Error al cargar los médicos');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [especialidad, fecha]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-700 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Cargando médicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Buscar Médico</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.nombre} ({user?.rol})</span>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Especialidad" value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:border-teal-500" />
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500" />
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

      {doctors.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No se encontraron médicos.</div>
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
