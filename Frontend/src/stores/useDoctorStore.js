// src/stores/useDoctorStore.js
import { create } from 'zustand';
import axiosInstance from '../api/axiosInstance';

const useDoctorStore = create((set) => ({
  doctors: [],
  isLoading: false,
  error: null,

  /**
   * fetchDoctors(params)
   * Obtiene la lista de médicos, opcionalmente filtrada por especialidad y/o fecha.
   */
  fetchDoctors: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/doctors', { params });
      let doctorsData = [];
      if (Array.isArray(res.data)) doctorsData = res.data;
      else if (res.data?.data && Array.isArray(res.data.data)) doctorsData = res.data.data;
      else if (res.data?.doctors && Array.isArray(res.data.doctors)) doctorsData = res.data.doctors;
      set({ doctors: doctorsData, isLoading: false });
      return doctorsData;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar los médicos',
        isLoading: false,
        doctors: [],
      });
      throw error;
    }
  },

  fetchMyProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/doctors/profile');
      const doctorData = res.data?.data || res.data;
      set({ isLoading: false });
      return doctorData;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al cargar el perfil del médico',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * updateAvailability(disponibilidad)
   * Actualiza la disponibilidad del médico autenticado.
   * @param {Array} disponibilidad - Array de { dia, horas }
   */
  updateAvailability: async (disponibilidad) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put('/doctors/profile', { disponibilidad });
      set({ isLoading: false });
      return res.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al actualizar disponibilidad',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDoctorStore;
