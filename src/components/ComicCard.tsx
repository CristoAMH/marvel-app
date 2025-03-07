import Image from 'next/image';
import { Comic } from '@/services/api';
import styles from './ComicCard.module.css';

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  const year =
    new Date(comic.dates.find(d => d.type === 'onsaleDate')!.date).getFullYear() || 'N/A';

  return (
    <div className={styles.comicCard} role="listitem">
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
        <span className={styles.comicYear}>{year}</span>
      </div>
    </div>
  );
}
