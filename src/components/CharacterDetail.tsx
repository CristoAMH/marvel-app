// src/components/CharacterDetail.tsx
import Image from 'next/image';
import { Character } from '@/services/api';
import HeartIconFull from './HeartIconFull';
import styles from './CharacterDetail.module.css';

interface CharacterDetailProps {
  character: Character;
  isFavorite: boolean;
  onToggleFavorite: (character: Character) => void;
}

export function CharacterDetail({ character, isFavorite, onToggleFavorite }: CharacterDetailProps) {
  return (
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
              onClick={() => onToggleFavorite(character)}
              aria-label={
                isFavorite
                  ? `Remove ${character.name} from favorites`
                  : `Add ${character.name} to favorites`
              }
            >
              <HeartIconFull width={24} height={24} filled={isFavorite} />
            </button>
          </div>

          <p className={styles.heroDescription}>
            {character.description || 'No description available'}
          </p>
        </div>
      </div>
    </section>
  );
}
