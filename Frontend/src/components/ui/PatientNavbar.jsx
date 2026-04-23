import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';

export default function PatientNavbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };
  return (
    <nav className="bg-teal-700 dark:bg-gray-900 text-white px-6 py-3 flex items-center justify-between border-b border-teal-800 dark:border-gray-700">
      <div className="flex gap-6">
        <Link to="/patient/search" className="hover:underline dark:text-gray-200">Buscar Médico</Link>
        <Link to="/patient/appointments" className="hover:underline dark:text-gray-200">Mis Citas</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm dark:text-gray-300">{user?.nombre}</span>
        <ThemeToggle />
        <button onClick={handleLogout} className="bg-white text-teal-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded text-sm font-medium hover:bg-teal-50 transition-colors">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
