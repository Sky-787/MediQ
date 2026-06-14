import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../../api/axiosInstance', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

import { useAuthStore } from '../useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });
  });

  it('checkSession autentica al usuario cuando /auth/me responde con data', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: { _id: 'u1', rol: 'admin', nombre: 'Ada' },
      },
    });

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user?.nombre).toBe('Ada');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('checkSession limpia la sesion si /auth/me falla', async () => {
    mockGet.mockRejectedValueOnce(new Error('401'));

    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('login guarda el usuario cuando backend responde correctamente', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: { _id: 'u2', rol: 'paciente', nombre: 'Nora' },
      },
    });

    await useAuthStore.getState().login('nora@mediq.com', '123456');

    const state = useAuthStore.getState();
    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'nora@mediq.com',
      contrasena: '123456',
    });
    expect(state.user?.rol).toBe('paciente');
    expect(state.isAuthenticated).toBe(true);
  });

  it('login guarda el mensaje de error cuando el backend falla', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        data: { message: 'Credenciales inválidas' },
      },
    });

    await expect(useAuthStore.getState().login('nora@mediq.com', 'mal')).rejects.toBeTruthy();
    expect(useAuthStore.getState().error).toBe('Credenciales inválidas');
  });

  it('logout intenta cerrar sesion y limpia el store aunque falle la red', async () => {
    useAuthStore.setState({
      user: { _id: 'u3', rol: 'medico' },
      isAuthenticated: true,
      isLoading: false,
      error: 'x',
    });
    mockPost.mockRejectedValueOnce(new Error('network'));

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });

  it('helpers de rol responden segun el usuario actual', () => {
    useAuthStore.setState({
      user: { rol: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    expect(useAuthStore.getState().isAdmin()).toBe(true);
    expect(useAuthStore.getState().isMedico()).toBe(false);
    expect(useAuthStore.getState().isPaciente()).toBe(false);
  });
});
