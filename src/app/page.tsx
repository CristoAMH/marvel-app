'use client';

import { useEffect, useState } from 'react';
import { fetchCharacters, Character } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { useCharacters } from '@/context/CharactersContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useUI } from '@/context/UIContext';
import { SkipLink } from '@/components/SkipLink';
import { CharacterCard } from '@/components/CharacterCard';
import styles from './page.module.css';
import { SearchBar } from '@/components/SearchBar';

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

  const baseList = showFavorites ? favorites : characters;

  const displayedCharacters = baseList.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Skip Link para accesibilidad */}
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link
            href="/"
            className={styles.logoLink}
            onClick={() => {
              setShowFavorites(false);
              setSearchQuery('');
            }}
          >
            <Image
              src="/marvel-logo.png"
              alt="Marvel Logo"
              width={100}
              height={50}
              className={styles.logo}
            />
          </Link>

          <button
            aria-label="Show favorites"
            onClick={() => setShowFavorites(true)}
            className={styles.headerFavoritesButton}
          >
            <Image src="/heart-icon-full.png" alt="Favoritos" width={20} height={20} />
            <span className={styles.favoritesCount} aria-live="polite">
              {favorites.length}
            </span>
          </button>
        </div>
      </header>

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
