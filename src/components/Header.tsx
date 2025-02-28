import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

interface HeaderProps {
  favoritesCount: number;
  onShowFavorites: () => void;
  onResetHome?: () => void;
  logoAction?: ReactNode;
}

export function Header({ favoritesCount, onShowFavorites, onResetHome, logoAction }: HeaderProps) {
  const heartIcon = favoritesCount > 0 ? '/heart-icon-full.png' : '/heart-icon-empty.png';

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {logoAction ? (
          logoAction
        ) : (
          <Link href="/" className={styles.logoLink} onClick={onResetHome}>
            <Image
              src="/marvel-logo.png"
              alt="Marvel Logo"
              width={100}
              height={50}
              className={styles.logo}
            />
          </Link>
        )}

        <button
          aria-label="Show favorites"
          onClick={onShowFavorites}
          className={styles.headerFavoritesButton}
        >
          <Image src={heartIcon} alt="" width={20} height={20} aria-hidden="true" />
          <span className={styles.favoritesCount} aria-live="polite">
            {favoritesCount}
          </span>
        </button>
      </div>
    </header>
  );
}
