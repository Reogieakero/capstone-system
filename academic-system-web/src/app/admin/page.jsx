'use client';

import { useState } from 'react';
import { IoArrowBackOutline } from 'react-icons/io5';
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
  const [sf10Folder, setSf10Folder] = useState(null);

  const {
    activePage,
    collapsed,
    filteredUsers,
    handleApprove,
    handleCreateSection,
    handleUpdateSection,
    handleDeleteUser,
    handleImportSf10,
    handleGetSf10Files,
    handleGetSf10SignedUrl,
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

  const handleNavigate = (page) => {
    setSf10Folder(null);
    setActivePage(page);
  };

  return (
    <div className={styles.wrapper}>
      <SileoNotification />
      <AdminTopNav profile={profile} onSignOut={handleSignOut} />

      <div className={styles.bodyRow}>
        <AdminSidebar
          activePage={activePage}
          collapsed={collapsed}
          onNavigate={handleNavigate}
          onToggle={() => setCollapsed((current) => !current)}
        />

        <main className={styles.main}>
          <header className={styles.header}>
            {activePage === 'storage' && sf10Folder && (
              <button
                type="button"
                className={styles.sf10BackBtn}
                onClick={() => setSf10Folder(null)}
              >
                <IoArrowBackOutline size={20} />
                <span>Back to Repository</span>
              </button>
            )}
            <div className={styles.headerTitleBlock}>
              <h1 className={styles.pageTitle}>
                {activePage === 'storage' && sf10Folder
                  ? `Grade ${sf10Folder.grade} \u2013 ${sf10Folder.sectionName}`
                  : pageTitle}
              </h1>
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
              onUpdateSection={handleUpdateSection}
              onRefresh={refreshSectionsPage}
              sections={sections}
              users={users}
            />
          )}

          {activePage === 'storage' && (
            <Sf10Vault
              onImportSf10={handleImportSf10}
              onGetFiles={handleGetSf10Files}
              onGetSignedUrl={handleGetSf10SignedUrl}
              onFolderSelect={setSf10Folder}
              selectedFolderExternal={sf10Folder}
              pageLoading={pageLoading}
              sections={sections}
            />
          )}
        </main>
      </div>
    </div>
  );
}