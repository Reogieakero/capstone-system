'use client';

import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import styles from './ConfirmActionModal.module.css';

export default function ConfirmActionModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmDisabled = false,
  confirmLoading = false,
  tone = 'danger',
  children,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEsc = (event) => {
      if (event.key === 'Escape' && !confirmLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, confirmLoading]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={!confirmLoading ? onClose : undefined}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        {icon ? (
          <div className={`${styles.iconWrap} ${styles[`icon_${tone}`]}`}>
            {icon}
          </div>
        ) : null}

        <h2 className={styles.title}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

        {children ? <div className={styles.body}>{children}</div> : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={confirmLoading}
          >
            <IoClose size={16} /> {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${styles[`confirm_${tone}`]}`}
            onClick={onConfirm}
            disabled={confirmDisabled || confirmLoading}
          >
            {confirmLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
