// components/superadmin/SearchBar.jsx
//Αφαιρεί το search + target info από το ComponentManager.
import React from 'react';

const SearchBar = ({ searchTerm, onChange, selected, targetMeta }) => {
    return (
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div className="search-container">
                <input
                    type="text"
                    className="component-search-input"
                    placeholder="Αναζήτηση ή επίλεξε αρχείο για σύγκριση..."
                    value={searchTerm}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: '100%' }}
                />
            </div>

            {selected && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                    🎯 <strong style={{ fontFamily: 'monospace' }}>{selected.path}</strong>
                    {targetMeta && (
                        <>
                            {' '}· {targetMeta.lines} γραμμές · {targetMeta.filetype} ·{' '}
                            {new Date(targetMeta.modified).toLocaleString()}
                        </>
                    )}
                    {targetMeta?.component?.cubos_title && (
                        <>
                            {' '}· <span style={{ color: '#059669' }}>
                                Cubos: {targetMeta.component.cubos_title}
                            {targetMeta.component.cubos_folder
                                ? ` (${targetMeta.component.cubos_folder})`
                                : ''}
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;