'use client';

import React, { useState } from 'react';
import { IoCloseOutline, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import styles from './VaultNotes.module.css';

export default function VaultNotes({ isOpen, onClose }) {
  const [notes, setNotes] = useState([
    { id: 1, text: 'Check missing SF10 for Grade 10-A', date: 'Mar 15' },
    { id: 2, text: 'Verify LRNs for new transferees', date: 'Mar 16' }
  ]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${!isOpen ? styles.fadeOut : ''}`} 
        onClick={onClose} 
      />

      {/* Notepad Panel */}
      <div 
        className={`${styles.notepadPanel} ${!isOpen ? styles.slideOut : styles.slideIn}`}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <IoCreateOutline size={20} className={styles.penIcon} />
            <h3>Vault Notes</h3>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <IoCloseOutline size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.inputArea}>
            <textarea placeholder="Write a quick reminder..." rows={3} />
            <button className={styles.addBtn}>Add Note</button>
          </div>

          <div className={styles.noteList}>
            {notes.map(note => (
              <div key={note.id} className={styles.noteItem}>
                <p>{note.text}</p>
                <div className={styles.noteFooter}>
                  <span>{note.date}</span>
                  <IoTrashOutline className={styles.deleteIcon} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}