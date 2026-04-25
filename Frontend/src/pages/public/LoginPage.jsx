import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../../utils/validationSchemas';
import { useAuthStore } from '../../stores/useAuthStore';
import AuthFeedback from '../../components/ui/AuthFeedback';
import ToastNotification from '../../components/shared/ToastNotification';

function getRouteByRole(role) {
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, clearError, user, isAuthenticated } = useAuthStore();
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && user?.rol) {
      navigate(getRouteByRole(user.rol), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.contrasena);
    } catch (error) {
      if (error.response) {
        // El mensaje de credenciales/servidor ya vive en useAuthStore.error y lo pinta AuthFeedback.
        return;
      }

      setToast({
        show: true,
        message: 'No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
        type: 'error',
      });
    }
  };

  const emailReg = register('email');
  const passwordReg = register('contrasena');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-700">
          Iniciar Sesión en MediQ
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  {...emailReg}
                  onChange={(e) => {
                    clearError();
                    emailReg.onChange(e);
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  {...passwordReg}
                  onChange={(e) => {
                    clearError();
                    passwordReg.onChange(e);
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {errors.contrasena && (
                  <p className="mt-2 text-sm text-red-600">{errors.contrasena.message}</p>
                )}
              </div>
            </div>

            <AuthFeedback message={error} type="error" />

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500">
                ¿Eres un usuario nuevo?{' '}
                <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
                  Regístrate aquí
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
