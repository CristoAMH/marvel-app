import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/tests/test-utils';
import HomeClient from '@/features/home/HomeClient';
import { mockCharacters } from '@/tests/mocks/characterMocks';

jest.mock('@/services/api', () => ({
  fetchCharacters: jest.fn().mockResolvedValue([]),
}));
const mockErrorHandler = {
  error: { hasError: false, message: '' },
  handleError: jest.fn(),
  clearError: jest.fn(),
};

jest.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => mockErrorHandler,
}));

describe('HomePage Client Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockErrorHandler.error = { hasError: false, message: '' };
  });

  it('muestra un mensaje cuando no hay resultados', () => {
    renderWithProviders(<HomeClient initialCharacters={[]} />);
    expect(screen.getByText(/No characters found/)).toBeInTheDocument();
  });

  it('maneja errores de la API correctamente', () => {
    mockErrorHandler.error = { hasError: true, message: 'API Error' };

    renderWithProviders(<HomeClient initialCharacters={mockCharacters} />);

    expect(screen.getByText('API Error')).toBeInTheDocument();
  });
});
