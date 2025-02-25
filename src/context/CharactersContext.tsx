'use client';

import { Character } from '@/services/api';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CharactersContextProps {
  charactersMap: { [key: number]: Character };
  setCharacter: (character: Character) => void;
}

const CharactersContext = createContext<CharactersContextProps | undefined>(undefined);

export const useCharacters = () => {
  const context = useContext(CharactersContext);
  if (!context) {
    throw new Error('useCharacters must be used within a CharactersProvider');
  }
  return context;
};

interface CharactersProviderProps {
  children: ReactNode;
  initialCharactersMap?: { [key: number]: Character };
}

export const CharactersProvider = ({
  children,
  initialCharactersMap = {},
}: CharactersProviderProps) => {
  const [charactersMap, setCharactersMap] = useState<{
    [key: number]: Character;
  }>(initialCharactersMap);

  const setCharacter = (character: Character) => {
    setCharactersMap(prev => ({ ...prev, [character.id]: character }));
  };

  return (
    <CharactersContext.Provider value={{ charactersMap, setCharacter }}>
      {children}
    </CharactersContext.Provider>
  );
};
