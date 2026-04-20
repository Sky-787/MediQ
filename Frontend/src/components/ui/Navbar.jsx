import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getHomeByRole(role) {
	switch (role) {
		case 'admin':
			return '/admin/dashboard';
		case 'medico':
			return '/doctor';
		case 'paciente':
			return '/patient/search';
		default:
			return '/';
	}
}

export default function Navbar() {
	const navigate = useNavigate();
	const { user, isAuthenticated, logout } = useAuth();

	const handleLogout = async () => {
		await logout();
		navigate('/login', { replace: true });
	};

	return (
		<header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link to="/" className="text-xl font-extrabold tracking-tight text-teal-700">
					MediQ
				</Link>

				<nav className="flex items-center gap-2 sm:gap-3">
					<NavLink
						to="/"
						className={({ isActive }) =>
							`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
								isActive ? 'bg-teal-700 text-white' : 'text-gray-700 hover:bg-gray-100'
							}`
						}
					>
						Inicio
					</NavLink>

					{!isAuthenticated ? (
						<>
							<NavLink
								to="/login"
								className={({ isActive }) =>
									`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
										isActive
											? 'bg-teal-700 text-white'
											: 'text-gray-700 hover:bg-gray-100'
									}`
								}
							>
								Login
							</NavLink>
							<NavLink
								to="/register"
								className={({ isActive }) =>
									`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
										isActive
											? 'bg-teal-700 text-white'
											: 'text-gray-700 hover:bg-gray-100'
									}`
								}
							>
								Registro
							</NavLink>
						</>
					) : (
						<>
							<button
								onClick={() => navigate(getHomeByRole(user?.rol))}
								className="rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
							>
								Mi panel
							</button>
							<button
								onClick={handleLogout}
								className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
							>
								Salir
							</button>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
