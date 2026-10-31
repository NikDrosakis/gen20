// components/superadmin/SimilarityBadge.jsx
import React from 'react';

const colorFor = (v) => {
    if (v >= 0.9)  return { bg: '#dcfce7', fg: '#166534' };
    if (v >= 0.75) return { bg: '#fef9c3', fg: '#854d0e' };
    if (v >= 0.55) return { bg: '#fee2e2', fg: '#991b1b' };
    return { bg: '#e2e8f0', fg: '#334155' };
};

const SimilarityBadge = ({ value, nameMatch }) => {
    const { bg, fg } = colorFor(value);
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 999, fontSize: 11,
            background: bg, color: fg, fontWeight: 600,
            minWidth: 62, justifyContent: 'center',
        }}>
            {nameMatch && '🔤'} {Math.round(value * 100)}%
        </span>
    );
};

export default SimilarityBadge;