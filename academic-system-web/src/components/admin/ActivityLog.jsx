'use client';

import React from 'react';
import { IoTimeOutline, IoDocumentTextOutline, IoSyncOutline } from 'react-icons/io5';
import styles from './ActivityLog.module.css';

const MOCK_LOGS = [
  { id: 1, action: 'SF10 Imported', detail: 'Grade_7_Final.pdf', time: '2 mins ago', status: 'success' },
  { id: 2, action: 'Bulk Upload', detail: '15 student records', time: '1 hour ago', status: 'success' },
  { id: 3, action: 'System Sync', detail: 'Database updated', time: '3 hours ago', status: 'info' },
  { id: 4, action: 'User Approved', detail: 'Teacher Maria Clara', time: '5 hours ago', status: 'success' },
  { id: 5, action: 'SF10 Exported', detail: 'Grade_10_Batch.docx', time: 'Yesterday', status: 'info' },
  { id: 6, action: 'Record Deleted', detail: 'ID: 88291-SF10', time: '2 days ago', status: 'error' },
  { id: 7, action: 'Profile Updated', detail: 'Student: Juan Dela Cruz', time: '3 days ago', status: 'success' },
];

export default function ActivityLog() {
  return (
    <div className={styles.logContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <IoSyncOutline className={styles.headerIcon} />
          <h3 className={styles.title}>Activity Logs</h3>
        </div>
        <button className={styles.viewAll}>View All</button>
      </div>

      <div className={styles.logList}>
        {MOCK_LOGS.map((log) => (
          <div key={log.id} className={styles.logItem}>
            <div className={styles.iconWrapper}>
              <IoDocumentTextOutline size={16} />
            </div>
            <div className={styles.logContent}>
              <div className={styles.logMain}>
                <span className={styles.actionName}>{log.action}</span>
                <span className={styles.detailText}>{log.detail}</span>
              </div>
              <div className={styles.logMeta}>
                <IoTimeOutline size={12} />
                <span>{log.time}</span>
              </div>
            </div>
            <div className={`${styles.statusDot} ${styles[log.status]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}