'use client';

import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <IoClose size={24} />
          </button>
        </header>
        <div className={styles.content}>
          {children}
        </div>
        <footer className={styles.footer}>
          <button className={styles.doneBtn} onClick={onClose}>I Understand</button>
        </footer>
      </div>
    </div>
  );
}