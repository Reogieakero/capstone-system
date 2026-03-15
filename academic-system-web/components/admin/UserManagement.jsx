'use client';

import { useMemo, useState } from 'react';

import { 
  IoCheckmark, 
  IoClose, 
  IoPersonAdd, 
  IoCopyOutline,
  IoMailOutline, 
  IoCalendarOutline,
  IoShieldCheckmarkOutline, 
  IoToggleOutline, 
  IoGridOutline,
  IoTrashOutline
} from 'react-icons/io5';
import { ADMIN_USER_FILTERS } from '../../constants/admin.constants';
import LoadingState from '../ui/LoadingState';
import { showErrorToast, showSuccessToast } from '../../utils/sileoNotify';
import DeleteUserConfirmModal from './DeleteUserConfirmModal';
import styles from './UserManagement.module.css';

export default function UserManagement({
  filteredUsers,
  onApprove,
  onReject,
  handleDeleteUser,
  currentUserRole,
  pageLoading,
  setUserFilter,
  userFilter,
  userStatusCounts,
}) {
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [confirmUserId, setConfirmUserId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const requiresPrincipalConfirmation = useMemo(
    () => currentUserRole === 'principal',
    [currentUserRole]
  );

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTargetUser(null);
    setConfirmUserId('');
  };

  const openDeleteModal = (user) => {
    setDeleteTargetUser(user);
    setConfirmUserId('');
  };

  const onConfirmDelete = async () => {
    if (!deleteTargetUser) return;

    if (requiresPrincipalConfirmation && confirmUserId.trim() !== deleteTargetUser.id) {
      showErrorToast({
        title: 'Verification mismatch',
        description: 'Principal confirmation requires the exact target user ID.',
      });
      return;
    }

    setIsDeleting(true);
    try {
      await handleDeleteUser(deleteTargetUser.id, confirmUserId.trim());
      showSuccessToast({
        title: 'User removed',
        description: 'The account has been deleted successfully.',
      });
      closeDeleteModal();
    } catch (error) {
      showErrorToast({
        title: 'Delete failed',
        description: error?.message || 'Failed to remove user account.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCreatedAt = (value) => {
    if (!value) {
      return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const fallbackCopy = (value) => {
    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  };

  const handleCopyUserId = async (userId) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(userId);
      } else if (!fallbackCopy(userId)) {
        throw new Error('Clipboard API unavailable');
      }

      showSuccessToast({
        title: 'User ID copied',
        description: `${userId.slice(0, 8)}... copied to clipboard.`,
        duration: 1800,
      });
    } catch {
      showErrorToast({
        title: 'Copy failed',
        description: 'Unable to copy user ID to clipboard.',
      });
    }
  };

  return (
    <section className={styles.usersSection}>
      <div className={styles.filterTabs}>
        {ADMIN_USER_FILTERS.map((filterKey) => (
          <button
            key={filterKey}
            className={`${styles.filterTab} ${userFilter === filterKey ? styles.filterTabActive : ''}`}
            onClick={() => setUserFilter(filterKey)}
          >
            {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
            {filterKey !== 'all' && (
              <span className={styles.filterCount}>{userStatusCounts[filterKey] || 0}</span>
            )}
          </button>
        ))}
      </div>

      {pageLoading ? (
        <div className={styles.tableLoading}>
          <LoadingState size="md" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <IoPersonAdd size={36} />
          <p>No users found.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th><div className={styles.thContent}><IoCopyOutline size={14}/> User ID</div></th>
                <th><div className={styles.thContent}><IoCalendarOutline size={14}/> Created At</div></th>
                <th><div className={styles.thContent}><IoPersonAdd size={14}/> Name</div></th>
                <th><div className={styles.thContent}><IoMailOutline size={14}/> Email</div></th>
                <th><div className={styles.thContent}><IoShieldCheckmarkOutline size={14}/> Role</div></th>
                <th><div className={styles.thContent}><IoToggleOutline size={14}/> Status</div></th>
                <th><div className={styles.thContent}><IoGridOutline size={14}/> Action</div></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userIdCell}>
                      <code className={styles.userIdText}>{user.id?.slice(0, 8)}</code>
                      <button
                        type="button"
                        className={styles.copyIdButton}
                        onClick={() => handleCopyUserId(user.id)}
                        title="Copy user ID"
                      >
                        <IoCopyOutline size={14} />
                      </button>
                    </div>
                  </td>
                  <td className={styles.createdAtCell}>{formatCreatedAt(user.created_at)}</td>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatarPlaceholder}>
                        {user.first_name?.charAt(0) || 'U'}
                      </div>
                      <span>{`${user.first_name} ${user.last_name}`}</span>
                    </div>
                  </td>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td>
                    <span className={styles.roleBadge}>{user.role}</span>
                  </td>
                  <td>
                    {user.status === 'rejected' ? (
                       <span className={styles.rejectedBadge}>
                         <div className={styles.badgeIconWrapper}><IoClose size={10} /></div>
                         Rejected
                       </span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles[`status_${user.status}`]}`}>
                        {user.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      {user.status === 'pending' ? (
                        <>
                          <button className={styles.rejectIconButton} onClick={() => onReject(user.id)}>
                            <IoClose size={16} />
                          </button>
                          <button className={styles.approveBtnInspo} onClick={() => onApprove(user.id)}>
                            <IoCheckmark size={16} /> Approve
                          </button>
                        </>
                      ) : (
                        <span className={styles.statusPlaceholder}>—</span>
                      )}
                      {!['admin', 'principal'].includes(user.role) ? (
                        <button 
                          className={styles.deleteBtn} 
                          onClick={() => openDeleteModal(user)}
                          title="Delete User"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      ) : (
                        user.status !== 'pending' && <span className={styles.protectedLabel}>Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteUserConfirmModal
        isOpen={Boolean(deleteTargetUser)}
        user={deleteTargetUser}
        actorRole={currentUserRole}
        confirmUserId={confirmUserId}
        onConfirmUserIdChange={setConfirmUserId}
        onCancel={closeDeleteModal}
        onConfirm={onConfirmDelete}
        submitting={isDeleting}
      />
    </section>
  );
}