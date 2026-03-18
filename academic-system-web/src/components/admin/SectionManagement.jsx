'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, RefreshCw, UserRound } from 'lucide-react';
import { IoArrowBackOutline } from 'react-icons/io5';
import FloatingNotificationCard from '../ui/FloatingNotificationCard';
import InsertSectionModal from './InsertSectionModal';
import SectionBodyCards from './SectionBodyCards';
import SectionAnalyticsPanel from './SectionAnalyticsPanel';
import FilterTabs from '../ui/FilterTabs';
import LoadingState from '../ui/LoadingState';
import styles from './SectionManagement.module.css'; 

export default function SectionManagement({
  users = [],
  sections = [],
  onCreateSection,
  onUpdateSection,
  onRefresh,
  pageLoading,
}) {
  const analyticsDateRanges = ['Today', 'Yesterday', 'Last Month'];
  const [showAdviserCard, setShowAdviserCard] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [analyticsDateRange, setAnalyticsDateRange] = useState('Today');

  const handleViewAnalytics = (id) => {
    setIsAnalyticsLoading(true);
    setSelectedSectionId(id);
    setTimeout(() => setIsAnalyticsLoading(false), 700);
  };

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddSection = () => {
    setEditingSection(null);
    setShowInsertModal(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setShowInsertModal(true);
  };

  const handleConfirmSection = async (payload) => {
    if (editingSection && onUpdateSection) {
      return onUpdateSection(editingSection.id, payload);
    }

    if (onCreateSection) {
      return onCreateSection(payload);
    }

    return null;
  };

  const handleCloseModal = () => {
    setShowInsertModal(false);
    setEditingSection(null);
  };

  const adviserData = useMemo(() => {
    const groupedByAdviser = sections.reduce((acc, section) => {
      const adviserId = section.adviser_id;
      if (!adviserId) {
        return acc;
      }

      if (!acc[adviserId]) {
        acc[adviserId] = {
          id: adviserId,
          primaryText: section.adviser_name || 'Unknown Adviser',
          tags: [],
        };
      }

      acc[adviserId].tags.push(section.name || `Grade ${section.grade_level} - ${section.section_name}`);
      return acc;
    }, {});

    return Object.values(groupedByAdviser);
  }, [sections]);

  const selectedSection = sections.find((section) => section.id === selectedSectionId) || null;

  const sectionLabel = selectedSection
    ? `Grade ${selectedSection.grade_level ?? 'N/A'} - ${selectedSection.section_name || selectedSection.name || 'Unnamed Section'}`
    : '';

  const isAnalyticsMode = !!(selectedSection || isAnalyticsLoading);

  return (
    <div className={styles.container}>
      <div className={`${styles.headerActionArea} ${isAnalyticsMode ? styles.analyticsHeaderArea : ''}`}>
        {isAnalyticsMode ? (
          <div className={styles.analyticsHeader}>
            <button
              type="button"
              className={styles.analyticsBackBtn}
              onClick={() => setSelectedSectionId(null)}
            >
              <IoArrowBackOutline size={13} />
              <span>Back to Sections</span>
            </button>
            <div className={styles.analyticsHeaderLeft}>
              <div className={styles.analyticsTitleRow}>
                <h1 className={styles.analyticsTitle}>
                  {sectionLabel} Performance Analytics
                </h1>
                <div className={styles.analyticsRangeTabs}>
                  <FilterTabs
                    items={analyticsDateRanges}
                    activeValue={analyticsDateRange}
                    onChange={setAnalyticsDateRange}
                  />
                </div>
              </div>
              {selectedSection && (
                <p className={styles.analyticsAdviser}>
                  Adviser: <span>{selectedSection.adviser_name || 'Unknown Adviser'}</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.advisorBtn} ${showAdviserCard ? styles.active : ''}`}
              onClick={() => setShowAdviserCard(!showAdviserCard)}
            >
              <UserRound size={16} strokeWidth={2.3} /> <span>Adviser</span>
            </button>
            
            <button className={styles.insertBtn} onClick={handleAddSection}>
              <ChevronDown size={16} strokeWidth={2.5} /> <span>Insert</span>
            </button>

            <button 
              className={styles.refreshBtn} 
              onClick={handleRefresh} 
              disabled={isRefreshing || pageLoading}
            >
              <RefreshCw 
                size={15} 
                strokeWidth={2.3} 
                className={isRefreshing ? styles.refreshIconSpinning : ''} 
              />
            </button>
          </div>
        )}
      </div>

      <div className={styles.contentArea}>
        {pageLoading || isRefreshing ? (
          <LoadingState size="md" label="Refreshing sections" />
        ) : isAnalyticsLoading ? (
          <LoadingState size="md" label="Loading analytics" />
        ) : selectedSection ? (
          <SectionAnalyticsPanel
            section={selectedSection}
            onBack={() => setSelectedSectionId(null)}
          />
        ) : sections.length === 0 ? (
          <p className={styles.emptyText}>No sections created yet.</p>
        ) : (
          <SectionBodyCards
            sections={sections}
            onViewAnalytics={handleViewAnalytics}
            onEditSection={handleEditSection}
          />
        )}
      </div>

      <FloatingNotificationCard 
        isOpen={showAdviserCard}
        onClose={() => setShowAdviserCard(false)}
        title="Section Advisers"
        data={adviserData}
      />

      <InsertSectionModal 
        key={`${editingSection?.id || 'create'}-${showInsertModal ? 'open' : 'closed'}`}
        isOpen={showInsertModal} 
        mode={editingSection ? 'edit' : 'create'}
        initialSection={editingSection}
        existingSections={sections}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSection}
        teachers={users.filter(u => u.role === 'teacher')}
      />
    </div>
  );
}