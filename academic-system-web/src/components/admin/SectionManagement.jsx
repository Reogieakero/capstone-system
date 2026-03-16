'use client';

import React, { useState } from 'react';
import { ChevronDown, RefreshCw, UserRound } from 'lucide-react'; 
import styles from './SectionManagement.module.css'; 

export default function SectionManagement() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);

    window.setTimeout(() => {
      window.location.reload();
    }, 120);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerActionArea}>
        <div className={styles.actionButtons}>
          <button type="button" className={styles.advisorBtn}>
            <UserRound size={16} strokeWidth={2.3} />
            <span>Advisor</span>
          </button>

          <button type="button" className={styles.insertBtn}>
            <ChevronDown size={16} strokeWidth={2.5} />
            <span>Insert</span>
          </button>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
            aria-label="Refresh section page"
            title="Refresh"
          >
            <RefreshCw
              size={15}
              strokeWidth={2.3}
              className={isRefreshing ? styles.refreshIconSpinning : ''}
            />
          </button>
        </div>
      </div>

      <div className={styles.contentCard}>
        <p className={styles.emptyText}>No sections created yet.</p>
      </div>
    </div>
  );
}