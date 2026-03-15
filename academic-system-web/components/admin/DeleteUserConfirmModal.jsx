'use client';

import { useState } from 'react'; // Added useState for feedback
import { 
  IoTrashOutline, 
  IoWarningOutline, 
  IoCopyOutline, 
  IoCheckmarkCircleOutline 
} from 'react-icons/io5';
import ConfirmActionModal from '../ui/ConfirmActionModal';
import styles from './DeleteUserConfirmModal.module.css';

export default function DeleteUserConfirmModal({
  isOpen,
  user,
  actorRole,
  confirmUserId,
  onConfirmUserIdChange,
  onCancel,
  onConfirm,
  submitting,
}) {
  const [copied, setCopied] = useState(false); // Track copy state

  if (!isOpen || !user) return null;

  const requiresPrincipalConfirmation = actorRole === 'principal';
  const userIdMatches = confirmUserId.trim() === user.id;
  const canConfirm = submitting ? false : (requiresPrincipalConfirmation ? userIdMatches : true);

  // Copy handler
  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <ConfirmActionModal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete user account"
      subtitle="This action permanently removes the selected user from authentication and profile records."
      icon={<IoTrashOutline />}
      tone="danger"
      onConfirm={onConfirm}
      confirmText={submitting ? 'Deleting...' : 'Delete user'}
      confirmDisabled={!canConfirm}
      confirmLoading={submitting}
    >
      <div className={styles.userSummary}>
        <p><strong>Name:</strong> {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown user'}</p>
        <p><strong>Email:</strong> {user.email || 'No email available'}</p>
        
        {/* Updated User ID Section with Copy Button */}
        <div className={styles.idContainer}>
          <p><strong>User ID:</strong></p>
          <div className={styles.idWrapper}>
            <code className={styles.userId}>{user.id}</code>
            <button 
              type="button" 
              className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
              onClick={handleCopyId}
              title="Copy ID to clipboard"
            >
              {copied ? <IoCheckmarkCircleOutline size={16} /> : <IoCopyOutline size={16} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {requiresPrincipalConfirmation && (
        <div className={styles.confirmationBox}>
          <label htmlFor="confirm-user-id" className={styles.label}>
            Principal confirmation: type the exact user ID to proceed
          </label>
          <input
            id="confirm-user-id"
            className={styles.input}
            type="text"
            value={confirmUserId}
            onChange={(event) => onConfirmUserIdChange(event.target.value)}
            placeholder="Paste full user ID here"
            autoComplete="off"
            spellCheck={false}
            disabled={submitting}
          />
          {!userIdMatches && confirmUserId.length > 0 && (
            <p className={styles.mismatchText}>
              <IoWarningOutline size={14} /> User ID does not match.
            </p>
          )}
        </div>
      )}
    </ConfirmActionModal>
  );
}