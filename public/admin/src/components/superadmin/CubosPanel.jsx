// components/superadmin/CubosPanel.jsx
import React from 'react';

const CubosPanel = ({
                        cubosList,
                        cubosChoice, setCubosChoice,
                        newTitle, setNewTitle,
                        newName, setNewName,
                        suggestedTitle,
                        suggestedName,
                        saving,
                        onSaveThis,
                        onSaveAll,
                        highlightedCount,
                    }) => {
    const canSaveThis = !!cubosChoice && !saving;
    const canSaveAll = !!cubosChoice && !saving && highlightedCount > 1;

    return (
        <div style={{
            flex: '0 0 340px',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 14,
            background: '#f8fafc',
        }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>📦 Cubos σύνδεση</div>

            <select
                value={cubosChoice}
                onChange={(e) => setCubosChoice(e.target.value)}
                style={{
                    width: '100%', padding: '8px 10px',
                    border: '1px solid #e2e8f0', borderRadius: 6,
                    marginBottom: 8, background: 'white',
                }}
            >
                <option value="">— Διάλεξε υπάρχον cubos —</option>
                {cubosList.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name || c.title || c.folder}
                    </option>
                ))}
                <option value="new">➕ Νέο cubos record</option>
            </select>

            {cubosChoice === 'new' && (
                <>
                    <input
                        type="text"
                        placeholder="Title (human-readable)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 10px',
                            border: '1px solid #e2e8f0', borderRadius: 6,
                            marginBottom: 6, boxSizing: 'border-box',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Name (slug, π.χ. slides-pro)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 10px',
                            border: '1px solid #e2e8f0', borderRadius: 6,
                            marginBottom: 8, boxSizing: 'border-box',
                            fontFamily: 'monospace',
                        }}
                    />
                    {suggestedName && !newName && (
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                            💡 Suggested: <code>{suggestedName}</code>
                        </div>
                    )}
                </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                    onClick={onSaveThis}
                    disabled={!canSaveThis}
                    style={{
                        padding: '9px 12px', border: 'none', borderRadius: 6,
                        background: canSaveThis ? '#3b82f6' : '#cbd5e1',
                        color: 'white',
                        cursor: canSaveThis ? 'pointer' : 'not-allowed',
                    }}
                >💾 Save this file</button>
                <button
                    onClick={onSaveAll}
                    disabled={!canSaveAll}
                    style={{
                        padding: '9px 12px', border: 'none', borderRadius: 6,
                        background: canSaveAll ? '#10b981' : '#cbd5e1',
                        color: 'white',
                        cursor: canSaveAll ? 'pointer' : 'not-allowed',
                    }}
                >💾 Save all highlighted ({highlightedCount})</button>
            </div>

            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                Αντιγραφή σε <code>/var/www/gs/cubos/&lt;folder&gt;/</code>
            </div>
        </div>
    );
};

export default CubosPanel;