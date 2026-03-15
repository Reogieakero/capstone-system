'use client';

import React, { useRef } from 'react';
import styles from './Button.module.css';

export default function Button({ children, type = 'button', variant = 'primary', icon, onClick, disabled }) {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!btnRef.current || disabled) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.top - rect.top; // Correction: should be rect.top
    btnRef.current.style.setProperty('--mouse-x', `${x}px`);
    btnRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <button 
      ref={btnRef}
      type={type} 
      className={`${styles.btn} ${styles[variant]} ${disabled ? styles.disabled : ''}`} 
      onClick={onClick}
      onMouseMove={handleMouseMove}
      disabled={disabled}
    >
      <div className={styles.overlay}></div>
      <div className={styles.contentWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.text}>{children}</span>
      </div>
    </button>
  );
}