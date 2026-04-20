// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// AuthProvider eliminado — el estado de sesión ahora lo maneja
// useAuthStore (Zustand) en src/stores/useAuthStore.js

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
