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
      set({ appointments: response.data || [], isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar las citas', 
        isLoading: false,
        appointments: []
      });
    }
  },

  createAppointment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post('/appointments', data);
      set((state) => ({ 
        appointments: [...state.appointments, response.data],
        isLoading: false 
      }));
      return response.data; // Retornamos para que la vista pueda saber que fue éxito
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al crear la cita', 
        isLoading: false 
      });
      throw error; // Para que el componente capture y muestre su error si lo necesita
    }
  },

  updateAppointment: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Intentamos con patch/status o put dependiendo del data
      const url = data.estado ? `/appointments/${id}/status` : `/appointments/${id}`;
      const response = await axiosInstance[data.estado ? 'patch' : 'put'](url, data);
      
      set((state) => ({
        appointments: state.appointments.map(app => 
          app._id === id ? { ...app, ...response.data } : app
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la cita', 
        isLoading: false 
      });
      throw error;
    }
  },

  cancelAppointment: async (id, motivo = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.patch(`/appointments/${id}/status`, { 
        estado: 'cancelada', 
        motivo 
      });
      
      set((state) => ({
        appointments: state.appointments.map(app => 
          app._id === id ? { ...app, estado: 'cancelada' } : app
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cancelar la cita', 
        isLoading: false 
      });
      throw error;
    }
  }
}));

export default useAppointmentStore;
