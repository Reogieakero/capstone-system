'use client';

import { useState } from 'react';
import { IoListOutline } from 'react-icons/io5';
import FilterTabs from '../ui/FilterTabs';
import ActivityLog from './ActivityLog';
import ImportSf10Card from './ImportSf10Card';
import Sf10FolderGrid from './Sf10FolderGrid';
import VaultNotes from './VaultNotes';
import LoadingState from '../ui/LoadingState';
import styles from './Sf10Vault.module.css';

const GRADE_FILTERS = ['all', '7', '8', '9', '10', '11', '12'];

export default function Sf10Vault({ sections = [], pageLoading = false }) {
  const [activeGrade, setActiveGrade] = useState('all');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const handleImportFile = (file) => {
    console.log("Processing:", file.name);
  };

  const handleOpenNotes = () => {
    setShowNotesPanel(true);
    setIsNotesOpen(true);
  };

  const handleCloseNotes = () => {
    setIsNotesOpen(false);
    setTimeout(() => {
      setShowNotesPanel(false);
    }, 300);
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerActionArea}>
        <FilterTabs
          items={GRADE_FILTERS}
          activeValue={activeGrade}
          onChange={setActiveGrade}
          renderLabel={(grade) => (grade === 'all' ? 'All Grades' : `Grade ${grade}`)}
        />
        <button 
          className={styles.todoBtn} 
          onClick={handleOpenNotes}
        >
          <IoListOutline size={22} />
        </button>
      </div>

      <div className={styles.bodyRow}>
        <div className={styles.contentArea}>
          {pageLoading ? (
            <LoadingState size="md" label="Loading SF10 storage" />
          ) : (
            <Sf10FolderGrid
              activeGrade={activeGrade}
              sections={sections}
            />
          )}
        </div>

        <div className={styles.sidePanel}>
          <ImportSf10Card onImport={handleImportFile} />
          <ActivityLog />
        </div>
      </div>

      {showNotesPanel ? (
        <VaultNotes
          isOpen={isNotesOpen}
          onClose={handleCloseNotes}
        />
      ) : null}
    </section>
  );
}