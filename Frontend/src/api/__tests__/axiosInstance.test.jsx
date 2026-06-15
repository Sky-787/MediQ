import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUse = vi.fn();
const mockPost = vi.fn();
const mockAxiosInstance = {
  interceptors: {
    response: {
      use: mockUse,
    },
  },
  post: mockPost,
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

describe('axiosInstance interceptor', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUse.mockReset();
    mockPost.mockReset();
    localStorage.clear();
    sessionStorage.clear();
    Object.defineProperty(window, 'location', {
      value: { href: '/' },
      writable: true,
      configurable: true,
    });
  });

  it('ignora errores que no son 401 o rutas auth permitidas', async () => {
    await import('../axiosInstance');
    const rejected = mockUse.mock.calls[0][1];
    const error = { response: { status: 500 }, config: { url: '/doctors' } };

    await expect(rejected(error)).rejects.toBe(error);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('hace purge completa y redirecciona cuando recibe 401 real', async () => {
    const authState = vi.fn();
    authState.setState = vi.fn();
    const appointmentState = { setState: vi.fn() };
    const doctorState = { setState: vi.fn() };

    vi.doMock('../../stores/useAuthStore', () => ({ useAuthStore: authState }));
    vi.doMock('../../stores/useAppointmentStore', () => ({ default: appointmentState }));
    vi.doMock('../../stores/useDoctorStore', () => ({ default: doctorState }));

    await import('../axiosInstance');
    const rejected = mockUse.mock.calls[0][1];
    mockPost.mockResolvedValueOnce({});

    localStorage.setItem('x', '1');
    sessionStorage.setItem('y', '2');

    const error = { response: { status: 401 }, config: { url: '/appointments' } };
    await expect(rejected(error)).rejects.toBe(error);

    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
    expect(authState.setState).toHaveBeenCalled();
    expect(appointmentState.setState).toHaveBeenCalled();
    expect(doctorState.setState).toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(window.location.href).toBe('/login');
  });
});
