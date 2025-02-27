import axios from 'axios';
import md5 from 'md5';

const BASE_URL = process.env.NEXT_PUBLIC_MARVEL_API_BASE;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_MARVEL_PUBLIC_KEY;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_MARVEL_PRIVATE_KEY;

export interface Thumbnail {
  path: string;
  extension: string;
}

export interface Comics {
  available: number;
  collectionURI: string;
  items: { resourceURI: string; name: string }[];
  returned: number;
}

export interface Series {
  available: number;
  collectionURI: string;
  items: { resourceURI: string; name: string }[];
  returned: number;
}

export interface Stories {
  available: number;
  collectionURI: string;
  items: { resourceURI: string; name: string; type: string }[];
  returned: number;
}

export interface Events {
  available: number;
  collectionURI: string;
  items: { resourceURI: string; name: string }[];
  returned: number;
}

export interface Url {
  type: string;
  url: string;
}

export interface Character {
  id: number;
  name: string;
  description: string;
  modified: string;
  thumbnail: Thumbnail;
  resourceURI: string;
  comics: Comics;
  series: Series;
  stories: Stories;
  events: Events;
  urls: Url[];
}

/**
 * Interfaz para un cómic detallado
 */
export interface Comic {
  id: number;
  title: string;
  description?: string;
  thumbnail: Thumbnail;
  dates: Array<{
    type: string;
    date: string;
  }>;
  // Agrega aquí otros campos si los necesitas (ej: pageCount, prices, creators, etc.)
}

// Interfaz para la estructura de caché
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

// Genera una clave de caché para personajes
function getCharactersCacheKey(endpoint: string, query: string) {
  return `marvel_cache_${endpoint}_${query}`;
}

// Genera una clave de caché para cómics de un personaje
function getComicsCacheKey(characterId: number) {
  return `marvel_comics_${characterId}`;
}

/**
 * fetchCharacters: Recupera un listado de personajes de Marvel.
 * - query: filtro de búsqueda (nombre que empiece con el valor dado).
 * - Utiliza caché local (localStorage) para no hacer llamadas continuas a la API.
 * - La caché se renueva cada 24 horas.
 */
export async function fetchCharacters(query = ''): Promise<Character[]> {
  const endpoint = 'public/characters';

  // Genera el timestamp y el hash de autenticación
  const ts = new Date().getTime().toString();
  const hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY);

  // Configura los parámetros de la petición
  const params: Record<string, any> = {
    ts,
    apikey: PUBLIC_KEY,
    hash,
    limit: 50,
  };

  if (query) {
    params.nameStartsWith = query;
  }

  const cacheKey = getCharactersCacheKey(endpoint, query);

  // Usamos localStorage en el lado del cliente
  if (typeof window !== 'undefined' && window.localStorage) {
    const cachedData = window.localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed: CacheEntry<Character[]> = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRATION) {
          return parsed.data;
        }
      } catch {
        window.localStorage.removeItem(cacheKey);
      }
    }
  }

  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params });
    const characters: Character[] = response.data.data.results;

    // Guarda la respuesta en caché
    if (typeof window !== 'undefined' && window.localStorage) {
      const cacheEntry: CacheEntry<Character[]> = {
        timestamp: Date.now(),
        data: characters,
      };
      window.localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    }

    return characters;
  } catch {
    throw new Error('Error al obtener personajes');
  }
}

/**
 * fetchComicsByCharacter: Recupera la lista de cómics detallados para un personaje.
 * - characterId: el ID del personaje
 * - limit: número de cómics a traer (por defecto 20)
 * - orderBy: criterio de ordenación (por defecto "onsaleDate")
 * - Usa caché local para no repetir llamadas en 24 horas
 */
export async function fetchComicsByCharacter(
  characterId: number,
  limit = 20,
  orderBy = 'onsaleDate'
): Promise<Comic[]> {
  const endpoint = `public/characters/${characterId}/comics`;

  // Genera el timestamp y el hash de autenticación
  const ts = new Date().getTime().toString();
  const hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY);

  const params: Record<string, any> = {
    ts,
    apikey: PUBLIC_KEY,
    hash,
    limit,
    orderBy,
  };

  const cacheKey = getComicsCacheKey(characterId);

  if (typeof window !== 'undefined' && window.localStorage) {
    const cachedData = window.localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed: CacheEntry<Comic[]> = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRATION) {
          return parsed.data;
        }
      } catch {
        window.localStorage.removeItem(cacheKey);
      }
    }
  }

  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params });
    const comics: Comic[] = response.data.data.results;

    // Guarda la respuesta en caché
    if (typeof window !== 'undefined' && window.localStorage) {
      const cacheEntry: CacheEntry<Comic[]> = {
        timestamp: Date.now(),
        data: comics,
      };
      window.localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    }

    return comics;
  } catch {
    throw new Error('Error al obtener cómics del personaje');
  }
}
