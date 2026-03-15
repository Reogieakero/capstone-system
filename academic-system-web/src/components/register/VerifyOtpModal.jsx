'use client';

import React, { useRef, useState } from 'react';
import styles from './VerifyOtpModal.module.css';
import Button from '../ui/Button';

export default function VerifyOtpModal({ isOpen, email, onVerify }) {
  const [digits, setDigits] = useState(Array(8).fill(''));
  const inputRefs = useRef([]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    const newDigits = Array(8).fill('');
    pasted.split('').forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    const focusIndex = pasted.length < 8 ? pasted.length : 7;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = digits.join('');
    if (token.length < 8) return;
    onVerify(token, () => setDigits(Array(8).fill('')));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <span className={styles.emailIcon}>✉</span>
        </div>
        <h2 className={styles.title}>Verify your email</h2>
        <p className={styles.subtitle}>
          We sent an 8-digit code to<br />
          <strong>{email}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.otpRow}>
          {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                className={styles.otpBox}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                autoFocus={i === 0}
              />
            ))}
          </div>
          <Button type="submit" disabled={digits.join('').length < 8}>
            Verify Account
          </Button>
        </form>
      </div>
    </div>
  );
}
