'use client';

import { IoListOutline } from 'react-icons/io5';
import FilterTabs from '../ui/FilterTabs';
import ActivityLog from './ActivityLog';
import ImportSf10Card from './ImportSf10Card';
import Sf10FolderContents from './Sf10FolderContents';
import Sf10FolderGrid from './Sf10FolderGrid';
import Sf10RoutingModal from './Sf10RoutingModal';
import VaultNotes from './VaultNotes';
import LoadingState from '../ui/LoadingState';
import useSf10Vault from '../../hooks/useSf10Vault';
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
  } = useSf10Vault({ onImportSf10, onFolderSelect, selectedFolderExternal });

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