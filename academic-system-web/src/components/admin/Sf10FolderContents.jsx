'use client';

import { useState, useCallback, useEffect } from 'react';
import { IoDocumentTextOutline, IoCloseOutline, IoOpenOutline } from 'react-icons/io5';
import useSf10FolderContents from '../../hooks/useSf10FolderContents';
import LoadingState from '../ui/LoadingState';
import styles from './Sf10FolderContents.module.css';

export default function Sf10FolderContents({ folder, onBack, onGetFiles, onGetSignedUrl }) {
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const {
    error,
    files,
    formatDate,
    loading,
    openingPath,
  } = useSf10FolderContents({
    folderId: folder?.id,
    onGetFiles,
    onGetSignedUrl,
  });

  const handleOpenPreview = useCallback(async (file) => {
    setPreview(null);
    setPreviewLoading(true);
    try {
      const { signedUrl } = await onGetSignedUrl(file.path);
      const name = file.learnerName || file.name;
      const isExcel = /\.(xlsx|xls|xlsm)$/i.test(file.path || file.name || '');

      if (isExcel) {
        // Convert xlsx → pdf via Express backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        // Extract Supabase access token from localStorage
        const sbKey = Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
        const sbSession = sbKey ? JSON.parse(localStorage.getItem(sbKey) || '{}') : {};
        const token = sbSession?.access_token ?? '';

        const res = await fetch(`${backendUrl}/api/admin/convert-to-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url: signedUrl }),
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Conversion failed');

        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        setPreview({ url: objectUrl, rawUrl: signedUrl, name, isExcel: false });
      } else {
        // PDF — fetch as blob to bypass Content-Disposition: attachment
        const response = await fetch(signedUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setPreview({ url: objectUrl, rawUrl: signedUrl, name, isExcel: false });
      }
    } catch {
      setPreview({ url: null, rawUrl: null, name: file.learnerName || file.name, isExcel: false });
    } finally {
      setPreviewLoading(false);
    }
  }, [onGetSignedUrl]);

  const handleClosePreview = useCallback(() => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setPreviewLoading(false);
  }, [preview]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClosePreview(); };
    if (preview || previewLoading) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview, previewLoading, handleClosePreview]);

  const isPreviewOpen = previewLoading || !!preview;

  return (
    <div className={styles.container}>

      {/* ── File grid ── */}
      {loading && <LoadingState size="md" label="Loading files" />}

      {!loading && error && (
        <div className={styles.emptyState}>{error}</div>
      )}

      {!loading && !error && files.length === 0 && (
        <div className={styles.emptyState}>
          <IoDocumentTextOutline size={36} />
          <p>No files in this folder yet.</p>
        </div>
      )}

      {!loading && !error && files.length > 0 && (
        <div className={styles.grid}>
          {files.map((file) => {
            const fileName = file.learnerName || file.name;
            const isActive = preview?.name === fileName || (previewLoading && openingPath === file.path);
            return (
              <button
                key={file.path}
                type="button"
                className={`${styles.folderTile} ${isActive ? styles.folderTileActive : ''}`}
                onClick={() => handleOpenPreview(file)}
                disabled={previewLoading}
              >
                <div className={styles.fileWrapper}>
                  <div className={styles.folderBack} />
                  <div className={styles.paper1} />
                  <div className={styles.paper2} />
                  <div className={styles.paper3} />
                  <div className={styles.folderFront}>
                    <div className={styles.tileLabel}>
                      <span className={styles.folderName}>{fileName}</span>
                      <div className={styles.folderMeta}>
                        <IoDocumentTextOutline size={11} />
                        <span>{isActive && previewLoading ? 'Opening…' : formatDate(file.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Full-screen overlay viewer ── */}
      {isPreviewOpen && (
        <div className={styles.overlay} onClick={handleClosePreview}>
          <div className={styles.overlayPanel} onClick={(e) => e.stopPropagation()}>

            <div className={styles.overlayHeader}>
              <span className={styles.overlayTitle}>
                <IoDocumentTextOutline size={14} />
                {preview?.name ?? 'Opening…'}
              </span>
              <div className={styles.overlayActions}>
                {preview?.rawUrl && (
                  <a
                    href={preview.rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.overlayIconBtn}
                    title="Open in new tab"
                  >
                    <IoOpenOutline size={16} />
                  </a>
                )}
                <button
                  type="button"
                  className={styles.overlayIconBtn}
                  onClick={handleClosePreview}
                  title="Close (Esc)"
                >
                  <IoCloseOutline size={18} />
                </button>
              </div>
            </div>

            <div className={styles.overlayBody}>
              {previewLoading && (
                <LoadingState size="md" label="Opening file" />
              )}
              {!previewLoading && preview?.url && (
                <iframe
                  src={preview.url}
                  className={styles.overlayIframe}
                  title={preview.name}
                />
              )}
              {!previewLoading && preview && !preview.url && (
                <div className={styles.overlayError}>
                  <IoDocumentTextOutline size={36} />
                  <p>Could not load this file.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}