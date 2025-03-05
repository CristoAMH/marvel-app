import { Comic } from '@/services/api';
import { ComicCard } from './ComicCard';
import styles from './ComicList.module.css';

interface ComicListProps {
  comics: Comic[];
}

export function ComicList({ comics }: ComicListProps) {
  return (
    <section className={styles.comicsSection} aria-labelledby="comics-title">
      <div className={styles.comicsLayout}>
        <h2 id="comics-title">COMICS</h2>
        <div className={styles.comicsList} role="list">
          {comics.map(comic => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      </div>
    </section>
  );
}
