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

  useEffect(() => {
    const existingCharacter = charactersMap[+id];
    if (existingCharacter) {
      setLocalCharacter(existingCharacter);
      setLoading(false);
    } else {
      // No está en el contexto, pedimos la lista completa
      fetchCharacters()
        .then(list => {
          const found = list.find(char => char.id === +id);
          if (!found) {
            router.push('/404');
            return;
          }
          setCharacter(found);
          setLocalCharacter(found);
        })
        .catch(err => {
          console.error('Error fetching character detail:', err);
          router.push('/404');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, charactersMap, setCharacter, router]);

  useEffect(() => {
    if (character) {
      fetchComicsByCharacter(character.id, 20, 'onsaleDate')
        .then(data => setComics(data))
        .catch(err => console.error('Error fetching comics:', err));
    }
  }, [character]);

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="alert" aria-busy="true">
        <div className={styles.loadingSpinner} aria-hidden="true" />
        <p>Cargando personaje...</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className={styles.errorContainer} role="alert">
        No se encontró el personaje.
      </div>
    );
  }

  // Corazón del header depende del total de favoritos
  const totalFav = favorites.length;

  // Ver si el personaje actual está en favoritos
  const fav = isFavorite(character.id);
  // Ícono para el botón de favorito del personaje
  const charHeartIcon = fav ? '/heart-icon-full.png' : '/heart-icon-empty.png';

  // Procesar los cómics
  const processedComics = comics.map(comic => {
    const onsaleDate = comic.dates.find(d => d.type === 'onsaleDate');
    let year = '';
    if (onsaleDate) {
      year = new Date(onsaleDate.date).getFullYear().toString();
    }
    return {
      id: comic.id,
      title: comic.title,
      year,
      thumbnail: comic.thumbnail,
    };
  });

  const handleShowFavorites = () => {
    setShowFavorites(true);
    router.push('/');
  };

  const logoComponent = (
    <button
      className={styles.logoLink}
      aria-label="Ir a la página principal"
      onClick={() => router.push('/')}
    >
      <Image
        src="/marvel-logo.png"
        alt="Marvel Logo"
        width={100}
        height={50}
        className={styles.logo}
      />
    </button>
  );

  return (
    <div className={styles.container}>
      {/* Skip Link para accesibilidad */}
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>

      <Header
        favoritesCount={totalFav}
        onShowFavorites={handleShowFavorites}
        logoAction={logoComponent}
      />

      <main id="main-content" tabIndex={-1}>
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
                    fav
                      ? `Remove ${character.name} from favorites`
                      : `Add ${character.name} to favorites`
                  }
                >
                  <Image src={charHeartIcon} alt="" width={24} height={24} aria-hidden="true" />
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
              {processedComics.map(comic => (
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
                    <span className={styles.comicYear}>{comic.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
