import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useToastStore
vi.mock('../../../stores/useToastStore', () => ({
  default: vi.fn(() => ({
    showToast: vi.fn(),
  })),
}));

// Mock SkeletonCard
vi.mock('../../../components/ui/Skeleton', () => ({
  SkeletonCard: () => <div data-testid="skeleton-card">Skeleton</div>,
}));

// Mock useDoctorStore
let mockDoctors = [];
let mockIsLoading = false;
let mockFetchDoctors = vi.fn();

vi.mock('../../../stores/useDoctorStore', () => ({
  default: () => ({
    doctors: mockDoctors,
    isLoading: mockIsLoading,
    error: null,
    fetchDoctors: mockFetchDoctors,
  }),
}));

import SearchDoctorsPage from '../SearchDoctorsPage';

describe('SearchDoctorsPage', () => {
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
});
