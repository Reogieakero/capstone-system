'use client';

import { useMemo, useState } from 'react';
import { IoClose, IoFolderOpenOutline } from 'react-icons/io5';
import SelectField from '../ui/SelectField';
import styles from './Sf10RoutingModal.module.css';

const GRADE_OPTIONS = ['7', '8', '9', '10', '11', '12'].map((grade) => ({
  value: grade,
  label: `Grade ${grade}`,
}));

export default function Sf10RoutingModal({
  fileName,
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
  sections = [],
}) {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const availableSections = useMemo(() => {
    return (sections || []).filter((section) => String(section.grade_level ?? '') === selectedGrade);
  }, [sections, selectedGrade]);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setSelectedGrade('');
    setSelectedSectionId('');
    onClose?.();
  };

  const handleGradeChange = (event) => {
    setSelectedGrade(event.target.value);
    setSelectedSectionId('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedGrade || !selectedSectionId || isSubmitting) {
      return;
    }

    onConfirm?.({
      gradeLevel: selectedGrade,
      sectionId: selectedSectionId,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <IoFolderOpenOutline size={20} />
            <h2>Route SF10 File</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={handleClose} disabled={isSubmitting}>
            <IoClose size={20} />
          </button>
        </header>

        <p className={styles.description}>
          Auto-detect could not read the grade and section from <strong>{fileName}</strong>. Select the destination folder to continue the upload.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Grade Level</label>
            <SelectField
              name="sf10Grade"
              value={selectedGrade}
              onChange={handleGradeChange}
              options={GRADE_OPTIONS}
              placeholder="Select grade"
              className={styles.selectInput}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Section Folder</label>
            <SelectField
              name="sf10Section"
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              options={availableSections.map((section) => ({
                value: section.id,
                label: section.section_name || section.name || 'Unnamed Section',
              }))}
              placeholder={selectedGrade ? 'Select section' : 'Choose grade first'}
              className={styles.selectInput}
              disabled={!selectedGrade}
              required
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={!selectedGrade || !selectedSectionId || isSubmitting}>
              {isSubmitting ? 'Uploading...' : 'Upload to Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
