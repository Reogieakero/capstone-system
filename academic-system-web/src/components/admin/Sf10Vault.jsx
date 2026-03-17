'use client';

import { useMemo, useState } from 'react';
import { IoListOutline } from 'react-icons/io5';
import FilterTabs from '../ui/FilterTabs';
import ActivityLog from './ActivityLog';
import ImportSf10Card from './ImportSf10Card';
import Sf10FolderContents from './Sf10FolderContents';
import Sf10FolderGrid from './Sf10FolderGrid';
import Sf10RoutingModal from './Sf10RoutingModal';
import VaultNotes from './VaultNotes';
import LoadingState from '../ui/LoadingState';
import { showErrorToast, showSuccessToast } from '../../utils/sileoNotify';
import styles from './Sf10Vault.module.css';

const GRADE_FILTERS = ['all', '7', '8', '9', '10', '11', '12'];

export default function Sf10Vault({ sections = [], pageLoading = false, onImportSf10, onGetFiles, onGetSignedUrl, onFolderSelect }) {
  const [activeGrade, setActiveGrade] = useState('all');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [isManualUploading, setIsManualUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const openFolder = (folder) => {
    setSelectedFolder(folder);
    onFolderSelect?.(folder);
  };

  const closeFolder = () => {
    setSelectedFolder(null);
    onFolderSelect?.(null);
  };

  const selectedGradeLabel = useMemo(() => {
    return activeGrade === 'all' ? 'All Grades' : `Grade ${activeGrade}`;
  }, [activeGrade]);

  const closeRoutingModal = () => {
    if (isManualUploading) {
      return;
    }

    setPendingFile(null);
    setIsRoutingModalOpen(false);
  };

  const handleImportFile = async (file) => {
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
  };

  const handleManualRoute = async ({ sectionId, gradeLevel }) => {
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
        {!selectedFolder && (
          <FilterTabs
            items={GRADE_FILTERS}
            activeValue={activeGrade}
            onChange={setActiveGrade}
            renderLabel={(grade) => (grade === 'all' ? 'All Grades' : `Grade ${grade}`)}
          />
        )}
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
          ) : selectedFolder ? (
            <Sf10FolderContents
              folder={selectedFolder}
              onBack={closeFolder}
              onGetFiles={onGetFiles}
              onGetSignedUrl={onGetSignedUrl}
            />
          ) : (
            <Sf10FolderGrid
              activeGrade={activeGrade}
              sections={sections}
              onFolderClick={openFolder}
            />
          )}
        </div>

        {!selectedFolder && (
          <div className={styles.sidePanel}>
            <ImportSf10Card onImport={handleImportFile} />
            <ActivityLog />
          </div>
        )}
      </div>

      {showNotesPanel ? (
        <VaultNotes
          isOpen={isNotesOpen}
          onClose={handleCloseNotes}
        />
      ) : null}

      <Sf10RoutingModal
        fileName={pendingFile?.name || 'Selected SF10 file'}
        isOpen={isRoutingModalOpen}
        isSubmitting={isManualUploading}
        onClose={closeRoutingModal}
        onConfirm={handleManualRoute}
        sections={sections}
      />
    </section>
  );
}