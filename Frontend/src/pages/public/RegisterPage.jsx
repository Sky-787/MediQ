import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../../utils/validationSchemas';
import { useAuthStore } from '../../stores/useAuthStore';
import useToastStore from '../../stores/useToastStore';

const calculateStrength = (password) => {
  if (!password) return { text: '', color: 'bg-gray-200', width: 'w-0' };
  if (password.length < 6) return { text: 'Débil', color: 'bg-red-500', width: 'w-1/3' };
  
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecials = /[^a-zA-Z0-9]/.test(password);

  if (hasLetters && hasNumbers && hasSpecials) return { text: 'Fuerte', color: 'bg-green-500', width: 'w-full' };
  if (hasLetters && hasNumbers) return { text: 'Media', color: 'bg-yellow-500', width: 'w-2/3' };
  return { text: 'Débil', color: 'bg-red-500', width: 'w-1/3' };
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerAction = useAuthStore((state) => state.register);
  const showToast = useToastStore((state) => state.showToast);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { rol: 'paciente' }
  });

  const watchPassword = watch('contrasena', '');
  const strength = calculateStrength(watchPassword);

  const onSubmit = async (data) => {
    try {
      await registerAction(data);
      showToast('¡Usuario creado exitosamente! Redirigiendo al login...', 'success');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al crear la cuenta. Inténtalo de nuevo.';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-700">
          Crea tu cuenta en MediQ
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <input type="hidden" {...register('rol')} />

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('nombre')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  {...register('email')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  {...register('contrasena')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {errors.contrasena && <p className="mt-1 text-sm text-red-600">{errors.contrasena.message}</p>}
              </div>
              
              {watchPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Fortaleza: {strength.text}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  {...register('confirmarContrasena')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
                {errors.confirmarContrasena && <p className="mt-1 text-sm text-red-600">{errors.confirmarContrasena.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                  Inicia sesión aquí
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}