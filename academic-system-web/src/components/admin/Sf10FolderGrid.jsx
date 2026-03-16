'use client';

import { IoDocumentTextOutline, IoFolderOutline } from 'react-icons/io5';
import styles from './Sf10FolderGrid.module.css';

const MOCK_FOLDERS = [
  { id: 1,  grade: '7',  section: 'Apollo',      count: 32, updated: '2 days ago' },
  { id: 2,  grade: '7',  section: 'Artemis',     count: 28, updated: '1 week ago' },
  { id: 3,  grade: '8',  section: 'Pythagoras',  count: 35, updated: '3 days ago' },
  { id: 4,  grade: '8',  section: 'Euclid',      count: 30, updated: '5 days ago' },
  { id: 5,  grade: '9',  section: 'Newton',      count: 27, updated: '1 day ago'  },
  { id: 6,  grade: '9',  section: 'Darwin',      count: 31, updated: '4 days ago' },
  { id: 7,  grade: '10', section: 'Einstein',    count: 29, updated: '2 weeks ago'},
  { id: 8,  grade: '10', section: 'Curie',       count: 33, updated: '1 day ago'  },
  { id: 9,  grade: '11', section: 'Tesla',       count: 25, updated: '3 days ago' },
  { id: 10, grade: '11', section: 'Edison',      count: 22, updated: '1 week ago' },
  { id: 11, grade: '12', section: 'Hawking',     count: 18, updated: '2 days ago' },
  { id: 12, grade: '12', section: 'Bohr',        count: 20, updated: '3 weeks ago'},
];

export default function Sf10FolderGrid({ activeGrade }) {
  const folders =
    activeGrade === 'all'
      ? MOCK_FOLDERS
      : MOCK_FOLDERS.filter((f) => f.grade === activeGrade);

  if (folders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <IoFolderOutline size={42} />
        <p>No folders found for Grade {activeGrade}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {folders.map((folder) => (
        <div key={folder.id} className={styles.folderTile}>
          <div className={styles.fileWrapper}>
            <div className={styles.folderBack} />
            <div className={styles.paper1} />
            <div className={styles.paper2} />
            <div className={styles.paper3} />
            <div className={styles.folderFront}>
              <div className={styles.tileLabel}>
                <span className={styles.folderName}>
                  Grade {folder.grade} &ndash; {folder.section}
                </span>
                <div className={styles.folderMeta}>
                  <IoDocumentTextOutline size={11} />
                  <span>{folder.count} files</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

