import { useCallback, useEffect, useMemo, useState } from 'react';
import { showErrorToast, showSuccessToast } from '../utils/sileoNotify';

export default function useSf10Vault({ onImportSf10, onFolderSelect, selectedFolderExternal = null }) {
  const [activeGrade, setActiveGrade] = useState('all');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [isManualUploading, setIsManualUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const selectedGradeLabel = useMemo(() => {
    return activeGrade === 'all' ? 'All Grades' : `Grade ${activeGrade}`;
  }, [activeGrade]);

  const openFolder = useCallback((folder) => {
    setSelectedFolder(folder);
    onFolderSelect?.(folder);
  }, [onFolderSelect]);

  const closeFolder = useCallback(() => {
    setSelectedFolder(null);
    onFolderSelect?.(null);
  }, [onFolderSelect]);

  useEffect(() => {
    if (!selectedFolderExternal && selectedFolder) {
      setSelectedFolder(null);
    }
  }, [selectedFolderExternal, selectedFolder]);

  const closeRoutingModal = useCallback(() => {
    if (isManualUploading) {
      return;
    }

    setPendingFile(null);
    setIsRoutingModalOpen(false);
  }, [isManualUploading]);

  const handleImportFile = useCallback(async (file) => {
    if (!onImportSf10) {
      showErrorToast({
        title: 'Upload handler unavailable',
        description: 'Unable to process SF10 upload at the moment.',
      });
      return;
    }

    try {
      const result = await onImportSf10(file);
      const detectedGrade = result?.detection?.gradeLevel;
      const detectedSection = result?.section?.section_name || result?.section?.name;

      showSuccessToast({
        title: 'Routed to section folder',
        description: detectedGrade && detectedSection
          ? `Inserted to Grade ${detectedGrade} - ${detectedSection}`
          : 'SF10 file has been inserted to the detected folder.',
      });
    } catch (error) {
      if (error?.status === 422 && error?.code === 'SF10_DETECTION_FAILED') {
        setPendingFile(file);
        setIsRoutingModalOpen(true);
        return;
      }

      showErrorToast({
        title: 'Upload failed',
        description: error?.message || 'Unable to upload SF10 file.',
      });
    }
  }, [onImportSf10]);

  const handleManualRoute = useCallback(async ({ sectionId, gradeLevel }) => {
    if (!pendingFile || !onImportSf10) {
      return;
    }

    setIsManualUploading(true);

    try {
      const result = await onImportSf10(pendingFile, { sectionId, gradeLevel });
      const detectedSection = result?.section?.section_name || result?.section?.name;

      showSuccessToast({
        title: 'Routed to section folder',
        description: detectedSection
          ? `Inserted to Grade ${gradeLevel} - ${detectedSection}`
          : `Inserted to ${selectedGradeLabel}`,
      });

      setPendingFile(null);
      setIsRoutingModalOpen(false);
    } catch (error) {
      showErrorToast({
        title: 'Manual routing failed',
        description: error?.message || 'Unable to upload SF10 file to the selected folder.',
      });
    } finally {
      setIsManualUploading(false);
    }
  }, [onImportSf10, pendingFile, selectedGradeLabel]);

  const handleOpenNotes = useCallback(() => {
    setShowNotesPanel(true);
    setIsNotesOpen(true);
  }, []);

  const handleCloseNotes = useCallback(() => {
    setIsNotesOpen(false);
    setTimeout(() => {
      setShowNotesPanel(false);
    }, 300);
  }, []);

  return {
    activeGrade,
    closeFolder,
    closeRoutingModal,
    handleCloseNotes,
    handleImportFile,
    handleManualRoute,
    handleOpenNotes,
    isManualUploading,
    isNotesOpen,
    isRoutingModalOpen,
    pendingFile,
    selectedFolder,
    setActiveGrade,
    showNotesPanel,
    openFolder,
  };
}
