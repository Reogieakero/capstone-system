'use client';

import React from 'react';
import {
  IoTimeOutline,
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoEyeOutline,
} from 'react-icons/io5';
import styles from './ActivityLog.module.css';

function getIcon(type) {
  switch (type) {
    case 'import': return <IoCloudUploadOutline size={16} />;
    case 'view':   return <IoEyeOutline size={16} />;
    default:       return <IoDocumentTextOutline size={16} />;
  }
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function ActivityLog({ logs = [] }) {
  return (
    <div className={styles.logContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Activity Logs</h3>
        </div>
      </div>

      <div className={styles.logList}>
        {logs.length === 0 && (
          <div className={styles.emptyLog}>No activity yet this session.</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className={styles.logItem}>
            <div className={styles.iconWrapper}>
              {getIcon(log.type)}
            </div>
            <div className={styles.logContent}>
              <div className={styles.logMain}>
                <span className={styles.actionName}>{log.action}</span>
                <span className={styles.detailText}>{log.detail}</span>
              </div>
              <div className={styles.logMeta}>
                <IoTimeOutline size={12} />
                <span>{formatTime(log.timestamp)}</span>
              </div>
            </div>
            <div className={`${styles.statusDot} ${styles[log.status]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}