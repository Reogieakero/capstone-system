'use client';

import React from 'react';
import { UserRound, X } from 'lucide-react';
import styles from './FloatingNotificationCard.module.css';

export default function FloatingNotificationCard({ 
  isOpen, 
  onClose, 
  title = "Information", 
  data = [], 
  emptyMessage = "No records found." 
}) {
  return (
    <div className={`${styles.notifyContainer} ${isOpen ? styles.visible : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}><UserRound size={14} /></div>
          <span>{title}</span>
        </div>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
          <X size={14} />
        </button>
      </div>
      
      <div className={styles.body}>
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div key={item.id || idx} className={styles.item}>
              <div className={styles.contentWrapper}>
                <span className={styles.itemName}>{item.primaryText}</span>
                <div className={styles.badgeContainer}>
                  {item.tags?.map((tag, i) => (
                    <span key={i} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.empty}>{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}