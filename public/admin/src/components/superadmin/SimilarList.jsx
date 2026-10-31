// components/superadmin/SimilarList.jsx
import React from 'react';
import SimilarityBadge from './SimilarityBadge';

export default function SimilarList({ similar, highlighted, onToggle }) {
    if (!similar?.length) return null;

    return (
        <div style={{
            border: '1px solid #e2e8f0', borderRadius: 8, padding: 12,
            marginBottom: 16, background: '#f8fafc',
        }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                🔁 Όμοια αρχεία ({similar.length}) — επιλέξτε για μαζική αποθήκευση
            </div>
            {similar.map((c) => (
                <div
                    key={`${c.domain}::${c.path}`}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '6px 8px', borderRadius: 6,
                        background: highlighted[c.path] ? '#dbeafe' : 'transparent',
                    }}
                >
                    <input
                        type="checkbox"
                        checked={!!highlighted[c.path]}
                        onChange={(e) => onToggle(c.path, e.target.checked)}
                    />
                    <SimilarityBadge value={c.similarity} nameMatch={c.name_match} />
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {c.path}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b', marginLeft: 'auto' }}>
                        {c.lines} lines · {new Date(c.modified).toLocaleDateString()}
                    </span>
                    {c.component?.cubos_title && (
                        <span style={{ fontSize: 11, color: '#059669' }}>
                            → {c.component.cubos_title}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}