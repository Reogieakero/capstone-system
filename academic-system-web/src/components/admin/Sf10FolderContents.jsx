'use client';

import { useCallback, useEffect, useState } from 'react';
import { IoDocumentTextOutline } from 'react-icons/io5';
import styles from './Sf10FolderContents.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Sf10FolderContents({ folder, onBack, onGetFiles, onGetSignedUrl }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingPath, setOpeningPath] = useState(null);
  const [error, setError] = useState(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await onGetFiles(folder.id);
      setFiles(result?.files || []);
    } catch (err) {
      setError(err?.message || 'Failed to load files.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [folder.id, onGetFiles]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleViewFile = async (filePath) => {
    setOpeningPath(filePath);
    try {
      const { signedUrl } = await onGetSignedUrl(filePath);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (_) {
    } finally {
      setOpeningPath(null);
    }
  };

  return (
    <div className={styles.container}>
      {loading && <div className={styles.emptyState}>Loading files...</div>}

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
