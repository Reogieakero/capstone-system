'use client';

import styles from './LoadingState.module.css';

export default function LoadingState({
  fullScreen = false,
  size = 'md',
  label = 'Loading...',
  className = '',
}) {
  const containerClassName = fullScreen ? styles.fullScreen : styles.inline;
  const sizeClassName = styles[size] || styles.md;

  return (
    <div className={`${containerClassName} ${className}`.trim()} role="status" aria-live="polite">
      <div className={`${styles.loader} ${sizeClassName}`} aria-hidden="true">
        <div className={`${styles.loaderSquare} ${styles.square1}`} />
        <div className={`${styles.loaderSquare} ${styles.square2}`} />
        <div className={`${styles.loaderSquare} ${styles.square3}`} />
        <div className={`${styles.loaderSquare} ${styles.square4}`} />
        <div className={`${styles.loaderSquare} ${styles.square5}`} />
      </div>
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}
