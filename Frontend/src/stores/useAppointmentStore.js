import { create } from 'zustand';
import axiosInstance from '../api/axiosInstance';

const useAppointmentStore = create((set) => ({
  appointments: [],
  isLoading: false,
  error: null,

  fetchAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/appointments');
      // El backend devuelve { data: [...], total, page } — extraemos el array
      const data = response.data;
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.data) ? data.data
        : [];
      set({ appointments: list, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar las citas',
        isLoading: false,
        appointments: [],
      });
    }
  },

  createAppointment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/appointments', data);
      const newAppointment = response.data?.data || response.data;
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false,
      }));
      return newAppointment;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al crear la cita',
        isLoading: false,
      });
      throw error;
    }
  },

  updateAppointment: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const url = data.estado ? `/appointments/${id}/status` : `/appointments/${id}`;
      const response = await axiosInstance[data.estado ? 'patch' : 'put'](url, data);
      const updated = response.data?.data || response.data;
      set((state) => ({
        appointments: state.appointments.map(app =>
          app._id === id ? { ...app, ...updated } : app
        ),
        isLoading: false,
      }));
      return updated;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al actualizar la cita',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelAppointment: async (id, motivo = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.patch(`/appointments/${id}/status`, {
        estado: 'cancelada',
        motivo,
      });
      set((state) => ({
        appointments: state.appointments.map(app =>
          app._id === id ? { ...app, estado: 'cancelada' } : app
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cancelar la cita',
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useAppointmentStore;
