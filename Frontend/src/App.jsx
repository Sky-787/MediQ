// src/App.jsx
import { BrowserRouter, Navigate, Outlet, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'
import Navbar from './components/ui/Navbar'

// Páginas públicas
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import NotFoundPage from './pages/public/NotFoundPage'

// Páginas del paciente
import SearchDoctorsPage from './pages/patient/SearchDoctorsPage'
import BookAppointmentPage from './pages/patient/BookAppointmentPage'
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage'

// Páginas del médico
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage'
import AgendaPage from './pages/doctor/AgendaPage'
import AvailabilityPage from './pages/doctor/AvailabilityPage'
import NotificationsPage from './pages/doctor/NotificationsPage'

// Páginas del administrador
import DashboardPage from './pages/admin/DashboardPage'
import ReportsPage from './pages/admin/ReportsPage'
import UsersManagementPage from './pages/admin/UsersManagementPage'
import AdminLayout from './pages/admin/AdminLayout'
import DoctorLayout from './pages/doctor/DoctorLayout'
import PatientLayout from './pages/patient/PatientLayout'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
    </div>
  )
}

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
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Rutas del Paciente (solo rol 'paciente') ── */}
        <Route element={<ProtectedRoute allowedRoles={['paciente']} />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="search" replace />} />
            <Route path="search" element={<SearchDoctorsPage />} />
            <Route path="book/:doctorId" element={<BookAppointmentPage />} />
            <Route path="appointments" element={<MyAppointmentsPage />} />
          </Route>
        </Route>

        {/* ── Rutas del Médico (solo rol 'medico') ── */}
        <Route element={<ProtectedRoute allowedRoles={['medico']} />}>
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<DoctorDashboardPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* ── Rutas del Administrador (solo rol 'admin') ── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
