// components/CubosPanel.jsx
import React from 'react';

const CubosPanel = ({
                        cubosList,
                        cubosChoice, setCubosChoice,
                        newTitle, setNewTitle,
                        newName, setNewName,
                        suggestedTitle,
                        suggestedName,
                        suggestedVersion,
                        newVersion, setNewVersion,
                        saving,
                        onSaveThis,
                        onSaveAll,
                        highlightedCount,
                    }) => {
    const canSaveThis = !!cubosChoice && !saving;
    const canSaveAll = !!cubosChoice && !saving && highlightedCount > 1;

    return (
        <div className="cm-cubos-panel">
            <div className="cm-cubos-title">📦 Cubos σύνδεση</div>

            <select
                value={cubosChoice}
                onChange={(e) => setCubosChoice(e.target.value)}
                className="cm-cubos-select"
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
                <div className="cm-cubos-new-fields">
                    <input
                        type="text"
                        placeholder="Title (human-readable)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="cm-cubos-input"
                    />
                    <input
                        type="text"
                        placeholder="Name (slug, π.χ. slides-pro)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="cm-cubos-input cm-mono"
                    />
                    <input
                        type="text"
                        placeholder="Version (auto αν κενό)"
                        value={newVersion || ''}
                        onChange={(e) => setNewVersion(e.target.value)}
                        className="cm-cubos-input cm-mono"
                    />
                    {suggestedName && !newName && (
                        <div className="cm-cubos-hint">
                            💡 Suggested: <code>{suggestedName}</code>
                        </div>
                    )}
                </div>
            )}

            <div className="cm-cubos-actions">
                <button
                    onClick={onSaveThis}
                    disabled={!canSaveThis}
                    className="cm-cubos-btn cm-btn-primary"
                >
                    💾 Save this file
                </button>
                <button
                    onClick={onSaveAll}
                    disabled={!canSaveAll}
                    className="cm-cubos-btn cm-btn-success"
                >
                    💾 Save all highlighted ({highlightedCount})
                </button>
            </div>

            <div className="cm-cubos-footer">
                Αντιγραφή σε <code>/var/www/gs/cubos/&lt;folder&gt;/</code>
            </div>
        </div>
    );
};

export default CubosPanel;