'use client';

import { useEffect, useState } from 'react';
import { fetchCharacters, Character } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useCharacters } from '@/context/CharactersContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useUI } from '@/context/UIContext';
import { SkipLink } from '@/components/SkipLink';
import { CharacterCard } from '@/components/CharacterCard';
import styles from './page.module.css';
import { SearchBar } from '@/components/SearchBar';
import { Header } from '@/components/Header';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { showFavorites, setShowFavorites } = useUI();
  const { setCharacter } = useCharacters();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { error, handleError, clearError } = useErrorHandler();

  const debouncedQuery = useDebounce(searchQuery, 300);

  const loadCharacters = async (query = '') => {
    setIsLoading(true);
    try {
      const data = await fetchCharacters(query);
      setCharacters(data);
      data.forEach(char => setCharacter(char));
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    loadCharacters(debouncedQuery);
  }, [debouncedQuery]);

  const handleResetHome = () => {
    setShowFavorites(false);
    setSearchQuery('');
    clearError();
  };

  const baseList = showFavorites ? favorites : characters;

  const displayedCharacters = baseList.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Skip Link para accesibilidad */}
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>

      <Header
        favoritesCount={favorites.length}
        onShowFavorites={() => setShowFavorites(true)}
        onResetHome={handleResetHome}
      />
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {showFavorites && <h1 className={styles.favoritesHeading}>FAVORITES</h1>}
        {!showFavorites && <h1 className={styles.srOnly}>Marvel Characters</h1>}

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultsCount={displayedCharacters.length}
          isLoading={isLoading}
        />

        {error.hasError && (
          <ErrorMessage
            message={error.message}
            onRetry={() => {
              clearError();
              loadCharacters(debouncedQuery);
            }}
          />
        )}

        <div className={styles.grid} role="list">
          {displayedCharacters.map(char => (
            <CharacterCard
              key={char.id}
              character={char}
              isFavorite={isFavorite(char.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {!isLoading && displayedCharacters.length === 0 && !error.hasError && (
          <div className={styles.noResults}>
            <p>No characters found. Try a different search term.</p>
          </div>
        )}
      </main>
    </div>
  );
}
