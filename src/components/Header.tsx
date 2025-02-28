import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import HeartIconFull from './HeartIconFull';

interface HeaderProps {
  favoritesCount: number;
  onShowFavorites: () => void;
  onResetHome?: () => void;
  logoAction?: ReactNode;
  children?: ReactNode;
}

export function Header({
  favoritesCount,
  onShowFavorites,
  onResetHome,
  logoAction,
  children,
}: HeaderProps) {
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
          <HeartIconFull width={20} height={20} filled={true} />
          <span className={styles.favoritesCount} aria-live="polite">
            {favoritesCount}
          </span>
        </button>
      </div>
      {children}
    </header>
  );
}
