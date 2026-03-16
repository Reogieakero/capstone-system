'use client';

import { useState } from 'react';
import FilterTabs from '../ui/FilterTabs';
import ActivityLog from './ActivityLog';
import ImportSf10Card from './ImportSf10Card';
import Sf10FolderGrid from './Sf10FolderGrid';

import styles from './Sf10Vault.module.css';

const GRADE_FILTERS = ['all', '7', '8', '9', '10', '11', '12'];

export default function Sf10Vault() {
  const [activeGrade, setActiveGrade] = useState('all');

  const handleImportFile = (file) => {
    console.log("Processing:", file.name);
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
      </div>

      <div className={styles.bodyRow}>
        <div className={styles.contentArea}>
          <Sf10FolderGrid activeGrade={activeGrade} />
        </div>

        <div className={styles.sidePanel}>
          <ImportSf10Card onImport={handleImportFile} />
          <ActivityLog />
        </div>
      </div>
    </section>
  );
}
