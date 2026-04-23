import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import ThemeToggle from './ThemeToggle';

function getHomeByRole(role) {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'medico': return '/doctor';
    case 'paciente': return '/patient/search';
    default: return '/';
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-teal-700 dark:text-teal-400">MediQ</Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <NavLink to="/" className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-teal-700 text-white dark:bg-teal-600' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>Inicio</NavLink>
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-teal-700 text-white dark:bg-teal-600' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-teal-700 text-white dark:bg-teal-600' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>Registro</NavLink>
            </>
          ) : (
            <>
              <button onClick={() => navigate(getHomeByRole(user?.rol))} className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600">Mi panel</button>
              <button onClick={handleLogout} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Salir</button>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
