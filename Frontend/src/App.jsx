// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'

// Páginas públicas
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'

// Páginas del paciente
import SearchDoctorsPage from './pages/patient/SearchDoctorsPage'
import BookAppointmentPage from './pages/patient/BookAppointmentPage'
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage'

// Páginas del médico
import AgendaPage from './pages/doctor/AgendaPage'
import AvailabilityPage from './pages/doctor/AvailabilityPage'
import NotificationsPage from './pages/doctor/NotificationsPage'

// Páginas del administrador
import DashboardPage from './pages/admin/DashboardPage'
import ReportsPage from './pages/admin/ReportsPage'
import UsersManagementPage from './pages/admin/UsersManagementPage'

/**
 * App.jsx — AppRouter con TODAS las rutas de MediQ
 *
 * Rutas públicas: / | /login | /register
 * Rutas de paciente (protegidas con allowedRoles=['paciente']):
 *   /patient/search | /patient/book/:doctorId | /patient/appointments
 * Rutas de médico (protegidas con allowedRoles=['medico']):
 *   /doctor/agenda | /doctor/availability | /doctor/notifications
 * Rutas de admin (protegidas con allowedRoles=['admin']):
 *   /admin/dashboard | /admin/reports | /admin/users
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rutas Públicas ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Rutas del Paciente (solo rol 'paciente') ── */}
        <Route element={<ProtectedRoute allowedRoles={['paciente']} />}>
          <Route path="/patient/search" element={<SearchDoctorsPage />} />
          <Route path="/patient/book/:doctorId" element={<BookAppointmentPage />} />
          <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
        </Route>

        {/* ── Rutas del Médico (solo rol 'medico') ── */}
        <Route element={<ProtectedRoute allowedRoles={['medico']} />}>
          <Route path="/doctor/agenda" element={<AgendaPage />} />
          <Route path="/doctor/availability" element={<AvailabilityPage />} />
          <Route path="/doctor/notifications" element={<NotificationsPage />} />
        </Route>

        {/* ── Rutas del Administrador (solo rol 'admin') ── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/users" element={<UsersManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
