'use client';

import { IoDocumentTextOutline, IoFolderOutline } from 'react-icons/io5';
import styles from './Sf10FolderGrid.module.css';

function getRelativeDate(dateValue) {
  if (!dateValue) return 'No updates';

  const inputDate = new Date(dateValue);
  if (Number.isNaN(inputDate.getTime())) return 'No updates';

  const diffMs = Date.now() - inputDate.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < hour) {
    const mins = Math.max(1, Math.floor(diffMs / minute));
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  const weeks = Math.floor(diffMs / week);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

export default function Sf10FolderGrid({ activeGrade, pageLoading = false, sections = [] }) {
  const folders = (sections || []).map((section) => ({
    id: section.id,
    grade: String(section.grade_level ?? ''),
    sectionName: section.section_name || section.name || 'Unnamed Section',
    updated: getRelativeDate(section.updated_at || section.created_at),
  }));

  const filteredFolders =
    activeGrade === 'all'
      ? folders
      : folders.filter((folder) => folder.grade === activeGrade);

  if (pageLoading) {
    return (
      <div className={styles.emptyState}>
        <IoFolderOutline size={42} />
        <p>Loading sections...</p>
      </div>
    );
  }

  if (filteredFolders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <IoFolderOutline size={42} />
        <p>
          {activeGrade === 'all'
            ? 'No section folders found.'
            : `No folders found for Grade ${activeGrade}`}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {filteredFolders.map((folder) => (
        <div key={folder.id} className={styles.folderTile}>
          <div className={styles.fileWrapper}>
            <div className={styles.folderBack} />
            <div className={styles.paper1} />
            <div className={styles.paper2} />
            <div className={styles.paper3} />
            <div className={styles.folderFront}>
              <div className={styles.tileLabel}>
                <span className={styles.folderName}>
                  Grade {folder.grade} &ndash; {folder.sectionName}
                </span>
                <div className={styles.folderMeta}>
                  <IoDocumentTextOutline size={11} />
                  <span>{folder.updated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

