import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';

const mockNavigate = vi.fn();
const mockRegister = vi.fn();
const mockShowToast = vi.fn();
const mockAuthState = vi.fn();
let currentAuthState;

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../../src/stores/useAuthStore', () => ({
  useAuthStore: (selector) => selector(mockAuthState()),
}));

vi.mock('../../../../src/stores/useToastStore', () => ({
  default: (selector) =>
    selector({
      showToast: mockShowToast,
    }),
}));

import RegisterPage from '../RegisterPage';

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.useRealTimers();
    cleanup();
    mockNavigate.mockReset();
    mockRegister.mockReset();
    mockShowToast.mockReset();
    mockAuthState.mockReset();
    currentAuthState = {
      register: mockRegister,
      user: null,
      isAuthenticated: false,
    };
    mockAuthState.mockImplementation(() => currentAuthState);
  });

  it('redirige al panel correcto si ya existe sesión autenticada', () => {
    currentAuthState = {
      register: mockRegister,
      user: { rol: 'admin' },
      isAuthenticated: true,
    };
    render(<RegisterPage />);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });

    cleanup();
    mockNavigate.mockClear();
    currentAuthState = {
      register: mockRegister,
      user: { rol: 'medico' },
      isAuthenticated: true,
    };
    render(<RegisterPage />);
    expect(mockNavigate).toHaveBeenCalledWith('/doctor', { replace: true });

    cleanup();
    mockNavigate.mockClear();
    currentAuthState = {
      register: mockRegister,
      user: { rol: 'paciente' },
      isAuthenticated: true,
    };
    render(<RegisterPage />);
    expect(mockNavigate).toHaveBeenCalledWith('/patient/search', { replace: true });
  });

  it('redirige al inicio si el usuario autenticado tiene un rol no reconocido', () => {
    currentAuthState = {
      register: mockRegister,
      user: { rol: 'otro' },
      isAuthenticated: true,
    };

    render(<RegisterPage />);

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('muestra la fortaleza de la contraseña y registra con exito', async () => {
    vi.useFakeTimers();
    mockRegister.mockResolvedValueOnce();
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'laura@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123*' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Clave123*' },
    });

    expect(screen.getByText(/Fortaleza: Fuerte/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
      await Promise.resolve();
    });

    expect(mockRegister).toHaveBeenCalledWith({
      nombre: 'Laura',
      email: 'laura@mediq.com',
      contrasena: 'Clave123*',
      confirmarContrasena: 'Clave123*',
      rol: 'paciente',
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      '¡Usuario creado exitosamente! Redirigiendo al login...',
      'success',
    );

    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('muestra toast con mensaje del backend si el registro falla', async () => {
    mockRegister.mockRejectedValueOnce({
      response: { data: { message: 'El correo ya existe' } },
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'laura@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123*' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Clave123*' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('El correo ya existe', 'error');
    });
  });

  it('usa data.error cuando el backend responde con esa forma', async () => {
    mockRegister.mockRejectedValueOnce({
      response: { data: { error: 'Registro deshabilitado' } },
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'laura@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123*' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Clave123*' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Registro deshabilitado', 'error');
    });
  });

  it('calcula fortalezas vacía, débil y media según la contraseña escrita', () => {
    render(<RegisterPage />);

    expect(screen.queryByText(/Fortaleza:/)).not.toBeInTheDocument();

    const passwordInput = screen.getByLabelText('Contraseña');
    fireEvent.change(passwordInput, { target: { value: '123' } });
    expect(screen.getByText(/Fortaleza: Débil/)).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: 'Clave123' } });
    expect(screen.getByText(/Fortaleza: Media/)).toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: 'abcdefg' } });
    expect(screen.getByText(/Fortaleza: Débil/)).toBeInTheDocument();
  });

  it('usa mensaje genérico cuando falla sin response', async () => {
    mockRegister.mockRejectedValueOnce(new Error('network'));

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'laura@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123*' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Clave123*' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Error al crear la cuenta. Inténtalo de nuevo.',
        'error',
      );
    });
  });

  it('muestra error de nombre inválido y no envía el formulario', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'laura@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123*' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Clave123*' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(
        screen.getByText('El nombre debe tener al menos 2 caracteres'),
      ).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('muestra error de correo inválido y no envía el formulario', async () => {
    const { container } = render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'correo-invalido' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123*' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Clave123*' },
    });
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('muestra error de contraseña corta y no envía el formulario', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'laura@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('muestra error cuando las contraseñas no coinciden y no registra', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'laura@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Otra123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('muestra estado de envío mientras el registro está pendiente', async () => {
    let resolvePromise;
    mockRegister.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Laura' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'laura@mediq.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123*' } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), {
      target: { value: 'Clave123*' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Creando cuenta...' })).toBeDisabled();
    });

    await act(async () => {
      resolvePromise();
      await Promise.resolve();
    });
  });
});
