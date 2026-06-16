import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

function getRouteByRole(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'medico':
      return '/doctor'
    case 'paciente':
      return '/patient/search'
    default:
      return '/'
  }
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  return (
    <main className="bg-gradient-to-b from-teal-50 via-white to-white text-gray-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-gray-950 dark:to-gray-900 dark:text-gray-50">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-teal-200 bg-white px-3 py-1 text-sm font-medium text-teal-700 shadow-sm dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-200">
          MediQ
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-teal-900 md:text-5xl dark:text-white">
          Agenda tus citas médicas de forma rápida y clara
        </h1>

        <p className="mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300 md:text-lg">
          Reserva, consulta y gestiona tu atención médica desde un solo lugar.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!isLoading && isAuthenticated ? (
            <button
              onClick={() => navigate(getRouteByRole(user?.rol))}
              className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
            >
              Ir a mi dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900/70 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Crear cuenta
              </button>
            </>
          )}
        </div>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 text-left text-sm text-gray-600 dark:text-gray-300 md:grid-cols-3">
          <div className="rounded-lg border border-teal-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none">
            <div className="font-semibold text-gray-900 dark:text-gray-100">1. Regístrate</div>
            <p className="mt-1">Crea tu cuenta en pocos pasos.</p>
          </div>
          <div className="rounded-lg border border-teal-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none">
            <div className="font-semibold text-gray-900 dark:text-gray-100">2. Agenda</div>
            <p className="mt-1">Encuentra un médico y reserva tu cita.</p>
          </div>
          <div className="rounded-lg border border-teal-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none">
            <div className="font-semibold text-gray-900 dark:text-gray-100">3. Gestiona</div>
            <p className="mt-1">Consulta tu información cuando la necesites.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
