import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PatientNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-teal-700 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex gap-6">
        <Link to="/patient/search" className="hover:underline">
          Buscar Médico
        </Link>
        <Link to="/patient/appointments" className="hover:underline">
          Mis Citas
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user?.nombre}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-teal-700 px-3 py-1 rounded text-sm font-medium hover:bg-teal-50"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}