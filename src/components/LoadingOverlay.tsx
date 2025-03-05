import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className={styles.loadingOverlay}>
      <p>{message}</p>
    </div>
  );
}
