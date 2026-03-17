'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IoArrowBackOutline, IoStatsChartOutline, IoPeopleOutline } from 'react-icons/io5';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import AdminTopNav from '../../../../components/admin/AdminTopNav';
import LoadingState from '../../../../components/ui/LoadingState';
import { SileoNotification } from '../../../../components/ui/SileoNotification';
import useAdminDashboard from '../../../../hooks/useAdminDashboard';
import adminStyles from '../../admin.module.css';
import styles from './SectionAnalytics.module.css';

export default function SectionAnalytics() {
  const { id } = useParams();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const {
    loading,
    profile,
    handleSignOut,
  } = useAdminDashboard();

  const navigateToAdminPage = (targetPage) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('admin_active_page', targetPage);
    }
    router.push('/admin');
  };

  if (loading) {
    return <LoadingState fullScreen label="Loading admin analytics" />;
  }

  return (
    <div className={adminStyles.wrapper}>
      <SileoNotification />
      <AdminTopNav profile={profile} onSignOut={handleSignOut} />

      <div className={adminStyles.bodyRow}>
        <AdminSidebar
          activePage="sections"
          collapsed={collapsed}
          onNavigate={navigateToAdminPage}
          onToggle={() => setCollapsed((current) => !current)}
        />

        <main className={adminStyles.main}>

          <div className={styles.container}>
            <button
              onClick={() => navigateToAdminPage('sections')}
              className={styles.backBtn}
            >
              <IoArrowBackOutline size={20} />
              <span>Back to Sections</span>
            </button>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <IoPeopleOutline size={24} />
                <div>
                  <h3>Total Students</h3>
                  <p className={styles.statValue}>42</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <IoStatsChartOutline size={24} />
                <div>
                  <h3>Average Grade</h3>
                  <p className={styles.statValue}>89.4%</p>
                </div>
              </div>
            </div>

            <div className={styles.chartPlaceholder}>
              <p>Interactive Performance Charts will be rendered here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}