'use client';

import { IoDocumentTextOutline } from 'react-icons/io5';
import useSf10FolderContents from '../../hooks/useSf10FolderContents';
import LoadingState from '../ui/LoadingState';
import styles from './Sf10FolderContents.module.css';

export default function Sf10FolderContents({ folder, onBack, onGetFiles, onGetSignedUrl }) {
  const {
    error,
    files,
    formatDate,
    handleViewFile,
    loading,
    openingPath,
  } = useSf10FolderContents({
    folderId: folder?.id,
    onGetFiles,
    onGetSignedUrl,
  });

  return (
    <div className={styles.container}>
      {loading && <LoadingState size="md" label="Loading files" />}

      {!loading && error && <div className={styles.emptyState}>{error}</div>}

      {!loading && !error && files.length === 0 && (
        <div className={styles.emptyState}>
          <IoDocumentTextOutline size={36} />
          <p>No files in this folder yet.</p>
        </div>
      )}

      {!loading && !error && files.length > 0 && (
        <div className={styles.grid}>
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              className={styles.folderTile}
              onClick={() => handleViewFile(file.path)}
              disabled={openingPath === file.path}
            >
              <div className={styles.fileWrapper}>
                <div className={styles.folderBack} />
                <div className={styles.paper1} />
                <div className={styles.paper2} />
                <div className={styles.paper3} />
                <div className={styles.folderFront}>
                  <div className={styles.tileLabel}>
                    <span className={styles.folderName}>
                      {file.learnerName || file.name}
                    </span>
                    <div className={styles.folderMeta}>
                      <IoDocumentTextOutline size={11} />
                      <span>{openingPath === file.path ? 'Opening…' : formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
