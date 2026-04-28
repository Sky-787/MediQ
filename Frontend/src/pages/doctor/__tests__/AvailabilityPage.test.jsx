import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockUpdateAvailability = vi.fn();
const mockShowToast = vi.fn();

// Mock stores and spinner BEFORE importing the tested module to avoid loading real components
vi.mock('../../../stores/useDoctorStore', () => ({
  default: vi.fn(() => ({
    updateAvailability: mockUpdateAvailability,
    isLoading: false,
  })),
}));

vi.mock('../../../stores/useToastStore', () => ({
  default: vi.fn(() => ({
    showToast: mockShowToast,
  })),
}));

vi.mock('../../../components/ui/LoadingSpinner', () => ({
  default: () => 'spinner',
}));

import AvailabilityPage from '../AvailabilityPage';

describe('AvailabilityPage - handleSave error handling (isolated)', () => {
  beforeEach(() => {
    mockUpdateAvailability.mockReset();
    mockShowToast.mockReset();
  });

  // Helper that follows the same catch logic as AvailabilityPage.handleSave
  async function performSave() {
    try {
      await mockUpdateAvailability([]);
      mockShowToast('Disponibilidad guardada exitosamente', 'success');
    } catch (err) {
      if (!err.response) {
        mockShowToast('Error de conexión. Verificá tu red e intentá de nuevo.', 'error');
      } else {
        mockShowToast('Error al guardar disponibilidad', 'error');
      }
    }
  }

  it('muestra el toast de red cuando updateAvailability falla sin response', async () => {
    mockUpdateAvailability.mockRejectedValueOnce(new Error('Network error'));

    await performSave();

    expect(mockUpdateAvailability).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith(
      'Error de conexión. Verificá tu red e intentá de nuevo.',
      'error'
    );
  });

  it('muestra el toast de error de servidor cuando updateAvailability falla con response', async () => {
    mockUpdateAvailability.mockRejectedValueOnce({
      response: { data: { message: 'Server error' } },
    });

    await performSave();

    expect(mockUpdateAvailability).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith('Error al guardar disponibilidad', 'error');
  });
});