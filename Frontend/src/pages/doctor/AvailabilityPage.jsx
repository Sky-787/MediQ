// src/pages/doctor/AvailabilityPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import useDoctorStore from '../../stores/useDoctorStore';
import useToastStore from '../../stores/useToastStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AvailabilityPage = () => {
  const { updateAvailability, isLoading } = useDoctorStore();
  const { showToast } = useToastStore();
  const [availability, setAvailability] = useState([]);
  const [saving, setSaving] = useState(false);

  const weekDays = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
    { id: 0, name: 'Domingo' },
  ];

  useEffect(() => {
    const initialAvailability = weekDays.map(day => ({
      dayId: day.id,
      dayName: day.name,
      active: day.id !== 0 && day.id !== 6,
      slots: day.id !== 0 && day.id !== 6 ? ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] : [],
    }));
    setAvailability(initialAvailability);
  }, []);

  const toggleDay = (dayId) => {
    setAvailability(prev =>
      prev.map(day =>
        day.dayId === dayId
          ? { ...day, active: !day.active, slots: !day.active ? ['09:00', '10:00', '11:00'] : [] }
          : day
      )
    );
  };

  const addSlot = (dayId) => {
    setAvailability(prev =>
      prev.map(day => {
        if (day.dayId === dayId) {
          return { ...day, slots: [...day.slots, '12:00'].sort() };
        }
        return day;
      })
    );
  };

  const removeSlot = (dayId, slotToRemove) => {
    setAvailability(prev =>
      prev.map(day =>
        day.dayId === dayId
          ? { ...day, slots: day.slots.filter(slot => slot !== slotToRemove) }
          : day
      )
    );
  };

  const updateSlot = (dayId, oldSlot, newSlot) => {
    setAvailability(prev =>
      prev.map(day => {
        if (day.dayId === dayId) {
          const updatedSlots = day.slots.map(slot => slot === oldSlot ? newSlot : slot);
          return { ...day, slots: updatedSlots.sort() };
        }
        return day;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedAvailability = availability
        .filter(day => day.active && day.slots.length > 0)
        .map(day => ({
          diaSemana: day.dayId,
          slots: day.slots,
        }));

      await updateAvailability(formattedAvailability);
      showToast('Disponibilidad guardada exitosamente', 'success');
    } catch {
      showToast('Error al guardar disponibilidad', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !saving) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Configurar Disponibilidad</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

        <div className="space-y-4">
          {availability.map((day) => (
            <div key={day.dayId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={day.active}
                    onChange={() => toggleDay(day.dayId)}
                    className="w-4 h-4 text-teal-700 rounded focus:ring-teal-500"
                  />
                  <span className="font-medium">{day.dayName}</span>
                </div>
                {day.active && (
                  <button
                    onClick={() => addSlot(day.dayId)}
                    className="flex items-center gap-1 text-sm text-teal-700 hover:text-teal-800"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar horario
                  </button>
                )}
              </div>

              {day.active && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {day.slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-50 p-2 rounded border"
                    >
                      <input
                        type="time"
                        value={slot}
                        onChange={(e) => updateSlot(day.dayId, slot, e.target.value)}
                        className="flex-1 text-sm border-none bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => removeSlot(day.dayId, slot)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
