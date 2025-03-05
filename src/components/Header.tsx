import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import HeartIconFull from './HeartIconFull';

interface HeaderProps {
  favoritesCount: number;
  onShowFavorites: () => void;
  onResetHome?: () => void;
  children?: ReactNode;
}

export function Header({ favoritesCount, onShowFavorites, onResetHome, children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.logoLink} onClick={onResetHome}>
          <Image
            src="/marvel-logo.png"
            alt="Marvel Logo"
            width={130}
            height={52}
            className={styles.logo}
            priority
          />
        </Link>

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
