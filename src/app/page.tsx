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
import styles from './page.module.css';

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

        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Image
              src="/search-icon.png"
              alt=""
              width={12}
              height={12}
              className={styles.searchIcon}
              aria-hidden="true"
            />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="SEARCH A CHARACTER"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Buscar personaje"
            />
          </div>
          <div className={styles.resultsCount} aria-live="polite" role="status">
            {displayedCharacters.length} RESULTS
          </div>
        </div>

        <div className={styles.grid} role="list">
          {displayedCharacters.map(char => {
            const fav = isFavorite(char.id);
            const heartIcon = fav ? '/heart-icon-full.png' : '/heart-icon-empty.png';

            return (
              <Link
                key={char.id}
                href={`/character/${char.id}`}
                className={styles.card}
                role="listitem"
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={`${char.thumbnail.path}.${char.thumbnail.extension}`}
                    alt={`Imagen de ${char.name}`}
                    fill
                    className={styles.characterImage}
                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                  />
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.characterName}>{char.name}</h2>
                  <button
                    className={styles.favoriteButton}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(char);
                    }}
                    aria-label={
                      fav ? `Remove ${char.name} from favorites` : `Add ${char.name} to favorites`
                    }
                  >
                    <Image src={heartIcon} alt="" width={12} height={12} aria-hidden="true" />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
