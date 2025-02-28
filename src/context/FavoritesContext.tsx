'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Character } from '@/services/api';

interface FavoritesContextProps {
  favorites: Character[];
  toggleFavorite: (character: Character) => void;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Character[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(character: Character) {
    const exists = favorites.some(f => f.id === character.id);
    if (exists) {
      setFavorites(prev => prev.filter(f => f.id !== character.id));
    } else {
      setFavorites(prev => [...prev, character]);
    }
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
