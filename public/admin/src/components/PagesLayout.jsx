// PagesLayout.jsx
import React, { useMemo } from 'react';

const PagesLayout = ({
                         pages,
                         components,
                         onClearPage,
                         onRemoveComponent,
                         onAddComponent,
                         onDragOver,
                         onDragLeave,
                         onDrop,
                         getComponentName,
                         selectedDomain,
                         selectedPageId,     // ✅ νέο
                         onSelectPage,       // ✅ νέο
                         lockedPageId = null // ✅ ΝΕΟ — αν οριστεί, κρύβεται το dropdown
                     }) => {
    const isLocked = lockedPageId != null;

    // ✅ ΜΟΝΟ η επιλεγμένη σελίδα
    const selectedPage = useMemo(
        () => pages.find(p => Number(p.id) === Number(selectedPageId)) || null,
        [pages, selectedPageId]
    );

    // ✅ Αν locked αλλά η σελίδα δεν υπάρχει στο pages (π.χ. type='post')
    const lockedPageMissing = isLocked && !selectedPage;

    return (
        <div className="pages-panel">
            <div className="panel-title">
                Content Pages ({pages.length})

                {isLocked ? (
                    // ✅ Locked: μόνο ετικέτα, όχι dropdown
                    <span style={{ marginLeft: 12, fontWeight: 'bold' }}>
                        {selectedPage
                            ? `${selectedPage.name} (#${selectedPage.id})`
                            : `#${lockedPageId}`}
                    </span>
                ) : (
                    // ✅ Unlocked: κανονικό dropdown
                    <select
                        value={selectedPageId ?? ''}
                        onChange={(e) => onSelectPage(e.target.value ? Number(e.target.value) : null)}
                        style={{ marginLeft: 12 }}
                    >
                        <option value="">— Select page —</option>
                        {pages.map(page => (
                            <option key={page.id} value={page.id}>
                                {page.name} (#{page.id})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* ✅ Locked αλλά δεν βρέθηκε σελίδα */}
            {lockedPageMissing && (
                <div className="no-page-selected" style={{ padding: 20, color: '#888' }}>
                    Αυτό το content δεν είναι σελίδα (type ≠ page) — δεν έχει layout.
                </div>
            )}

            {/* ✅ Καμία σελίδα αν δεν επιλεγεί (unlocked) */}
            {!isLocked && !selectedPage && (
                <div className="no-page-selected" style={{ padding: 20, color: '#888' }}>
                    Select a page to configure its layout.
                </div>
            )}

            {/* ✅ Μόνο η επιλεγμένη */}
            {selectedPage && (
                <div key={selectedPage.id} className="page-box">
                    <div className="page-header">
                        <div>
                            <a href={`/${selectedPage.name}`} className="page-link">
                                {selectedPage.name}
                            </a>
                            <button
                                className="clear-button"
                                onClick={() => onClearPage(selectedPage.id)}
                            >
                                Clear
                            </button>
                        </div>
                        <button
                            className="auto-set-button"
                            onClick={() => alert('Auto-set not implemented yet')}
                        >
                            Auto-set
                        </button>
                    </div>

                    <div className="area-container">
                        <div
                            className="area"
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => onDrop(e, selectedPage.id, 'h')}
                        >
                            <div className="area-title">Header (H)</div>
                            {(selectedPage.h || []).map(compId => (
                                <div key={compId} className="component-item">
                                    {getComponentName(compId)}
                                    <button
                                        className="remove-button"
                                        onClick={() => onRemoveComponent(selectedPage.id, 'h', compId)}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="area-row">
                            <div
                                className="area"
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, selectedPage.id, 'sl')}
                            >
                                <div className="area-title">Sidebar Left (SL)</div>
                                {(selectedPage.sl || []).map(compId => (
                                    <div key={compId} className="component-item">
                                        {getComponentName(compId)}
                                        <button
                                            className="remove-button"
                                            onClick={() => onRemoveComponent(selectedPage.id, 'sl', compId)}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="area"
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, selectedPage.id, 'm')}
                            >
                                <div className="area-title">Main (M)</div>
                                {(selectedPage.m || []).map(compId => (
                                    <div key={compId} className="component-item">
                                        {getComponentName(compId)}
                                        <button
                                            className="remove-button"
                                            onClick={() => onRemoveComponent(selectedPage.id, 'm', compId)}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="area"
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, selectedPage.id, 'sr')}
                            >
                                <div className="area-title">Sidebar Right (SR)</div>
                                {(selectedPage.sr || []).map(compId => (
                                    <div key={compId} className="component-item">
                                        {getComponentName(compId)}
                                        <button
                                            className="remove-button"
                                            onClick={() => onRemoveComponent(selectedPage.id, 'sr', compId)}
                                        >
                                            ✖
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className="area"
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => onDrop(e, selectedPage.id, 'f')}
                        >
                            <div className="area-title">Footer (F)</div>
                            {(selectedPage.f || []).map(compId => (
                                <div key={compId} className="component-item">
                                    {getComponentName(compId)}
                                    <button
                                        className="remove-button"
                                        onClick={() => onRemoveComponent(selectedPage.id, 'f', compId)}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagesLayout;