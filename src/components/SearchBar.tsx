import { ChangeEvent } from 'react';
import Image from 'next/image';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
}

export function SearchBar({ searchQuery, onSearchChange, resultsCount }: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <Image
          src="/search-icon.png"
          alt=""
          width={12}
          height={12}
          className={styles.searchIcon}
          aria-hidden="true"
        />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="SEARCH A CHARACTER"
          value={searchQuery}
          onChange={handleChange}
          aria-label="SEARCH A CHARACTER"
        />
      </div>
      <div className={styles.resultsCount} aria-live="polite" role="status">
        {resultsCount} RESULTS
      </div>
    </div>
  );
}
