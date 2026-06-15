import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockClearError = vi.fn();
const mockUseAuthStore = vi.fn();

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../../src/stores/useAuthStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('../../../../src/components/ui/AuthFeedback', () => ({
  default: ({ message }) => (message ? <div>{message}</div> : null),
}));

vi.mock('../../../../src/components/shared/ToastNotification', () => ({
  default: ({ message, onClose }) => (
    <div>
      <span>{message}</span>
      <button onClick={onClose}>cerrar-toast</button>
    </div>
  ),
}));

import LoginPage from '../LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLogin.mockReset();
    mockClearError.mockReset();
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      error: null,
      clearError: mockClearError,
      user: null,
      isAuthenticated: false,
    });
  });

  it('redirige segun el rol cuando la sesion ya esta autenticada', async () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      error: null,
      clearError: mockClearError,
      user: { rol: 'admin' },
      isAuthenticated: true,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
    });
  });

  it('redirige a la ruta del medico cuando el rol autenticado es medico', async () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      error: null,
      clearError: mockClearError,
      user: { rol: 'medico' },
      isAuthenticated: true,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/doctor', { replace: true });
    });
  });

  it('redirige a paciente y usa fallback / si el rol no coincide con los casos esperados', async () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      error: null,
      clearError: mockClearError,
      user: { rol: 'paciente' },
      isAuthenticated: true,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/patient/search', { replace: true });
    });

    mockNavigate.mockReset();
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      error: null,
      clearError: mockClearError,
      user: { rol: 'otro' },
      isAuthenticated: true,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('no muestra toast cuando el backend responde con error controlado', async () => {
    mockLogin.mockRejectedValueOnce({
      response: {
        data: { message: 'Credenciales inválidas' },
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(
      screen.queryByText('No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'),
    ).not.toBeInTheDocument();
  });

  it('envia credenciales al iniciar sesion y limpia errores al escribir', async () => {
    mockLogin.mockResolvedValueOnce();
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123456' } });

    expect(mockClearError).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ana@mediq.com', '123456');
    });
  });

  it('muestra toast cuando falla por red', async () => {
    mockLogin.mockRejectedValueOnce(new Error('network'));
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(
        screen.getByText('No pudimos conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'cerrar-toast' }));
  });

  it('muestra errores de validacion del formulario', async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
      expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument();
    });
  });
});
