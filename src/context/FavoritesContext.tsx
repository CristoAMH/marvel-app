'use client';

import React, { createContext, useContext } from 'react';
import { Character } from '@/services/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FavoritesContextProps {
  favorites: Character[];
  toggleFavorite: (character: Character) => void;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Usar nuestro custom hook para manejar el state y la sincronización con localStorage
  const [favorites, setFavorites] = useLocalStorage<Character[]>('favorites', []);

  function toggleFavorite(character: Character) {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === character.id);
      if (exists) {
        return prev.filter(f => f.id !== character.id);
      } else {
        return [...prev, character];
      }
    });
  }

  function isFavorite(id: number) {
    return favorites.some(f => f.id === id);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
