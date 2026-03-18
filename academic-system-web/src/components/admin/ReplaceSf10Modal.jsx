import React from 'react';

export default function ReplaceSf10Modal({ open, onConfirm, onCancel, fileName, studentName, sectionName }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <h2 style={{ marginBottom: 12 }}>Replace Existing SF10 File?</h2>
        <p style={{ marginBottom: 24 }}>
          An SF10 file for <b>{studentName}</b> ({sectionName}) already exists.<br />
          Do you want to replace it with <b>{fileName}</b>?
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5', color: '#333', fontWeight: 500 }}>No</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#228be6', color: '#fff', fontWeight: 600 }}>Yes, Replace</button>
        </div>
      </div>
    </div>
  );
}
