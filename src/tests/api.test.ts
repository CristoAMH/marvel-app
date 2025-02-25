import { fetchCharacters } from '@/services/api';
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_MARVEL_API_KEY;

// Mockea axios para controlar las respuestas de la API
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Limpia el localStorage antes de cada test
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

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
    // Puedes agregar más personajes de ejemplo
  ];

  it('debería retornar personajes desde la API y guardar en caché', async () => {
    // Configura axios para que devuelva la respuesta mockeada
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          results: mockCharacters,
        },
      },
    });

    // Llama a la función
    const result = await fetchCharacters('3-D');

    // Verifica que la respuesta sea la esperada
    expect(result).toEqual(mockCharacters);

    // Verifica que se haya llamado a axios
    expect(mockedAxios.get).toHaveBeenCalled();

    // Verifica que los datos se hayan guardado en localStorage
    const cacheKey = `marvel_cache_public/characters_apikey=${API_KEY}&nameStartsWith=3-D&limit=50`;
    const cachedData = localStorage.getItem(cacheKey);
    expect(cachedData).not.toBeNull();
    expect(JSON.parse(cachedData!)).toEqual({
      timestamp: expect.any(Number),
      data: mockCharacters,
    });
  });

  it('debería retornar datos del caché si están disponibles y no han expirado', async () => {
    // Simula que ya hay datos en el localStorage
    const cacheKey = `marvel_cache_public/characters_apikey=${API_KEY}&nameStartsWith=3-D&limit=50`;
    const cacheEntry = {
      timestamp: Date.now(),
      data: mockCharacters,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));

    // Llama a la función
    const result = await fetchCharacters('3-D');

    // Axios no debería ser llamado porque se usa el caché
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(result).toEqual(mockCharacters);
  });

  it('debería lanzar un error cuando la API falla', async () => {
    // Configura axios para que devuelva un error
    mockedAxios.get.mockRejectedValue(new Error('API Error'));

    await expect(fetchCharacters('Spider')).rejects.toThrow('Error al obtener personajes');
  });
});
