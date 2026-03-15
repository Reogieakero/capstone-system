"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectField.module.css';

function normalizeOption(option) {
  if (typeof option === 'string') {
    return {
      value: option,
      label: option,
    };
  }

  return option;
}

export default function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  allowEmptySelection = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const rootClassName = className ? `${styles.fieldGroup} ${className}` : styles.fieldGroup;
  const normalizedOptions = options.map(normalizeOption);
  const selectedOption = normalizedOptions.find((option) => option.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const hasExplicitEmptyOption = normalizedOptions.some((option) => option.value === '');
  const renderedOptions = hasExplicitEmptyOption
    ? normalizedOptions
    : [{ value: '', label: placeholder }, ...normalizedOptions];

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const emitChange = (nextValue) => {
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  const handleOptionSelect = (optionValue) => {
    emitChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (disabled) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((current) => !current);
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`${rootClassName} ${isOpen ? styles.open : ''} ${value ? styles.hasValue : styles.emptyValue}`}
    >
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        className={styles.selectField}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={placeholder}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={styles.valueLabel}>{displayLabel}</span>
      </button>
      <span className={styles.indicator} aria-hidden="true"></span>
      <span className={styles.morphLine}></span>

      {isOpen ? (
        <div className={styles.optionsPanel} role="listbox" aria-label={placeholder}>
          {renderedOptions
            .filter((option) => allowEmptySelection || option.value !== '')
            .map((option) => (
            <button
              key={`${name}-${option.value || 'empty'}`}
              type="button"
              className={`${styles.optionItem} ${value === option.value ? styles.selectedOption : ''}`}
              onClick={() => handleOptionSelect(option.value)}
            >
              {option.label}
            </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}