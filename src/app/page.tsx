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

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { showFavorites, setShowFavorites } = useUI();

  const { setCharacter } = useCharacters();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const debouncedQuery = useDebounce(searchQuery, 300);

  const loadCharacters = async (query = '') => {
    try {
      const data = await fetchCharacters(query);
      setCharacters(data);
      data.forEach(char => setCharacter(char));
    } catch (error) {
      console.error('Error fetching characters:', error);
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
        />

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
      </main>
    </div>
  );
}
