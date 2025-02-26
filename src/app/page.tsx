'use client';

import { useEffect, useState } from 'react';
import { fetchCharacters, Character } from '@/services/api';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';

import { useCharacters } from '@/context/CharactersContext';

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Hook de contexto para guardar personajes en un diccionario (map)
  const { setCharacter } = useCharacters();

  const debouncedQuery = useDebounce(searchQuery, 300);

  const loadCharacters = async (query = '') => {
    try {
      const data = await fetchCharacters(query);
      setCharacters(data);

      // Guarda cada personaje en el contexto
      data.forEach(char => setCharacter(char));
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  // Cargar los 50 personajes iniciales al montar el componente
  useEffect(() => {
    loadCharacters();
  }, []);

  // Cargar personajes cuando el valor debounced cambie (al teclear)
  useEffect(() => {
    loadCharacters(debouncedQuery);
  }, [debouncedQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <header>
        <h1>Marvel Characters</h1>
        <div>
          <input
            type="text"
            placeholder="Buscar personaje..."
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Buscar personaje"
          />
        </div>
        <div>
          <span>Resultados: {characters.length}</span>
        </div>
      </header>
      <main>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {characters.map(char => (
            <li key={char.id} style={{ marginBottom: '1rem' }}>
              <Link
                href={`/character/${char.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div>
                  <img
                    src={`${char.thumbnail.path}.${char.thumbnail.extension}`}
                    alt={char.name}
                    style={{ width: '100px', height: 'auto' }}
                  />
                </div>
                <h2>{char.name}</h2>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
