import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import LandingPage from '../LandingPage';

describe('LandingPage', () => {
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
});
