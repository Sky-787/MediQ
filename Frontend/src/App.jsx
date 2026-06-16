import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/shared/ProtectedRoute'
import PublicNavbar from './components/ui/PublicNavbar'
import useToastStore from './stores/useToastStore'
import ToastNotification from './components/shared/ToastNotification'
import { useAuthStore } from './stores/useAuthStore'

import LandingPage from './pages/public/LandingPage'
const LoginPage = lazy(() => import('./pages/public/LoginPage'))
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'))

const SearchDoctorsPage = lazy(() => import('./pages/patient/SearchDoctorsPage'))
const BookAppointmentPage = lazy(() => import('./pages/patient/BookAppointmentPage'))
const MyAppointmentsPage = lazy(() => import('./pages/patient/MyAppointmentsPage'))
const PatientLayout = lazy(() => import('./pages/patient/PatientLayout'))

const DoctorDashboardPage = lazy(() => import('./pages/doctor/DoctorDashboardPage'))
const AgendaPage = lazy(() => import('./pages/doctor/AgendaPage'))
const AvailabilityPage = lazy(() => import('./pages/doctor/AvailabilityPage'))
const NotificationsPage = lazy(() => import('./pages/doctor/NotificationsPage'))
const DoctorLayout = lazy(() => import('./pages/doctor/DoctorLayout'))

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))
const UsersManagementPage = lazy(() => import('./pages/admin/UsersManagementPage'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <Outlet />
    </div>
  )
}

function RouteLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-teal-700 border-t-transparent animate-spin" />
    </div>
  )
}

function LazyElement({ children }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const { toast, hideToast } = useToastStore()
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LazyElement><LoginPage /></LazyElement>} />
          <Route path="/register" element={<LazyElement><RegisterPage /></LazyElement>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['paciente']} />}>
          <Route path="/patient" element={<LazyElement><PatientLayout /></LazyElement>}>
            <Route index element={<Navigate to="search" replace />} />
            <Route path="search" element={<LazyElement><SearchDoctorsPage /></LazyElement>} />
            <Route path="book/:doctorId" element={<LazyElement><BookAppointmentPage /></LazyElement>} />
            <Route path="appointments" element={<LazyElement><MyAppointmentsPage /></LazyElement>} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['medico']} />}>
          <Route path="/doctor" element={<LazyElement><DoctorLayout /></LazyElement>}>
            <Route index element={<LazyElement><DoctorDashboardPage /></LazyElement>} />
            <Route path="agenda" element={<LazyElement><AgendaPage /></LazyElement>} />
            <Route path="availability" element={<LazyElement><AvailabilityPage /></LazyElement>} />
            <Route path="notifications" element={<LazyElement><NotificationsPage /></LazyElement>} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<LazyElement><AdminLayout /></LazyElement>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LazyElement><DashboardPage /></LazyElement>} />
            <Route path="reports" element={<LazyElement><ReportsPage /></LazyElement>} />
            <Route path="users" element={<LazyElement><UsersManagementPage /></LazyElement>} />
          </Route>
        </Route>

        <Route path="*" element={<LazyElement><NotFoundPage /></LazyElement>} />
      </Routes>

      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  )
}
