'use client';

import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminTopNav from '../../../components/admin/AdminTopNav';
import SystemOverview from '../../../components/admin/SystemOverview';
import UserManagement from '../../../components/admin/UserManagement';
import LoadingState from '../../../components/ui/LoadingState';
import { SileoNotification } from '../../../components/ui/SileoNotification';
import useAdminDashboard from '../../../hooks/useAdminDashboard';
import styles from './admin.module.css';

export default function AdminPage() {
  const {
    activePage,
    collapsed,
    filteredUsers,
    handleApprove,
    handleReject,
    handleSignOut,
    loading,
    pageLoading,
    pageTitle,
    profile,
    setActivePage,
    setCollapsed,
    setUserFilter,
    stats,
    userFilter,
    userStatusCounts,
  } = useAdminDashboard();

  if (loading) {
    return <LoadingState fullScreen label="Loading admin dashboard" />;
  }

  return (
    <div className={styles.wrapper}>
      <SileoNotification />
      <AdminTopNav profile={profile} onSignOut={handleSignOut} />

      <div className={styles.bodyRow}>
        <AdminSidebar
          activePage={activePage}
          collapsed={collapsed}
          onNavigate={setActivePage}
          onToggle={() => setCollapsed((current) => !current)}
        />

        <main className={styles.main}>
          <header className={styles.header}>

            <div className={styles.headerTitleBlock}>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
            </div>
          </header>

          {activePage === 'overview' && (
            <SystemOverview pageLoading={pageLoading} stats={stats} />
          )}

          {activePage === 'users' && (
            <UserManagement
              filteredUsers={filteredUsers}
              onApprove={handleApprove}
              onReject={handleReject}
              pageLoading={pageLoading}
              setUserFilter={setUserFilter}
              userFilter={userFilter}
              userStatusCounts={userStatusCounts}
            />
          )}
        </main>
      </div>
    </div>
  );
}
