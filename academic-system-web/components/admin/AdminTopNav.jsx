'use client';

import { LogOut, Search } from 'lucide-react';
import styles from './AdminTopNav.module.css';

export default function AdminTopNav({ profile, onSignOut }) {
  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : 'Admin User';
  const initials = profile?.first_name?.charAt(0).toUpperCase() ?? 'A';
  const displayRole = profile?.role || 'admin';

  return (
    <div className={styles.topNav}>
      <div className={styles.topNavLeft}>
        <div className={styles.navLogo}>O</div>
        <p className={styles.navOrg}>OmniStudy Org</p>
      </div>

      <div className={styles.topNavCenter}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className={styles.searchInput} 
          />
        </div>
      </div>

      <div className={styles.topNavRight}>
        <div className={styles.navAccount}>
          <div className={styles.navAvatar}>{initials}</div>
          <div className={styles.navAccountMeta}>
            <p className={styles.navAccountName}>{displayName}</p>
            <p className={styles.navAccountRole}>{displayRole}</p>
          </div>
        </div>
        <button className={styles.navLogout} type="button" onClick={onSignOut}>
          <LogOut size={14} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
