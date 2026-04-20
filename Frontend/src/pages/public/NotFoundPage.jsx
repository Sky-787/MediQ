import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-gray-900">Pagina no encontrada</h1>
        <p className="mt-3 text-gray-600">
          La ruta que buscaste no existe o fue movida. Puedes volver al inicio y continuar navegando.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            Ir al inicio
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            Ir a login
          </Link>
        </div>
      </div>
    </section>
  );
}
