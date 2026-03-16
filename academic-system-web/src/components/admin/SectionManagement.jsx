'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, RefreshCw, UserRound } from 'lucide-react'; 
import FloatingNotificationCard from '../ui/FloatingNotificationCard';
import InsertSectionModal from './InsertSectionModal';
import LoadingState from '../ui/LoadingState';
import styles from './SectionManagement.module.css'; 

export default function SectionManagement({ users = [], sections = [], onCreateSection, onRefresh, pageLoading }) {
  const [showAdviserCard, setShowAdviserCard] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const adviserData = useMemo(() => {
    const groupedByAdviser = sections.reduce((acc, section) => {
      const adviserId = section.adviser_id;
      if (!adviserId) {
        return acc;
      }

      if (!acc[adviserId]) {
        acc[adviserId] = {
          id: adviserId,
          primaryText: section.adviser_name || 'Unknown Adviser',
          tags: [],
        };
      }

      acc[adviserId].tags.push(section.name || `Grade ${section.grade_level} - ${section.section_name}`);
      return acc;
    }, {});

    return Object.values(groupedByAdviser);
  }, [sections]);

  return (
    <div className={styles.container}>
      <div className={styles.headerActionArea}>
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.advisorBtn} ${showAdviserCard ? styles.active : ''}`}
            onClick={() => setShowAdviserCard(!showAdviserCard)}
          >
            <UserRound size={16} strokeWidth={2.3} /> <span>Adviser</span>
          </button>
          
          <button className={styles.insertBtn} onClick={() => setShowInsertModal(true)}>
            <ChevronDown size={16} strokeWidth={2.5} /> <span>Insert</span>
          </button>

          <button 
            className={styles.refreshBtn} 
            onClick={handleRefresh} 
            disabled={isRefreshing || pageLoading}
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
        {pageLoading || isRefreshing ? (
          <LoadingState size="md" label="Refreshing sections" />
        ) : sections.length === 0 ? (
          <p className={styles.emptyText}>No sections created yet.</p>
        ) : (
          <p className={styles.emptyText}>{sections.length} Sections Active</p>
        )}
      </div>

      <FloatingNotificationCard 
        isOpen={showAdviserCard}
        onClose={() => setShowAdviserCard(false)}
        title="Section Advisers"
        data={adviserData}
      />

      <InsertSectionModal 
        isOpen={showInsertModal} 
        onClose={() => setShowInsertModal(false)}
        onConfirm={onCreateSection}
        teachers={users.filter(u => u.role === 'teacher')}
      />
    </div>
  );
}