import React from 'react';
import styles from './HeartIconFull.module.css';

interface HeartIconProps {
  filled: boolean;
  width?: number;
  height?: number;
  className?: string;
  forceWhite?: boolean;
}

export default function HeartIconFull({
  filled,
  width = 12,
  height = 12,
  className = '',
  forceWhite = false,
}: HeartIconProps) {
  const baseClass = styles.heartIcon;
  const fillClass = filled ? styles.heartFilled : styles.heartEmpty;
  const whiteClass = forceWhite ? styles.heartWhite : '';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={`${baseClass} ${fillClass} ${whiteClass} ${className}`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.63869L6 -0.00292969L0 3.63869V11.4422L12 21.6734L24 11.4422V3.63869L18 -0.00292969L12 3.63869Z"
      />
    </svg>
  );
}
