'use client';

import { useState } from 'react';
import { IoListOutline } from 'react-icons/io5';
import FilterTabs from '../ui/FilterTabs';
import ActivityLog from './ActivityLog';
import ImportSf10Card from './ImportSf10Card';
import ReplaceSf10Modal from './ReplaceSf10Modal';
import Sf10FolderContents from './Sf10FolderContents';
import Sf10FolderGrid from './Sf10FolderGrid';
import Sf10RoutingModal from './Sf10RoutingModal';
import VaultNotes from './VaultNotes';
import LoadingState from '../ui/LoadingState';
import useSf10Vault from '../../hooks/useSf10Vault';
import {
  showPromiseToast,
  showErrorToast,
} from '../../utils/sileoNotify';
import styles from './Sf10Vault.module.css';

const GRADE_FILTERS = ['all', '7', '8', '9', '10', '11', '12'];

export default function Sf10Vault({
  sections = [],
  pageLoading = false,
  onImportSf10,
  onGetFiles,
  onGetSignedUrl,
  onFolderSelect,
  selectedFolderExternal = null,
}) {
  const [replaceModal, setReplaceModal] = useState({
    open: false,
    file: null,
    error: null,
  });

  async function runImport(file, options = {}) {
    const loadingTitle = options.sectionId
      ? 'Uploading SF10 to selected folder...'
      : 'Uploading SF10 file...';

    try {
      await showPromiseToast(
        onImportSf10(file, options),
        {
          loading: { title: loadingTitle },
          success: { title: 'SF10 uploaded successfully.' },
          error: (err) => {
            if (err?.status === 409 && err?.code === 'SF10_DUPLICATE_FILE') {
              setReplaceModal({ open: true, file, error: err });
              return {
                title: 'File already exists',
                description: `An SF10 for ${err?.details?.learner || 'this student'} already exists. Use the dialog to replace it.`,
              };
            }

            if (err?.status === 422 && err?.code === 'SF10_DETECTION_FAILED') {
              return { title: 'Auto-detect failed. Choose a folder manually.' };
            }

            return { title: err?.message || 'SF10 upload failed.' };
          },
        }
      );
    } catch {
    }
  }

  function handleReplaceCancel() {
    setReplaceModal({ open: false, file: null, error: null });
  }

  async function handleReplaceConfirm() {
    const { file, error: dupError } = replaceModal;
    setReplaceModal({ open: false, file: null, error: null });

    if (!file || !onImportSf10) return;

    await showPromiseToast(
      onImportSf10(file, {
        replace: true,
        sectionId: dupError?.details?.sectionId,
        learnerFolderName: dupError?.details?.learnerFolderName,
      }),
      {
        loading: { title: 'Replacing existing SF10 file...' },
        success: { title: 'SF10 file replaced successfully.' },
        error: (err) => ({ title: err?.message || 'Replace failed.' }),
      }
    );
  }

  const {
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
    openFolder,
    pendingFile,
    selectedFolder,
    setActiveGrade,
    showNotesPanel,
  } = useSf10Vault({
    onImportSf10: runImport,
    onFolderSelect,
    selectedFolderExternal,
  });

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

      {showNotesPanel && (
        <VaultNotes
          isOpen={isNotesOpen}
          onClose={handleCloseNotes}
        />
      )}

      <Sf10RoutingModal
        fileName={pendingFile?.name || 'Selected SF10 file'}
        isOpen={isRoutingModalOpen}
        isSubmitting={isManualUploading}
        onClose={closeRoutingModal}
        onConfirm={handleManualRoute}
        sections={sections}
      />

      <ReplaceSf10Modal
        open={replaceModal.open}
        onConfirm={handleReplaceConfirm}
        onCancel={handleReplaceCancel}
        fileName={replaceModal.file?.name}
        studentName={replaceModal.error?.details?.learner || 'Student'}
        sectionName={
          replaceModal.error?.details?.section
            ? `Grade ${replaceModal.error.details.grade} – ${replaceModal.error.details.section}`
            : ''
        }
      />
    </section>
  );
}
