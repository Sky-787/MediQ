import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockNavigate = vi.fn();
const mockRegister = vi.fn();
const mockShowToast = vi.fn();

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../../src/stores/useAuthStore', () => ({
  useAuthStore: (selector) =>
    selector({
      register: mockRegister,
    }),
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
    mockNavigate.mockReset();
    mockRegister.mockReset();
    mockShowToast.mockReset();
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

  it('calcula fortalezas debil y media segun la contraseña escrita', () => {
    render(<RegisterPage />);

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
});
