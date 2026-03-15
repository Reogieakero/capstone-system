'use client';

import styles from './FilterTabs.module.css';

export default function FilterTabs({
  items,
  activeValue,
  onChange,
  renderLabel,
  getCount,
  className = '',
}) {
  return (
    <div className={`${styles.filterTabs} ${className}`.trim()}>
      {items.map((item) => {
        const value = String(item);
        const isActive = activeValue === value;
        const count = getCount ? getCount(item) : null;
        const label = renderLabel ? renderLabel(item) : value;

        return (
          <button
            key={value}
            type="button"
            className={`${styles.filterTab} ${isActive ? styles.filterTabActive : ''}`}
            onClick={() => onChange(value)}
          >
            {label}
            {count !== null && count !== undefined ? (
              <span className={styles.filterCount}>{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}