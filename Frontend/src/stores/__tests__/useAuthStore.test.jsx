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

  it('checkSession limpia la sesion si /auth/me responde sin data.data', async () => {
    mockGet.mockResolvedValueOnce({
      data: {},
    });

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
    expect(state.isLoading).toBe(false);
  });

  it('login acepta respuesta sin data.data y guarda el objeto completo', async () => {
    mockPost.mockResolvedValueOnce({
      data: { _id: 'u2', rol: 'medico', nombre: 'Nora' },
    });

    await useAuthStore.getState().login('nora@mediq.com', '123456');

    const state = useAuthStore.getState();
    expect(state.user?.rol).toBe('medico');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('login guarda el mensaje de error cuando el backend falla', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        data: { message: 'Credenciales inválidas' },
      },
    });

    await expect(useAuthStore.getState().login('nora@mediq.com', 'mal')).rejects.toBeTruthy();
    expect(useAuthStore.getState().error).toBe('Credenciales inválidas');
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('login usa mensaje genérico cuando falla sin response', async () => {
    mockPost.mockRejectedValueOnce(new Error('network'));

    await expect(useAuthStore.getState().login('nora@mediq.com', 'mal')).rejects.toBeTruthy();
    expect(useAuthStore.getState().error).toBe(
      'Error al iniciar sesión. Verifica tus credenciales.',
    );
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('register limpia loading cuando crea la cuenta', async () => {
    mockPost.mockResolvedValueOnce({});

    await useAuthStore.getState().register({
      nombre: 'Ana',
      email: 'ana@mediq.com',
    });

    expect(mockPost).toHaveBeenCalledWith('/auth/register', {
      nombre: 'Ana',
      email: 'ana@mediq.com',
    });
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('register guarda error del backend cuando falla', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        data: { error: 'Registro inválido' },
      },
    });

    await expect(useAuthStore.getState().register({})).rejects.toBeTruthy();
    expect(useAuthStore.getState().error).toBe('Registro inválido');
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('register usa mensaje genérico cuando falla sin response', async () => {
    mockPost.mockRejectedValueOnce(new Error('network'));

    await expect(useAuthStore.getState().register({})).rejects.toBeTruthy();
    expect(useAuthStore.getState().error).toBe('Error al crear la cuenta. Intentá de nuevo.');
    expect(useAuthStore.getState().isLoading).toBe(false);
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

  it('helpers de rol detectan medico y paciente', () => {
    useAuthStore.setState({
      user: { rol: 'medico' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    expect(useAuthStore.getState().isMedico()).toBe(true);
    expect(useAuthStore.getState().isAdmin()).toBe(false);

    useAuthStore.setState({
      user: { rol: 'paciente' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    expect(useAuthStore.getState().isPaciente()).toBe(true);
    expect(useAuthStore.getState().isMedico()).toBe(false);
  });

  it('clearError limpia el ultimo error', () => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'boom',
    });

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
