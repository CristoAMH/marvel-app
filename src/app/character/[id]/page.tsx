'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Character, Comic, fetchCharacters, fetchComicsByCharacter } from '@/services/api';
import { useCharacters } from '@/context/CharactersContext';
import styles from './page.module.css';

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { charactersMap, setCharacter } = useCharacters();

  const [character, setLocalCharacter] = useState<Character | null>(null);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existingCharacter = charactersMap[+id];

    if (existingCharacter) {
      setLocalCharacter(existingCharacter);
      setLoading(false);
    } else {
      // No está en el contexto, pedimos la lista
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="Ir a la página principal">
          <Image
            src="/marvel-logo.png"
            alt="Marvel Logo"
            width={100}
            height={50}
            className={styles.logo}
          />
        </Link>
      </header>

      <main>
        <section className={styles.heroSection} aria-labelledby="character-name">
          <div className={styles.heroContent}>
            <div className={styles.heroImageWrapper}>
              <Image
                className={styles.heroImage}
                src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                alt={`Imagen de ${character.name}`}
                width={400}
                height={600}
                priority
              />
            </div>
            <div className={styles.heroInfo}>
              <h1 id="character-name">{character.name}</h1>
              <p>{character.description || 'Sin descripción disponible'}</p>
            </div>
          </div>
        </section>

        <section className={styles.comicsSection} aria-labelledby="comics-title">
          <h2 id="comics-title">COMICS</h2>
          <div className={styles.comicsList} role="list">
            {processedComics.map(comic => (
              <div key={comic.id} className={styles.comicCard} role="listitem">
                <div className={styles.comicImageWrapper}>
                  <Image
                    src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`}
                    alt={`Portada de ${comic.title}`}
                    width={300}
                    height={450}
                    className={styles.comicImage}
                  />
                </div>
                <div className={styles.comicInfo}>
                  <h3 className={styles.comicTitle}>{comic.title}</h3>
                  <span className={styles.comicYear}>{comic.year}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
