// components/FileModal.jsx
//Αφαιρεί το modal (New File / New Folder / Rename) από το ComponentManager
import React, { useState, useEffect } from 'react';

const TITLES = {
    file: '📄 Νέο αρχείο',
    folder: '📁 Νέος φάκελος',
    rename: '✏️ Μετονομασία',
};

const PLACEHOLDERS = {
    file: 'MyComponent.jsx',
    folder: 'components',
    rename: 'new-name',
};

const FileModal = ({ modal, onSubmit, onClose }) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        setValue(modal?.value || '');
    }, [modal]);

    if (!modal) return null;

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onSubmit(modal.type, modal.parent, modal.target, trimmed);
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 100000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white', padding: 24, borderRadius: 12,
                    minWidth: 360, boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>{TITLES[modal.type]}</h3>
                {modal.parent && (
                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                        📁 {modal.parent}
                    </p>
                )}
                <input
                    type="text"
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmit();
                        if (e.key === 'Escape') onClose();
                    }}
                    placeholder={PLACEHOLDERS[modal.type]}
                    style={{
                        width: '100%', padding: '10px 12px',
                        border: '1px solid #e2e8f0', borderRadius: 6,
                        fontSize: 14, boxSizing: 'border-box', marginBottom: 16,
                    }}
                />
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px', border: '1px solid #e2e8f0',
                            background: 'white', borderRadius: 6, cursor: 'pointer',
                        }}
                    >Cancel</button>
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '8px 16px', border: 'none',
                            background: '#3b82f6', color: 'white',
                            borderRadius: 6, cursor: 'pointer',
                        }}
                    >{modal.type === 'rename' ? 'Rename' : 'Create'}</button>
                </div>
            </div>
        </div>
    );
};

export default FileModal;