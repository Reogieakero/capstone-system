'use client';

import React, { useState } from 'react';
import { ChevronDown, RefreshCw, UserRound } from 'lucide-react'; 
import { showErrorToast, showSuccessToast } from '../../utils/sileoNotify';
import styles from './SectionManagement.module.css'; 
import InsertSectionModal from './InsertSectionModal';

export default function SectionManagement({ users = [], onCreateSection }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => { window.location.reload(); }, 120);
  };

  const initiateInsert = () => setShowInsertModal(true);

  const handleActualInsert = async (data) => {
    try {
      if (typeof onCreateSection !== 'function') {
        throw new Error('Section creation is not configured.');
      }

      await onCreateSection(data);
      showSuccessToast({
        title: 'Section Created',
        description: `${data.name} has been added successfully.`,
      });
      setShowInsertModal(false);
    } catch (error) {
      showErrorToast({
        title: 'Create Section Failed',
        description: error?.message || 'Unable to create section right now.',
      });
    }
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