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
  const [isClient, setIsClient] = useState(false);

  // Cargar favoritos del localStorage solo después del montaje en el cliente
  useEffect(() => {
    setIsClient(true);
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        localStorage.removeItem('favorites');
      }
    }

    // Agregar escucha para sincronizar entre pestañas
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'favorites' && event.newValue) {
        try {
          setFavorites(JSON.parse(event.newValue));
        } catch (error) {
          console.error('Error parsing localStorage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  function toggleFavorite(character: Character) {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === character.id);
      const newFavorites = exists ? prev.filter(f => f.id !== character.id) : [...prev, character];

      // Solo guardar en localStorage si estamos en el cliente
      if (isClient) {
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
      }

      return newFavorites;
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
