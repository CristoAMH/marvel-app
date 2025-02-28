'use client';

import { useEffect, useState } from 'react';
import { fetchCharacters, Character } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { useCharacters } from '@/context/CharactersContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useUI } from '@/context/UIContext'; // << Nuevo
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
            <span className={styles.favoritesCount}>{favorites.length}</span>
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {showFavorites && <h2 className={styles.favoritesHeading}>FAVORITES</h2>}

        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Image
              src="/search-icon.png"
              alt="Search"
              width={12}
              height={12}
              className={styles.searchIcon}
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
          <div className={styles.resultsCount}>{displayedCharacters.length} RESULTS</div>
        </div>

        <div className={styles.grid}>
          {displayedCharacters.map(char => {
            const fav = isFavorite(char.id);
            const heartIcon = fav ? '/heart-icon-full.png' : '/heart-icon-empty.png';

            return (
              <Link key={char.id} href={`/character/${char.id}`} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={`${char.thumbnail.path}.${char.thumbnail.extension}`}
                    alt={char.name}
                    fill
                    className={styles.characterImage}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h2 className={styles.characterName}>{char.name}</h2>
                  <button
                    className={styles.favoriteButton}
                    onClick={e => {
                      e.preventDefault();
                      toggleFavorite(char);
                    }}
                    aria-label={
                      fav ? `Remove ${char.name} from favorites` : `Add ${char.name} to favorites`
                    }
                  >
                    <Image src={heartIcon} alt="Favorito" width={12} height={12} />
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
