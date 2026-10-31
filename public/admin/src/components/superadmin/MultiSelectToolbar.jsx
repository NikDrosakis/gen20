// components/superadmin/MultiSelectToolbar.jsx
import React from 'react';

const MultiSelectToolbar = ({
                                count,
                                onSave,
                                onClear,
                                saving,
                                canSave,
                            }) => {
    if (count <= 1) return null;
    return (
        <div style={{
            position: 'fixed', bottom: 20, left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e293b', color: 'white',
            padding: '12px 20px', borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex', gap: 12, alignItems: 'center',
            zIndex: 9999,
        }}>
            <span>{count} files selected</span>
            <button
                onClick={onSave}
                disabled={saving || !canSave}
                style={{
                    padding: '6px 12px',
                    background: canSave ? '#3b82f6' : '#475569',
                    border: 'none', borderRadius: 4, color: 'white',
                    cursor: canSave && !saving ? 'pointer' : 'not-allowed',
                }}
            >
                💾 Save to cubos
            </button>
            <button
                onClick={onClear}
                style={{
                    padding: '6px 12px', background: 'transparent',
                    border: '1px solid #64748b', borderRadius: 4,
                    color: 'white', cursor: 'pointer',
                }}
            >
                ✕ Clear
            </button>
        </div>
    );
};

export default MultiSelectToolbar;