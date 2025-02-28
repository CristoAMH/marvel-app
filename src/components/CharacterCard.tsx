import { Character } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CharacterCard.module.css';

interface CharacterCardProps {
  character: Character;
  isFavorite: boolean;
  onToggleFavorite: (character: Character) => void;
}

export function CharacterCard({ character, isFavorite, onToggleFavorite }: CharacterCardProps) {
  const heartIcon = isFavorite ? '/heart-icon-full.png' : '/heart-icon-empty.png';

  return (
    <Link href={`/character/${character.id}`} className={styles.card} role="listitem">
      <div className={styles.imageWrapper}>
        <Image
          src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
          alt={`Imagen de ${character.name}`}
          fill
          className={styles.characterImage}
          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
        />
      </div>
      <div className={styles.cardContent}>
        <h2 className={styles.characterName}>{character.name}</h2>
        <button
          className={styles.favoriteButton}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(character);
          }}
          aria-label={
            isFavorite
              ? `Remove ${character.name} from favorites`
              : `Add ${character.name} to favorites`
          }
        >
          <Image src={heartIcon} alt="" width={12} height={12} aria-hidden="true" />
        </button>
      </div>
    </Link>
  );
}
