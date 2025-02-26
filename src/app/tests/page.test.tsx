import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import * as api from '@/services/api';
import HomePage from '../page';

jest.mock('@/services/api');

describe('HomePage', () => {
  const mockedFetchCharacters = api.fetchCharacters as jest.Mock;

  const sampleCharacters = [
    {
      id: 1,
      name: 'Spider-Man',
      description: 'A friendly neighborhood Spider-Man',
      modified: '2021-01-01T00:00:00-0400',
      thumbnail: { path: 'http://example.com/spiderman', extension: 'jpg' },
      resourceURI: 'http://example.com/spiderman',
      comics: { available: 10, collectionURI: '', items: [], returned: 0 },
      series: { available: 10, collectionURI: '', items: [], returned: 0 },
      stories: { available: 10, collectionURI: '', items: [], returned: 0 },
      events: { available: 10, collectionURI: '', items: [], returned: 0 },
      urls: [],
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    mockedFetchCharacters.mockResolvedValue(sampleCharacters);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renderiza los elementos iniciales de la UI', async () => {
    await act(async () => {
      render(<HomePage />);
    });

    expect(screen.getByRole('heading', { name: /Marvel Characters/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar personaje.../i)).toBeInTheDocument();
    expect(screen.getByText(/Resultados:/i)).toBeInTheDocument();
  });

  it('carga personajes iniciales al montar el componente', async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(mockedFetchCharacters).toHaveBeenCalledWith('');
    });

    expect(await screen.findByText(/Spider-Man/i)).toBeInTheDocument();
    expect(screen.getByText(/Resultados: 1/)).toBeInTheDocument();
  });

  it('llama a fetchCharacters con búsqueda debounced al teclear', async () => {
    render(<HomePage />);
    const input = screen.getByPlaceholderText(/Buscar personaje.../i);

    fireEvent.change(input, { target: { value: 'Spid' } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockedFetchCharacters).toHaveBeenCalledWith('Spid');
    });
  });
});
