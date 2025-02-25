'use client';

import { useEffect, useState } from 'react';
import { fetchCharacters, Character } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { useCharacters } from '@/context/CharactersContext';
import styles from './page.module.css';

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { setCharacter } = useCharacters();
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/marvel-logo.png"
              alt="Marvel Logo"
              width={100}
              height={50}
              className={styles.logo}
            />
          </Link>
        </div>
      </header>

      <main className={styles.main}>
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
          <div className={styles.resultsCount}>{characters.length} RESULTS</div>
        </div>

        <div className={styles.grid}>
          {characters.map(char => (
            <Link key={char.id} href={`/character/${char.id}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={`${char.thumbnail.path}.${char.thumbnail.extension}`}
                  alt={char.name}
                  fill
                  className={styles.characterImage}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.characterName}>{char.name}</h2>
                <button
                  className={styles.favoriteButton}
                  onClick={e => {
                    e.preventDefault();
                    // Aquí iría la lógica de favoritos
                  }}
                  aria-label={`Añadir ${char.name} a favoritos`}
                >
                  <Image
                    src="/heart-icon-full.png"
                    alt="Favorito"
                    width={12}
                    height={12}
                    className={styles.favoriteIcon}
                  />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
