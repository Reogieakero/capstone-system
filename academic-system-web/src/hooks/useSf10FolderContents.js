import { useCallback, useEffect, useState } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function useSf10FolderContents({ folderId, onGetFiles, onGetSignedUrl }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingPath, setOpeningPath] = useState(null);
  const [error, setError] = useState(null);

  const loadFiles = useCallback(async () => {
    if (!folderId) {
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await onGetFiles(folderId);
      setFiles(result?.files || []);
    } catch (err) {
      setError(err?.message || 'Failed to load files.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [folderId, onGetFiles]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleViewFile = useCallback(async (filePath) => {
    setOpeningPath(filePath);
    try {
      const { signedUrl } = await onGetSignedUrl(filePath);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (_) {
    } finally {
      setOpeningPath(null);
    }
  }, [onGetSignedUrl]);

  return {
    error,
    files,
    formatDate,
    handleViewFile,
    loading,
    openingPath,
  };
}
