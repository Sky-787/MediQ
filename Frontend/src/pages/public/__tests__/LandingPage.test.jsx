import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const mockNavigate = vi.fn();
const mockAuthState = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../../src/stores/useAuthStore', () => ({
  useAuthStore: () => mockAuthState(),
}));

import LandingPage from '../LandingPage';

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockAuthState.mockReset();
    mockAuthState.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  });

  it('renderiza el contenido principal y navega a login y registro', () => {
    render(<LandingPage />);

    expect(
      screen.getByRole('heading', { name: 'Agenda tus citas médicas de forma rápida y clara' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('muestra acceso al dashboard cuando hay sesión autenticada como admin', () => {
    mockAuthState.mockReturnValue({
      isAuthenticated: true,
      user: { rol: 'admin' },
      isLoading: false,
    });

    render(<LandingPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Ir a mi dashboard' }));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('redirige al panel del médico cuando el rol autenticado es medico', () => {
    mockAuthState.mockReturnValue({
      isAuthenticated: true,
      user: { rol: 'medico' },
      isLoading: false,
    });

    render(<LandingPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Ir a mi dashboard' }));
    expect(mockNavigate).toHaveBeenCalledWith('/doctor');
  });

  it('redirige al panel del paciente y mantiene CTA pública mientras carga', () => {
    mockAuthState.mockReturnValueOnce({
      isAuthenticated: true,
      user: { rol: 'paciente' },
      isLoading: false,
    });

    render(<LandingPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Ir a mi dashboard' }));
    expect(mockNavigate).toHaveBeenCalledWith('/patient/search');

    mockNavigate.mockClear();
    mockAuthState.mockReturnValueOnce({
      isAuthenticated: false,
      user: null,
      isLoading: true,
    });

    render(<LandingPage />);
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('vuelve al inicio si el usuario autenticado tiene un rol no reconocido', () => {
    mockAuthState.mockReturnValue({
      isAuthenticated: true,
      user: { rol: 'desconocido' },
      isLoading: false,
    });

    render(<LandingPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Ir a mi dashboard' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
