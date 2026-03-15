'use client';

import { useEffect, useRef, useState } from 'react';

function OtpDigit({ value, inputRef, onChange, onKeyDown, onPaste }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '30px',
        height: '38px',
        border: `1.5px solid ${focused ? 'oklch(0.623 0.214 259.815)' : 'rgba(0,0,0,0.12)'}`,
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#0f172a',
        background: '#ffffff',
        outline: 'none',
        boxShadow: focused ? '0 0 0 3px rgba(66, 99, 235, 0.15)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    />
  );
}

export default function OtpToastBody({ email, onVerify }) {
  const [digits, setDigits] = useState(Array(8).fill(''));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 7) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);
    const next = Array(8).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 7)]?.focus();
  };

  const handleSubmit = async () => {
    const token = digits.join('');
    if (token.length < 8 || loading) return;
    setLoading(true);
    await onVerify(token, () => {
      setDigits(Array(8).fill(''));
      setLoading(false);
      inputRefs.current[0]?.focus();
    });
  };

  const isReady = digits.join('').length === 8;

  return (
    <div style={{ paddingBottom: '4px' }}>
      <p style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.45)', marginBottom: '10px', lineHeight: 1.4 }}>
        Sent to <strong style={{ color: '#0f172a', fontWeight: 500 }}>{email}</strong>
      </p>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        {digits.map((d, i) => (
          <OtpDigit
            key={i}
            value={d}
            inputRef={(el) => (inputRefs.current[i] = el)}
            onChange={(v) => handleChange(i, v)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isReady || loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: '1.75rem',
          padding: '0 0.75rem',
          borderRadius: '9999px',
          border: 0,
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: !isReady || loading ? 'default' : 'pointer',
          color: 'oklch(0.623 0.214 259.815)',
          backgroundColor: 'color-mix(in oklch, oklch(0.623 0.214 259.815) 15%, transparent)',
          opacity: !isReady || loading ? 0.55 : 1,
          transition: 'opacity 150ms ease',
        }}
      >
        {loading ? 'Verifying…' : 'Verify Account'}
      </button>
    </div>
  );
}
