// src/api/axiosInstance.js
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // necesario para enviar cookies HttpOnly
})

export default axiosInstance
