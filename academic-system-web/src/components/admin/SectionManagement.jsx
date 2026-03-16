'use client';

import React, { useState } from 'react';
import { ChevronDown, RefreshCw, UserRound } from 'lucide-react'; 
import styles from './SectionManagement.module.css'; 
import InsertSectionModal from './InsertSectionModal';

export default function SectionManagement({ users = [] }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => { window.location.reload(); }, 120);
  };

  const initiateInsert = () => setShowInsertModal(true);

  const handleActualInsert = (data) => {
    console.log("New Section Data:", data);
    setShowInsertModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerActionArea}>
        <div className={styles.actionButtons}>
          <button type="button" className={styles.advisorBtn}>
            <UserRound size={16} strokeWidth={2.3} />
            <span>Advisor</span>
          </button>

          <button type="button" className={styles.insertBtn} onClick={initiateInsert}>
            <ChevronDown size={16} strokeWidth={2.5} />
            <span>Insert</span>
          </button>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh"
          >
            <RefreshCw size={15} strokeWidth={2.3} className={isRefreshing ? styles.refreshIconSpinning : ''} />
          </button>
        </div>
      </div>

      <div className={styles.contentCard}>
        <p className={styles.emptyText}>No sections created yet.</p>
      </div>

      <InsertSectionModal 
        isOpen={showInsertModal} 
        onClose={() => setShowInsertModal(false)}
        onConfirm={handleActualInsert}
        teachers={users.filter((user) => user.role === 'teacher')}
      />
    </div>
  );  
}