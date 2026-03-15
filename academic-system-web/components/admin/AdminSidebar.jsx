'use client';

import { 
  LayoutGrid, 
  Users,
  Folder // Changed from HardDrive to Folder
} from 'lucide-react';
import { ADMIN_NAV_ITEMS } from '../../constants/admin.constants';
import styles from './AdminSidebar.module.css';

const navIcons = {
  overview: LayoutGrid,
  users: Users,
  storage: Folder, // Updated mapping
};

export default function AdminSidebar({
  activePage,
  collapsed,
  onNavigate,
  onToggle,
}) {
  const handleSidebarClick = (event) => {
    if (event.target.closest('button')) return;
    onToggle();
  };

  // Group items by section (System vs Vault)
  const systemItems = ADMIN_NAV_ITEMS.filter(item => item.section === 'system');
  const vaultItems = ADMIN_NAV_ITEMS.filter(item => item.section === 'vault');

  const renderNavGroup = (items, title) => (
    <div className={styles.navGroup}>
      {title && <p className={styles.sectionTitle}>{title}</p>}
      <nav className={styles.nav}>
        {items.map(({ key, label, iconKey }) => {
          const Icon = navIcons[iconKey] || LayoutGrid;
          const isActive = activePage === key;

          return (
            <button
              key={key}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onNavigate(key)}
              title={label}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className={styles.navLabel}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className={`${styles.sidebarShell} ${collapsed ? styles.shellCollapsed : ''}`}>
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
        onClick={handleSidebarClick}
      >
        <div className={styles.scrollArea}>
          {renderNavGroup(systemItems, "System")}
          
          {/* Vault Section */}
          <div className={styles.sectionDivider}>
            {renderNavGroup(vaultItems, "Vault")}
          </div>
        </div>
      </aside>
    </div>
  );
}