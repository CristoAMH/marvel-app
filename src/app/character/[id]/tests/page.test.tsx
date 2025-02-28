import { screen, waitFor, act, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/tests/test-utils';
import CharacterPage from '../page';
import * as api from '@/services/api';
import { useRouter, useParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/services/api');
const mockedFetchCharacters = api.fetchCharacters as jest.Mock;
const mockedFetchComicsByCharacter = api.fetchComicsByCharacter as jest.Mock;

const mockedUseRouter = useRouter as jest.Mock;
const mockedUseParams = useParams as jest.Mock;

const sampleCharacter: api.Character = {
  id: 1234,
  name: 'Test Character',
  description: 'A test description',
  modified: '2025-01-01T00:00:00-0400',
  thumbnail: { path: 'http://example.com/character', extension: 'jpg' },
  resourceURI: '',
  comics: { available: 10, collectionURI: '', items: [], returned: 0 },
  series: { available: 10, collectionURI: '', items: [], returned: 0 },
  stories: { available: 10, collectionURI: '', items: [], returned: 0 },
  events: { available: 10, collectionURI: '', items: [], returned: 0 },
  urls: [],
};

const sampleComics: api.Comic[] = [
  {
    id: 9999,
    title: 'Test Comic #1',
    description: 'Some comic description',
    thumbnail: { path: 'http://example.com/comic', extension: 'jpg' },
    dates: [
      {
        type: 'onsaleDate',
        date: '2020-01-01T00:00:00-0500',
      },
    ],
  },
];

describe('CharacterPage', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockedUseParams.mockReturnValue({ id: '1234' });

    mockPush = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockPush });

    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('usa el contexto si el personaje ya existe en CharactersMap', async () => {
    mockedFetchCharacters.mockResolvedValue([]);
    mockedFetchComicsByCharacter.mockResolvedValue([]);

    await act(async () => {
      renderWithProviders(<CharacterPage />, {
        initialCharactersMap: {
          1234: sampleCharacter,
        },
      });
    });

    expect(mockedFetchCharacters).not.toHaveBeenCalled();

    expect(mockedFetchComicsByCharacter).toHaveBeenCalledWith(1234, 20, 'onsaleDate');

    expect(screen.getByRole('heading', { name: /Test Character/i })).toBeInTheDocument();
  });

  it('llama a fetchCharacters si no encuentra el personaje en el contexto', async () => {
    mockedFetchCharacters.mockResolvedValue([sampleCharacter]);
    mockedFetchComicsByCharacter.mockResolvedValue(sampleComics);

    await act(async () => {
      renderWithProviders(<CharacterPage />);
    });

    expect(mockedFetchCharacters).toHaveBeenCalled();
    expect(await screen.findByText('Test Character')).toBeInTheDocument();
  });

  it('redirige a /404 si no encuentra el personaje en la lista', async () => {
    mockedFetchCharacters.mockResolvedValue([]);
    mockedFetchComicsByCharacter.mockResolvedValue(sampleComics);

    await act(async () => {
      renderWithProviders(<CharacterPage />);
    });

    expect(mockedFetchCharacters).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/404');
  });

  it('muestra los cómics tras cargar el personaje', async () => {
    mockedFetchCharacters.mockResolvedValue([sampleCharacter]);
    mockedFetchComicsByCharacter.mockResolvedValue(sampleComics);

    await act(async () => {
      renderWithProviders(<CharacterPage />);
    });

    expect(mockedFetchComicsByCharacter).toHaveBeenCalledWith(1234, 20, 'onsaleDate');

    expect(await screen.findByText('Test Comic #1')).toBeInTheDocument();
  });

  describe('favorites feature', () => {
    it('añade el personaje a favoritos al hacer click en su botón, incrementa el contador en el header', async () => {
      mockedFetchCharacters.mockResolvedValue([sampleCharacter]);
      mockedFetchComicsByCharacter.mockResolvedValue(sampleComics);

      await act(async () => {
        renderWithProviders(<CharacterPage />);
      });

      expect(await screen.findByRole('heading', { name: /Test Character/i })).toBeInTheDocument();

      const addFavButton = screen.getByRole('button', {
        name: /add test character to favorites/i,
      });
      fireEvent.click(addFavButton);

      const headerFavButton = screen.getByRole('button', { name: /show favorites/i });
      const headerCountSpan = headerFavButton.querySelector('span');

      await waitFor(() => {
        expect(headerCountSpan).toHaveTextContent('1');
      });
    });

    it('remove the character from favorites if already added', async () => {
      mockedFetchCharacters.mockResolvedValue([sampleCharacter]);
      mockedFetchComicsByCharacter.mockResolvedValue(sampleComics);

      await act(async () => {
        renderWithProviders(<CharacterPage />);
      });

      // Añadimos a favoritos primero
      const addFavButton = screen.getByRole('button', {
        name: /add test character to favorites/i,
      });
      fireEvent.click(addFavButton);

      const headerFavButton = screen.getByRole('button', { name: /show favorites/i });
      const headerCountSpan = headerFavButton.querySelector('span');

      await waitFor(() => {
        expect(headerCountSpan).toHaveTextContent('1');
      });

      const removeFavButton = screen.getByRole('button', {
        name: /remove test character from favorites/i,
      });
      fireEvent.click(removeFavButton);

      await waitFor(() => {
        expect(headerCountSpan).toHaveTextContent('0');
      });
    });
  });
  it('al hacer click en el corazón del header, se navega a Home y setShowFavorites(true)', async () => {
    mockedFetchCharacters.mockResolvedValue([sampleCharacter]);
    mockedFetchComicsByCharacter.mockResolvedValue(sampleComics);

    await act(async () => {
      renderWithProviders(<CharacterPage />);
    });

    expect(await screen.findByRole('heading', { name: /Test Character/i })).toBeInTheDocument();

    const headerFavButton = screen.getByRole('button', { name: /show favorites/i });

    fireEvent.click(headerFavButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
