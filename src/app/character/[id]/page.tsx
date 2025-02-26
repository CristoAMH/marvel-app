'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Character, fetchCharacters } from '@/services/api';
import { useCharacters } from '@/context/CharactersContext';
import styles from './page.module.css';

export default function CharacterPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { charactersMap, setCharacter } = useCharacters();

  const [character, setLocalCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existing = charactersMap[+id];
    if (existing) {
      setLocalCharacter(existing);
      setLoading(false);
    } else {
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

  const comics = character.comics?.items
    ? [...character.comics.items].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 20)
    : [];

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
            {comics.map((comic, index) => (
              <div key={index} className={styles.comicCard} role="listitem">
                <div className={styles.comicImageWrapper}>
                  <Image
                    src={`/placeholder.svg?height=450&width=300&text=${encodeURIComponent(comic.name)}`}
                    alt={`Portada de ${comic.name}`}
                    width={300}
                    height={450}
                    className={styles.comicImage}
                  />
                </div>
                <div className={styles.comicInfo}>
                  <h3 className={styles.comicTitle}>{comic.name}</h3>
                  <span className={styles.comicYear}>1967</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
