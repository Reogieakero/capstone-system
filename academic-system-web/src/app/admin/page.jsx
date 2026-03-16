'use client';

import AdminSidebar from '../../components/admin/AdminSidebar';
import Sf10Vault from '../../components/admin/Sf10Vault';
import AdminTopNav from '../../components/admin/AdminTopNav';
import SystemOverview from '../../components/admin/SystemOverview';
import UserManagement from '../../components/admin/UserManagement';
import SectionManagement from '../../components/admin/SectionManagement'; 

import LoadingState from '../../components/ui/LoadingState';
import { SileoNotification } from '../../components/ui/SileoNotification';
import useAdminDashboard from '../../hooks/useAdminDashboard';
import styles from './admin.module.css';

export default function AdminPage() {
  const {
    activePage,
    collapsed,
    filteredUsers,
    handleApprove,
    handleCreateSection,
    handleDeleteUser,
    handleReject,
    handleSignOut,
    loading,
    pageLoading,
    pageTitle,
    profile,
    refreshSectionsPage,
    refreshUsersPage,
    sections,
    users,
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
              currentUserRole={profile?.role}
              filteredUsers={filteredUsers}
              onApprove={handleApprove}
              onReject={handleReject}
              handleDeleteUser={handleDeleteUser}
              onRefresh={refreshUsersPage}
              pageLoading={pageLoading}
              setUserFilter={setUserFilter}
              userFilter={userFilter}
              userStatusCounts={userStatusCounts}
            />
          )}

          {activePage === 'sections' && (
            <SectionManagement
              pageLoading={pageLoading}
              onCreateSection={handleCreateSection}
              onRefresh={refreshSectionsPage}
              sections={sections}
              users={users}
            />
          )}

          {activePage === 'storage' && <Sf10Vault />}
        </main>
      </div>
    </div>
  );
}