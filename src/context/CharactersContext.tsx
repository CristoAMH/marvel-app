'use client'; // Para que el contexto sea usable en componentes Client

import { createContext, useContext, useState } from 'react';
import { Character } from '@/services/api';

interface CharactersMap {
  [id: number]: Character; // Diccionario id -> Character
}

interface CharactersContextProps {
  charactersMap: CharactersMap;
  setCharacter: (character: Character) => void;
}

const CharactersContext = createContext<CharactersContextProps | undefined>(undefined);

export function CharactersProvider({ children }: { children: React.ReactNode }) {
  const [charactersMap, setCharactersMap] = useState<CharactersMap>({});

  // Función para agregar o actualizar un personaje en el map
  const setCharacter = (character: Character) => {
    setCharactersMap(prev => ({ ...prev, [character.id]: character }));
  };

  return (
    <CharactersContext.Provider value={{ charactersMap, setCharacter }}>
      {children}
    </CharactersContext.Provider>
  );
}

export function useCharacters() {
  const context = useContext(CharactersContext);
  if (!context) {
    throw new Error('useCharacters must be used within a CharactersProvider');
  }
  return context;
}
