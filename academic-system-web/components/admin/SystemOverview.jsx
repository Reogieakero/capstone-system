'use client';

import { IoPeople, IoShieldCheckmark, IoTime } from 'react-icons/io5';
import LoadingState from '../ui/LoadingState';
import styles from './SystemOverview.module.css';

export default function SystemOverview({ pageLoading, stats }) {
  if (pageLoading) {
    return (
      <section className={styles.overviewSection}>
        <div className={styles.loadingWrap}>
          <LoadingState size="md" label="Loading overview" />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.overviewSection}>
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardUsers}`}>
          <div className={styles.statCardHeader}>
            <p className={styles.statLabel}>Total Users</p>
            <div className={`${styles.statIcon} ${styles.iconBlue}`}>
              <IoPeople size={15} />
            </div>
          </div>
          <p className={styles.statValue}>{stats?.total ?? 0}</p>
        </div>

        <div className={`${styles.statCard} ${styles.statCardPending}`}>
          <div className={styles.statCardHeader}>
            <p className={styles.statLabel}>Pending Approvals</p>
            <div className={`${styles.statIcon} ${styles.iconAmber}`}>
              <IoTime size={15} />
            </div>
          </div>
          <p className={styles.statValue}>{stats?.pending ?? 0}</p>
        </div>

        <div className={`${styles.statCard} ${styles.statCardApproved}`}>
          <div className={styles.statCardHeader}>
            <p className={styles.statLabel}>Approved Users</p>
            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
              <IoShieldCheckmark size={15} />
            </div>
          </div>
          <p className={styles.statValue}>{stats?.approved ?? 0}</p>
        </div>
      </div>
    </section>
  );
}
