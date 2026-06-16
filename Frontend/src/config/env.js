// src/config/env.js

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

if (!import.meta.env.VITE_API_URL && import.meta.env.DEV) {
  console.warn('⚠️ VITE_API_URL no está definida en las variables de entorno. Usando fallback: http://localhost:5001/api');
}

export const env = {
  VITE_API_URL,
};
