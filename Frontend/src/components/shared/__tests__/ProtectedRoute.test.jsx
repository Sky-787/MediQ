import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockNavigate = vi.fn();
const mockOutlet = vi.fn(() => <div>contenido protegido</div>);
const mockUseAuthStore = vi.fn();
const mockCheckSession = vi.fn();

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }) => {
    mockNavigate(to);
    return <div>redirect:{to}</div>;
  },
  Outlet: () => mockOutlet(),
}));

vi.mock('../../../stores/useAuthStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

import ProtectedRoute from '../ProtectedRoute';

describe('ProtectedRoute', () => {
  it('muestra spinner mientras valida la sesion', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      checkSession: mockCheckSession,
    });

    render(<ProtectedRoute allowedRoles={['admin']} />);

    expect(screen.getByText((_, node) => node.className.includes('animate-spin'))).toBeInTheDocument();
  });

  it('redirige a login si no hay sesion', () => {
    mockNavigate.mockReset();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      checkSession: mockCheckSession,
    });

    render(<ProtectedRoute allowedRoles={['admin']} />);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('redirige al inicio si el rol no esta autorizado', () => {
    mockNavigate.mockReset();
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { rol: 'paciente' },
      checkSession: mockCheckSession,
    });

    render(<ProtectedRoute allowedRoles={['admin']} />);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renderiza el outlet si el usuario tiene acceso', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { rol: 'admin' },
      checkSession: mockCheckSession,
    });

    render(<ProtectedRoute allowedRoles={['admin']} />);

    expect(screen.getByText('contenido protegido')).toBeInTheDocument();
  });
});
