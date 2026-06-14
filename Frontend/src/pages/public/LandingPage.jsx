import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
          MediQ
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          Agenda tus citas médicas de forma rápida y clara
        </h1>

        <p className="mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-300 md:text-lg">
          Reserva, consulta y gestiona tu atención médica desde un solo lugar.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate('/register')}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-50 dark:hover:bg-gray-900"
          >
            Crear cuenta
          </button>
        </div>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 text-left text-sm text-gray-600 dark:text-gray-300 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="font-semibold text-gray-900 dark:text-gray-100">1. Regístrate</div>
            <p className="mt-1">Crea tu cuenta en pocos pasos.</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="font-semibold text-gray-900 dark:text-gray-100">2. Agenda</div>
            <p className="mt-1">Encuentra un médico y reserva tu cita.</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="font-semibold text-gray-900 dark:text-gray-100">3. Gestiona</div>
            <p className="mt-1">Consulta tu información cuando la necesites.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
