// components/superadmin/PackagesMode.jsx
import React from 'react';

export default function PackagesMode({ activeFile }) {
    return (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <h3>📦 Packages (Cubo Mode)</h3>
            <p>Έρχεται στο Phase C.</p>
            {activeFile && (
                <p style={{ fontSize: 12 }}>
                    Ενεργό αρχείο: <code>{activeFile.path}</code>
                </p>
            )}
        </div>
    );
}