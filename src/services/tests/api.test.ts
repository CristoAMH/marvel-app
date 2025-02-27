import { fetchCharacters, fetchComicsByCharacter, Character, Comic } from '@/services/api';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('api', () => {
  describe('fetchCharacters', () => {
    const mockCharacters: Character[] = [
      {
        id: 1011334,
        name: '3-D Man',
        description: 'Some description',
        thumbnail: {
          path: 'http://example.com/image',
          extension: 'jpg',
        },
      },
    ];

    it('debería retornar personajes desde la API y guardar en caché', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: {
            results: mockCharacters,
          },
        },
      });

      // Llama a la función
      const query = '3-D';
      const result = await fetchCharacters(query);

      // Verifica que la respuesta sea la esperada
      expect(result).toEqual(mockCharacters);

      // Verifica que se haya llamado a axios
      expect(mockedAxios.get).toHaveBeenCalled();

      // Verifica que los datos se hayan guardado en localStorage
      const cacheKey = `marvel_cache_public/characters_${query}`;
      const cachedData = localStorage.getItem(cacheKey);
      expect(cachedData).not.toBeNull();
      expect(JSON.parse(cachedData!)).toEqual({
        timestamp: expect.any(Number),
        data: mockCharacters,
      });
    });

    it('debería retornar datos del caché si están disponibles y no han expirado', async () => {
      const query = '3-D';
      const cacheKey = `marvel_cache_public/characters_${query}`;
      const cacheEntry = {
        timestamp: Date.now(),
        data: mockCharacters,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

      const result = await fetchCharacters('3-D');

      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockCharacters);
    });

    it('debería lanzar un error cuando la API falla', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(fetchCharacters('Spider')).rejects.toThrow('Error al obtener personajes');
    });
  });

  describe('fetchComicsByCharacter', () => {
    const mockComics: Comic[] = [
      {
        id: 9999,
        title: 'Sample Comic',
        description: 'Comic description',
        thumbnail: { path: 'http://example.com/comic', extension: 'jpg' },
        dates: [
          {
            type: 'onsaleDate',
            date: '2020-01-01T00:00:00-0500',
          },
        ],
      },
    ];

    it('debería retornar cómics desde la API y guardar en caché', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: {
            results: mockComics,
          },
        },
      });

      const result = await fetchComicsByCharacter(1234);
      expect(result).toEqual(mockComics);
      expect(mockedAxios.get).toHaveBeenCalled();

      const cacheKey = `marvel_comics_1234`;
      const cachedData = localStorage.getItem(cacheKey);
      expect(cachedData).not.toBeNull();
      expect(JSON.parse(cachedData!)).toMatchObject({
        data: mockComics,
      });
    });

    it('debería retornar datos del caché si están disponibles y no han expirado', async () => {
      const cacheKey = `marvel_comics_1234`;
      const cacheEntry = {
        timestamp: Date.now(),
        data: mockComics,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

      const result = await fetchComicsByCharacter(1234);
      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockComics);
    });

    it('debería lanzar un error cuando la API falla', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(fetchComicsByCharacter(9999)).rejects.toThrow(
        'Error al obtener cómics del personaje'
      );
    });
  });
});
