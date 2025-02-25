import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_MARVEL_API_BASE;
const API_KEY = process.env.NEXT_PUBLIC_MARVEL_API_KEY;

interface Thumbnail {
  path: string;
  extension: string;
}

export interface Character {
  id: number;
  name: string;
  description: string;
  thumbnail: Thumbnail;
  // Agrega otros campos según necesites
}

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

// Genera una clave de caché en base al endpoint y los parámetros usados
function getCacheKey(endpoint: string, params: Record<string, any> = {}) {
  const paramString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return `marvel_cache_${endpoint}_${paramString}`;
}

/**
 * fetchCharacters: Recupera un listado de personajes de Marvel.
 * - query: filtro de búsqueda (nombre que empiece con el valor dado).
 * - Utiliza caché local (localStorage) para no hacer llamadas continuas a la API.
 * - La caché se renueva cada 24 horas.
 */
export async function fetchCharacters(query = ""): Promise<Character[]> {
  const endpoint = "public/characters";
  const params = {
    apikey: API_KEY,
    nameStartsWith: query,
    limit: 50,
  };

  const cacheKey = getCacheKey(endpoint, params);

  // Solo usamos localStorage en el lado del cliente
  if (typeof window !== "undefined" && window.localStorage) {
    const cachedData = window.localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed: CacheEntry<Character[]> = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRATION) {
          return parsed.data;
        }
      } catch (error) {
        console.error("Error al parsear la caché:", error);
        window.localStorage.removeItem(cacheKey);
      }
    }
  }

  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { params });
    const characters: Character[] = response.data.data.results;

    // Guarda la respuesta en caché
    if (typeof window !== "undefined" && window.localStorage) {
      const cacheEntry: CacheEntry<Character[]> = {
        timestamp: Date.now(),
        data: characters,
      };
      window.localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    }

    return characters;
  } catch (error) {
    throw new Error("Error al obtener personajes", error);
  }
}
