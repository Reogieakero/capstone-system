'use client';

import React, { useMemo, useState } from 'react';
import { IoClose, IoLayersOutline, IoCopyOutline } from 'react-icons/io5';
import { showErrorToast, showSuccessToast } from '../../utils/sileoNotify';
import SelectField from '../ui/SelectField';
import styles from './InsertSectionModal.module.css';

function buildDisplayName(user = {}) {
  return [
    user.first_name,
    user.middle_name || user.middleName || user.middle || user.middlename,
    user.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function InsertSectionModal({
  isOpen,
  onClose,
  onConfirm,
  teachers = [],
  mode = 'create',
  initialSection = null,
  existingSections = [],
}) {
  const [selectedGrade, setSelectedGrade] = useState(() => (
    mode === 'edit' && initialSection ? String(initialSection.grade_level || '') : ''
  ));
  const [sectionName, setSectionName] = useState(() => (
    mode === 'edit' && initialSection ? (initialSection.section_name || initialSection.name || '') : ''
  ));
  const [selectedAdviserId, setSelectedAdviserId] = useState(() => (
    mode === 'edit' && initialSection ? (initialSection.adviser_id || '') : ''
  ));
  const [confirmAdviserId, setConfirmAdviserId] = useState(() => (
    mode === 'edit' && initialSection ? (initialSection.adviser_id || '') : ''
  ));
  const [forceReplaceAdviser, setForceReplaceAdviser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedGrade('');
    setSectionName('');
    setSelectedAdviserId('');
    setConfirmAdviserId('');
    setForceReplaceAdviser(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const duplicateSection = useMemo(() => {
    if (!selectedGrade || !sectionName.trim()) {
      return null;
    }

    const normalizedName = sectionName.trim().toLowerCase();
    return existingSections.find((section) => {
      if (mode === 'edit' && initialSection?.id === section.id) {
        return false;
      }

      return String(section.grade_level) === String(selectedGrade)
        && String(section.section_name || section.name || '').trim().toLowerCase() === normalizedName;
    }) || null;
  }, [existingSections, initialSection, mode, sectionName, selectedGrade]);

  if (!isOpen) return null;

  const handleCopyId = async () => {
    if (!selectedAdviserId) return;
    try {
      await navigator.clipboard.writeText(selectedAdviserId);
      showSuccessToast({ title: 'ID Copied', description: 'Adviser ID copied to clipboard.' });
    } catch (err) {
      showErrorToast({ title: 'Copy failed', description: 'Could not copy ID.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (confirmAdviserId !== selectedAdviserId) {
      showErrorToast({ 
        title: 'Verification Failed', 
        description: 'The entered ID does not match the selected adviser.' 
      });
      return;
    }

    if (duplicateSection) {
      showErrorToast({
        title: 'Duplicate section found',
        description: `Grade ${selectedGrade} - ${sectionName.trim()} already exists.`,
      });
      return;
    }

    const adviser = teachers.find((teacher) => teacher.id === selectedAdviserId);
    const gradeLabel = `Grade ${selectedGrade}`;
    const normalizedSectionName = sectionName.trim();

    setIsSubmitting(true);

    const payload = {
      name: `${gradeLabel} - ${normalizedSectionName}`,
      grade_level: selectedGrade,
      section_name: normalizedSectionName,
      adviser_id: selectedAdviserId,
      adviser_name: adviser
        ? buildDisplayName(adviser)
        : '',
      forceReplaceAdviser: mode === 'edit' ? forceReplaceAdviser : false,
    };

    // Close first so toasts are visible immediately after action starts.
    handleClose();

    Promise.resolve(onConfirm?.(payload)).catch(() => {
      // Toasts are handled by higher-level handlers.
    });
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.titleIcon}>
            <IoLayersOutline size={20} />
            <h2>{mode === 'edit' ? 'Edit Section' : 'Add New Section'}</h2>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}><IoClose size={20} /></button>
        </header>
        <p className={styles.subtitle}>
          {mode === 'edit'
            ? 'Update section name or adviser. Grade level is locked for existing sections.'
            : 'Create a new class section by choosing a grade, entering a section name, and assigning an adviser.'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGrid}>
            <div className={styles.inputGroup}>
              <label>Grade Level</label>
              <SelectField
                name="gradeLevel"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                options={['7', '8', '9', '10', '11', '12'].map((grade) => ({
                  value: grade,
                  label: `Grade ${grade}`,
                }))}
                placeholder="Select grade"
                className={styles.selectInput}
                disabled={mode === 'edit'}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="sectionName">Section Name</label>
              <input
                id="sectionName"
                type="text"
                placeholder="St. Luke"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Select Adviser</label>
            <SelectField
              name="adviserSelect"
              value={selectedAdviserId}
              onChange={(e) => {
                setSelectedAdviserId(e.target.value);
                setConfirmAdviserId(''); 
              }}
              options={teachers.map((teacher) => ({
                value: teacher.id,
                label: buildDisplayName(teacher),
              }))}
              placeholder="Select a teacher..."
              className={styles.selectInput}
              required
            />
          </div>

          {mode === 'edit' && (
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={forceReplaceAdviser}
                onChange={(e) => setForceReplaceAdviser(e.target.checked)}
              />
              <span>Replace adviser from current assignment (swap advisers)</span>
            </label>
          )}

          {selectedAdviserId && (
            <div className={styles.confirmSection}>
              <div className={styles.confirmHeader}>
                <label>Confirm Adviser ID</label>
                <button 
                  type="button" 
                  className={styles.copyBtn} 
                  onClick={handleCopyId}
                  title="Copy ID"
                >
                  <IoCopyOutline size={14} /> Copy ID
                </button>
              </div>
              <input
                type="text"
                placeholder="Paste teacher ID to confirm"
                value={confirmAdviserId}
                onChange={(e) => setConfirmAdviserId(e.target.value)}
                className={styles.confirmInput}
                required
              />
              <p className={styles.helperText}>
                Teacher ID: <span>{selectedAdviserId}</span>
              </p>
            </div>
          )}
          
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={!selectedGrade || !sectionName.trim() || !selectedAdviserId || confirmAdviserId !== selectedAdviserId || isSubmitting}
            >
              {isSubmitting
                ? (mode === 'edit' ? 'Updating...' : 'Adding...')
                : (mode === 'edit' ? 'Save Changes' : 'Add Section')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}