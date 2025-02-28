import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '@/tests/test-utils';
import * as api from '@/services/api';
import HomePage from '../page';

jest.mock('@/services/api');
const mockedFetchCharacters = api.fetchCharacters as jest.Mock;

describe('HomePage', () => {
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
    {
      id: 2,
      name: 'Iron Man',
      description: 'Genius, billionaire, playboy, philanthropist',
      modified: '2021-02-02T00:00:00-0400',
      thumbnail: { path: 'http://example.com/ironman', extension: 'jpg' },
      resourceURI: 'http://example.com/ironman',
      comics: { available: 15, collectionURI: '', items: [], returned: 0 },
      series: { available: 8, collectionURI: '', items: [], returned: 0 },
      stories: { available: 8, collectionURI: '', items: [], returned: 0 },
      events: { available: 5, collectionURI: '', items: [], returned: 0 },
      urls: [],
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    mockedFetchCharacters.mockResolvedValue(sampleCharacters);
  });

  afterEach(() => {
    localStorage.clear();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renderiza los elementos iniciales de la UI', async () => {
    await act(async () => {
      renderWithProviders(<HomePage />);
    });
    expect(screen.getByPlaceholderText(/search a character/i)).toBeInTheDocument();
    expect(screen.getByText(/results/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/show favorites/i)).toBeInTheDocument();
  });

  it('carga personajes iniciales al montar el componente', async () => {
    renderWithProviders(<HomePage />);
    await waitFor(() => {
      expect(mockedFetchCharacters).toHaveBeenCalledWith('');
    });

    // Muestra Spider-Man e Iron Man
    expect(await screen.findByText('Spider-Man')).toBeInTheDocument();
    expect(screen.getByText('Iron Man')).toBeInTheDocument();

    // Verifica que hay 2 RESULTS
    expect(screen.getByText(/2 results/i)).toBeInTheDocument();
  });

  it('llama a fetchCharacters con búsqueda debounced al teclear', async () => {
    renderWithProviders(<HomePage />);
    const input = screen.getByPlaceholderText(/search a character/i);

    fireEvent.change(input, { target: { value: 'Spid' } });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockedFetchCharacters).toHaveBeenCalledWith('Spid');
    });
  });

  describe('favorites feature', () => {
    it('añade un personaje a favoritos al hacer clic en el botón de corazón', async () => {
      renderWithProviders(<HomePage />);
      expect(await screen.findByText('Spider-Man')).toBeInTheDocument();

      const spidermanFavoriteButton = screen.getByRole('button', {
        name: /add spider-man to favorites/i,
      });

      fireEvent.click(spidermanFavoriteButton);

      const headerFavButton = screen.getByLabelText(/show favorites/i);
      const headerCountSpan = headerFavButton.querySelector('span');

      await waitFor(() => {
        expect(headerCountSpan).toHaveTextContent('1');
      });
    });

    it('elimina un personaje de favoritos al hacer clic en el botón de corazón', async () => {
      renderWithProviders(<HomePage />);
      expect(await screen.findByText('Spider-Man')).toBeInTheDocument();

      const spidermanAddFavoriteButton = screen.getByRole('button', {
        name: /add spider-man to favorites/i,
      });

      fireEvent.click(spidermanAddFavoriteButton);

      const headerFavButton = screen.getByLabelText(/show favorites/i);
      const headerCountSpan = headerFavButton.querySelector('span');

      await waitFor(() => {
        expect(headerCountSpan).toHaveTextContent('1');
      });

      const spidermanRemoveFavoriteButton = screen.getByRole('button', {
        name: /remove spider-man from favorites/i,
      });
      fireEvent.click(spidermanRemoveFavoriteButton);

      await waitFor(() => {
        expect(headerCountSpan).toHaveTextContent('0');
      });
    });
    it('muestra solo los favoritos al hacer clic en el corazón del header (toggle)', async () => {
      renderWithProviders(<HomePage />);
      // Espera la carga
      expect(await screen.findByText('Spider-Man')).toBeInTheDocument();
      expect(screen.getByText('Iron Man')).toBeInTheDocument();

      const ironFavoriteButton = screen.getByRole('button', {
        name: /add iron man to favorites/i,
      });

      fireEvent.click(ironFavoriteButton);

      const headerFavButton = screen.getByRole('button', { name: /show favorites/i });
      const headerCountSpan = headerFavButton.querySelector('span');

      await waitFor(() => {
        expect(headerCountSpan).toHaveTextContent('1');
      });

      fireEvent.click(headerFavButton);

      expect(screen.queryByText('Spider-Man')).not.toBeInTheDocument();
      expect(screen.getByText('Iron Man')).toBeInTheDocument();

      expect(screen.getByText('FAVORITES')).toBeInTheDocument();
    });
  });
});
