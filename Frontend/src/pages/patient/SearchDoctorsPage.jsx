import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// ── AvailabilityGrid ──────────────────────────────────────────────
function AvailabilityGrid({ doctor, onClose }) {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/doctors/${doctor._id}`)
      .then(res => setSlots(res.data.slots || []))
      .catch(() => setSlots([]));
  }, [doctor._id]);

  const handleSlot = (slot) => {
    onClose();
    navigate(`/patient/book/${doctor._id}`, { state: { slot } });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Disponibilidad — {doctor.nombre}
        </h3>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin slots disponibles.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot, i) => (
              <button
                key={i}
                onClick={() => handleSlot(slot)}
                className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm hover:bg-teal-200"
              >
                {slot.fechaHora || slot}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// ── DoctorCard ────────────────────────────────────────────────────
function DoctorCard({ doctor, onVerDisponibilidad }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {doctor.foto ? (
          <img
            src={doctor.foto}
            alt={doctor.nombre}
            className="w-12 h-12 rounded-full object-cover"
          />
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
        {(doctor.slots || []).map((slot, i) => (
          <span
            key={i}
            className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full"
          >
            {slot.fechaHora || slot}
          </span>
        ))}
      </div>
      <button
        onClick={() => onVerDisponibilidad(doctor)}
        className="mt-1 bg-teal-700 text-white text-sm px-4 py-2 rounded hover:bg-teal-800"
      >
        Ver disponibilidad
      </button>
    </div>
  );
}

// ── SearchDoctorsPage ─────────────────────────────────────────────
export default function SearchDoctorsPage() {
  const [especialidad, setEspecialidad] = useState('');
  const [fecha, setFecha] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const params = {};
    if (especialidad) params.especialidad = especialidad;
    if (fecha) params.fecha = fecha;

    axiosInstance.get('/doctors', { params })
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]));
  }, [especialidad, fecha]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Buscar Médico</h2>

      {/* FilterBar */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Especialidad"
          value={especialidad}
          onChange={e => setEspecialidad(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 flex-1 focus:outline-none focus:border-teal-500"
        />
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* DoctorList */}
      {doctors.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No se encontraron médicos.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <DoctorCard
              key={doc._id}
              doctor={doc}
              onVerDisponibilidad={setSelectedDoctor}
            />
          ))}
        </div>
      )}

      {/* AvailabilityGrid modal */}
      {selectedDoctor && (
        <AvailabilityGrid
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
}
