'use client';

import React, { useRef, useState } from 'react';
import { IoCloudUploadOutline, IoFileTrayFullOutline, IoHelpCircleOutline } from 'react-icons/io5';
import { showErrorToast } from '../../utils/sileoNotify';
import styles from './ImportSf10Card.module.css';

export default function ImportSf10Card({ onImport }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const fileName = file.name.toLowerCase();
    const isValidType = fileName.endsWith('.pdf') || fileName.endsWith('.docx');

    if (isValidType) {
      if (onImport) onImport(file);
    } else {
      showErrorToast("Invalid file type. Please upload a PDF or DOCX file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div 
      className={`${styles.bentoCard} ${isDragging ? styles.dragging : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
    >
      <div className={styles.topContent}>
        <div className={styles.leftGroup}>
            <div className={styles.iconContainer}>
            <IoFileTrayFullOutline size={22} />
            </div>
            <div className={styles.info}>
                <h3 className={styles.title}>SF10</h3>
                <p className={styles.description}>
                    {isDragging ? "Drop to upload" : "Import student records"}
                </p>
            </div>
        </div>

        <div className={styles.tooltipContainer}>
            <IoHelpCircleOutline size={18} className={styles.helpIcon} />
            <span className={styles.tooltipText}>Accepted: .PDF, .DOCX</span>
        </div>
      </div>

      <button className={styles.importBtn} onClick={() => fileInputRef.current?.click()}>
        <IoCloudUploadOutline size={18} />
        <span>Select or Drop File</span>
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        className={styles.hiddenInput} 
        onChange={(e) => handleFile(e.target.files[0])}
        accept=".pdf, .docx"
      />
    </div>
  );
}