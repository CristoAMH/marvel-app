'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const loadCharacterData = async () => {
      try {
        // Primero, intentar obtener el personaje del contexto
        const existingCharacter = charactersMap[+id];

        // Si no existe en el contexto, buscar en la lista completa
        const characterToSet =
          existingCharacter || (await fetchCharacters()).find(char => char.id === +id);

        if (!characterToSet) {
          router.push('/404');
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
        console.error('Error loading character data:', err);
        router.push('/404');
      }
    };

    // Simular progreso
    progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Iniciar carga de datos
    loadCharacterData();

    // Limpiar intervalos
    return () => {
      clearInterval(progressInterval);
    };
  }, [id, charactersMap, setCharacter, router]);

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

      {loading ? (
        <div className={styles.loadingOverlay}>
          <p>Loading character information...</p>
        </div>
      ) : (
        <main
          id="main-content"
          tabIndex={-1}
          className={`${styles.mainContent} ${isContentVisible ? styles.visible : ''}`}
        >
          {character && (
            <>
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

              <section className={styles.comicsSection} aria-labelledby="comics-title">
                <div className={styles.comicsLayout}>
                  <h2 id="comics-title">COMICS</h2>
                  <div className={styles.comicsList} role="list">
                    {comics.map(comic => (
                      <div key={comic.id} className={styles.comicCard} role="listitem">
                        <div className={styles.comicImageWrapper}>
                          <Image
                            src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                            alt={`Portada de ${comic.title}`}
                            width={180}
                            height={270}
                            className={styles.comicImage}
                            loading="lazy"
                            sizes="(max-width: 768px) 33vw, 180px"
                          />
                        </div>
                        <div className={styles.comicInfo}>
                          <h3 className={styles.comicTitle}>{comic.title}</h3>
                          <span className={styles.comicYear}>
                            {comic.dates.find(d => d.type === 'onsaleDate')
                              ? new Date(
                                  comic.dates.find(d => d.type === 'onsaleDate')!.date
                                ).getFullYear()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      )}
    </div>
  );
}
