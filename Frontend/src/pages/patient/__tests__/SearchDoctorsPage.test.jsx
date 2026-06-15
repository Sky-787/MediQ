import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useToastStore
const mockShowToast = vi.fn();
vi.mock('../../../stores/useToastStore', () => ({
  default: vi.fn(() => ({
    showToast: mockShowToast,
  })),
}));

const mockAxiosGet = vi.fn();
vi.mock('../../../api/axiosInstance', () => ({
  default: {
    get: (...args) => mockAxiosGet(...args),
  },
}));

// Mock SkeletonCard
vi.mock('../../../components/ui/Skeleton', () => ({
  SkeletonCard: () => <div data-testid="skeleton-card">Skeleton</div>,
}));

// Mock useDoctorStore
let mockDoctors = [];
let mockIsLoading = false;
let mockError = null;
let mockFetchDoctors = vi.fn();

vi.mock('../../../stores/useDoctorStore', () => ({
  default: () => ({
    doctors: mockDoctors,
    isLoading: mockIsLoading,
    error: mockError,
    fetchDoctors: mockFetchDoctors,
  }),
}));

import SearchDoctorsPage from '../SearchDoctorsPage';

describe('SearchDoctorsPage', () => {
  beforeEach(() => {
    mockDoctors = [];
    mockIsLoading = false;
    mockError = null;
    mockFetchDoctors.mockReset();
    mockAxiosGet.mockReset();
    mockShowToast.mockReset();
    mockNavigate.mockReset();
  });

  it('keeps inputs mounted and renders skeletons when loading and doctors list is empty', () => {
    mockDoctors = [];
    mockIsLoading = true;

    render(<SearchDoctorsPage />);

    // Verify filter inputs are still mounted (the bug was that they got unmounted during loading)
    expect(screen.getByPlaceholderText('Especialidad')).toBeInTheDocument();
    expect(screen.queryAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  });

  it('renders doctors list when not loading and doctors exist', () => {
    mockDoctors = [
      { _id: 'd1', nombre: 'Dr. House', especialidad: 'Diagnóstico', disponibilidad: [] }
    ];
    mockIsLoading = false;

    render(<SearchDoctorsPage />);

    expect(screen.getByPlaceholderText('Especialidad')).toBeInTheDocument();
    expect(screen.getByText('Dr. House')).toBeInTheDocument();
    expect(screen.queryAllByTestId('skeleton-card').length).toBe(0);
  });

  it('muestra mensaje cuando no hay doctores y existe error', () => {
    mockError = 'Error al cargar';

    render(<SearchDoctorsPage />);

    expect(screen.getByText('Error al cargar')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron médicos.')).toBeInTheDocument();
  });

  it('abre el modal de disponibilidad, carga horarios y permite cerrarlo', async () => {
    mockDoctors = [
      {
        _id: 'd1',
        userId: { nombre: 'Doctor Demo' },
        especialidad: 'Cardiología',
        disponibilidad: [{ dia: 'Lunes', horas: ['08:00-12:00'] }],
      },
    ];
    mockAxiosGet.mockResolvedValueOnce({
      data: {
        disponibilidad: [{ dia: 'Lunes', horas: ['08:00-12:00'] }],
      },
    });

    render(<SearchDoctorsPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Ver disponibilidad' }));

    await waitFor(() => {
      expect(screen.getByText(/Disponibilidad — Doctor Demo/)).toBeInTheDocument();
    });

    expect(mockAxiosGet).toHaveBeenCalledWith('/doctors/d1');
    expect(screen.getByRole('button', { name: /Lunes/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    await waitFor(() => {
      expect(screen.queryByText(/Disponibilidad — Doctor Demo/)).not.toBeInTheDocument();
    });
  });
});
