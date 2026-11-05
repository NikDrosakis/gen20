// components/ModeSwitch.jsx
import React from 'react';

const ModeSwitch = ({ mode, setMode, fileCount, cuboCount }) => {
    const tabs = [
        { key: 'file',  label: '📁 File Mode',  count: fileCount },
        { key: 'cubo',  label: '🧊 Cubo Mode',  count: cuboCount },
    ];
    return (
        <div style={{
            display: 'inline-flex', background: '#e2e8f0',
            borderRadius: 8, padding: 3, marginBottom: 16,
        }}>
            {tabs.map(t => (
                <button
                    key={t.key}
                    onClick={() => setMode(t.key)}
                    style={{
                        padding: '8px 18px', border: 'none', borderRadius: 6,
                        cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: mode === t.key ? '#fff' : 'transparent',
                        color: mode === t.key ? '#1e293b' : '#64748b',
                        boxShadow: mode === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                >
                    {t.label}
                    {typeof t.count === 'number' && (
                        <span style={{
                            marginLeft: 6, fontSize: 11,
                            background: mode === t.key ? '#dbeafe' : '#cbd5e1',
                            color: mode === t.key ? '#1d4ed8' : '#475569',
                            padding: '1px 6px', borderRadius: 10,
                        }}>{t.count}</span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default ModeSwitch;