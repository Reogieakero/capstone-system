'use client';

import { useState } from 'react';
import FilterTabs from '../ui/FilterTabs';
import ImportSf10Card from './ImportSf10Card';
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

      <div className={styles.topActionRow}>
        <ImportSf10Card onImport={handleImportFile} />
      </div>

      <div className={styles.content}>
      </div>
    </section>
  );
}