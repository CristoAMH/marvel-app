'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Character, Comic, fetchCharacters, fetchComicsByCharacter } from '@/services/api';
import { useCharacters } from '@/context/CharactersContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useUI } from '@/context/UIContext';
import { SkipLink } from '@/components/SkipLink';
import styles from './page.module.css';
import { Header } from '@/components/Header';
import HeartIconFull from '@/components/HeartIconFull';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ComicList } from '@/components/ComicList';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const { setShowFavorites } = useUI();
  const { charactersMap, setCharacter } = useCharacters();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [character, setLocalCharacter] = useState<Character | null>(null);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  // Referencia para el progreso del intervalo para evitar problemas de hidratación
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicialización segura de los intervalos de tiempo
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadCharacterData = async () => {
      try {
        // Primero, intentar obtener el personaje del contexto
        const existingCharacter = charactersMap[+id];

        // Si no existe en el contexto, buscar en la lista completa
        const characterToSet =
          existingCharacter || (await fetchCharacters()).find(char => char.id === +id);

        if (!characterToSet) {
          handleError('Character not found');
          return;
        }

        if (!existingCharacter) {
          setCharacter(characterToSet);
        }
        setLocalCharacter(characterToSet);

        const loadedComics = await fetchComicsByCharacter(characterToSet.id, 20, 'onsaleDate');
        setComics(loadedComics);

        setLoading(false);
        setLoadingProgress(100);

        setIsContentVisible(true);
      } catch (err) {
        handleError(err);
      }
    };

    loadCharacterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, charactersMap]);

  const totalFav = favorites.length;

  const handleShowFavorites = () => {
    setShowFavorites(true);
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <SkipLink href="#main-content">Skip to the main content</SkipLink>

      <Header favoritesCount={totalFav} onShowFavorites={handleShowFavorites}>
        {loading && (
          <div
            className={styles.progressBar}
            style={{
              width: `${loadingProgress}%`,
              transition: 'width 0.2s ease-out',
            }}
          />
        )}
      </Header>

      {error.hasError && (
        <div className={styles.errorContainer} role="alert">
          <h2>Error</h2>
          <p>{error.message}</p>
          <button
            className={styles.errorButton}
            onClick={() => {
              clearError();
              router.push('/');
            }}
          >
            Return to home
          </button>
        </div>
      )}

      {loading && !error.hasError && <LoadingOverlay message="Loading character information..." />}

      {!loading && !error.hasError && character && (
        <main
          id="main-content"
          tabIndex={-1}
          className={`${styles.mainContent} ${isContentVisible ? styles.visible : ''}`}
        >
          <section className={styles.heroSection} aria-labelledby="character-name">
            <div className={styles.heroContent}>
              <div className={styles.heroImageWrapper}>
                <Image
                  className={styles.heroImage}
                  src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                  alt={`Imagen de ${character.name}`}
                  width={320}
                  height={320}
                  priority
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>

              <div className={styles.heroInfo}>
                <div className={styles.titleRow}>
                  <h1 id="character-name" className={styles.heroName}>
                    {character.name}
                  </h1>
                  <button
                    className={styles.characterFavoriteButton}
                    onClick={() => toggleFavorite(character)}
                    aria-label={
                      isFavorite(character.id)
                        ? `Remove ${character.name} from favorites`
                        : `Add ${character.name} to favorites`
                    }
                  >
                    <HeartIconFull width={24} height={24} filled={isFavorite(character.id)} />
                  </button>
                </div>

                <p className={styles.heroDescription}>
                  {character.description || 'No description available'}
                </p>
              </div>
            </div>
          </section>

          <ComicList comics={comics} />
        </main>
      )}
    </div>
  );
}
