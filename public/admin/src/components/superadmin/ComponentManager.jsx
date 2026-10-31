// components/superadmin/ComponentManager.jsx
import React, { useState, useEffect } from 'react';
import { useComponentManager } from '../../hooks/useComponentManager';
import ModeSwitch from './ModeSwitch';
import FileTreeMode from './FileTreeMode';
import CuboTreeMode from './CuboTreeMode';
import MultiSelectToolbar from './MultiSelectToolbar';
import CubosPanel from './CubosPanel';
import ContextMenu from './ContextMenu';
import FileModal from './FileModal';
import EditDrawer from './EditDrawer';
import SimilarityBadge from './SimilarityBadge';
import './ComponentManager.css';

const ComponentManager = () => {
    const cm = useComponentManager();
    const [mode, setMode] = useState('file'); // 'file' | 'cubo'

    // Φόρτωσε τα cubos όταν αλλάξει σε cubo mode (lazy)
    useEffect(() => {
        if (mode === 'cubo' && cm.cubosWithFiles.length === 0 && !cm.cuboLoading) {
            cm.loadCubosWithFiles({ only_with_files: false });
        }
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ---------- loading / error ---------- */
    if (cm.loading) {
        return (
            <div className="component-manager">
                <Header />
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    <div className="spinner" style={{
                        width: 40, height: 40, border: '4px solid #e2e8f0',
                        borderTop: '4px solid #3b82f6', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto 16px',
                    }} />
                    <p>Loading components from all domains...</p>
                </div>
            </div>
        );
    }
    if (cm.error) {
        return (
            <div className="component-manager">
                <Header />
                <div style={{
                    padding: 20, color: '#dc3545', background: '#fee2e2',
                    borderRadius: 8, margin: '20px 0',
                }}>⚠️ {cm.error}</div>
            </div>
        );
    }

    /* ---------- render ---------- */
    return (
        <>
            <div className="component-manager">
                {cm.notification.show && (
                    <div style={{
                        position: 'fixed', top: 20, right: 20,
                        padding: '12px 20px', borderRadius: 8,
                        background: cm.notification.type === 'success' ? '#10b981' : '#ef4444',
                        color: 'white', zIndex: 9999,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}>
                        {cm.notification.type === 'success' ? '✓ ' : '✗ '}{cm.notification.message}
                    </div>
                )}

                <Header />

                <ModeSwitch
                    mode={mode}
                    setMode={setMode}
                    fileCount={Object.keys(cm.filteredData).length}
                    cuboCount={cm.filteredCubos.length}
                />

                {/* SEARCH + CUBOS PANEL (ίδιο για τα δύο modes) */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                        <div className="search-container">
                            <input
                                type="text"
                                className="component-search-input"
                                placeholder="Αναζήτηση ή επίλεξε αρχείο για σύγκριση..."
                                value={cm.searchTerm}
                                onChange={(e) => cm.setSearchTerm(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {cm.selected && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                                🎯 <strong style={{ fontFamily: 'monospace' }}>{cm.selected.path}</strong>
                                {cm.targetMeta && (
                                    <> · {cm.targetMeta.lines} γραμμές · {cm.targetMeta.filetype} ·{' '}
                                        {new Date(cm.targetMeta.modified).toLocaleString()}</>
                                )}
                                {cm.targetMeta?.component?.cubos_title && (
                                    <> · <span style={{ color: '#059669' }}>
                                        Cubos: {cm.targetMeta.component.cubos_title} ({cm.targetMeta.component.cubos_folder})
                                    </span></>
                                )}
                            </div>
                        )}
                    </div>

                    {cm.selected && (
                        <CubosPanel
                            cubosList={cm.cubosList}
                            cubosChoice={cm.cubosChoice}
                            setCubosChoice={cm.setCubosChoice}
                            newTitle={cm.newTitle} setNewTitle={cm.setNewTitle}
                            newName={cm.newName}   setNewName={cm.setNewName}
                            newVersion={cm.newVersion} setNewVersion={cm.setNewVersion}
                            suggestedTitle={cm.suggestedTitle}
                            suggestedName={cm.suggestedName}
                            suggestedVersion={cm.suggestedVersion}
                            saving={cm.saving}
                            onSaveThis={() => cm.handleSaveOne(cm.selected.path)}
                            onSaveAll={cm.handleSaveAllHighlighted}
                            highlightedCount={Object.values(cm.highlighted).filter(Boolean).length}
                        />
                    )}
                </div>

                {cm.simLoading && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        ⏳ Σύγκριση περιεχομένου...
                    </div>
                )}

                {cm.similar.length > 0 && (
                    <div style={{
                        border: '1px solid #e2e8f0', borderRadius: 8, padding: 12,
                        marginBottom: 16, background: '#f8fafc',
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            🔁 Όμοια αρχεία ({cm.similar.length}) — επιλέξτε για μαζική αποθήκευση
                        </div>
                        {cm.similar.map((c) => (
                            <div key={`${c.domain}::${c.path}`} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '6px 8px', borderRadius: 6,
                                background: cm.highlighted[c.path] ? '#dbeafe' : 'transparent',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={!!cm.highlighted[c.path]}
                                    onChange={(e) =>
                                        cm.setHighlighted(p => ({ ...p, [c.path]: e.target.checked }))
                                    }
                                />
                                <SimilarityBadge value={c.similarity} nameMatch={c.name_match} />
                                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.path}</span>
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
                )}

                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                    💡 <strong>Click</strong> = επιλογή &amp; σύγκριση · <strong>Double-click</strong> = edit ·{' '}
                    <strong>Drag</strong> {mode === 'file'
                    ? 'σε φάκελο = move (same domain) / copy (cross-domain)'
                    : 'σε cubo = copy/move component · σε domain = install'}
                </div>

                {/* ===== TREE (mode switch) ===== */}
                {mode === 'file' ? (
                    <FileTreeMode
                        filteredData={cm.filteredData}
                        searchTerm={cm.searchTerm}
                        expanded={cm.expanded}
                        toggleFolder={cm.toggleFolder}
                        dragged={cm.dragged}
                        dropTarget={cm.dropTarget}
                        highlighted={cm.highlighted}
                        selected={cm.selected}
                        multiSelected={cm.multiSelected}
                        handleFileClick={cm.handleFileClick}
                        openEditor={cm.openEditor}
                        handleDragStart={cm.handleDragStart}
                        handleDragOver={cm.handleDragOver}
                        handleDragLeave={cm.handleDragLeave}
                        handleDrop={cm.handleDrop}
                        handleContextMenu={cm.handleContextMenu}
                        setDragged={cm.setDragged}
                        setDropTarget={cm.setDropTarget}
                        setSearchTerm={cm.setSearchTerm}
                    />
                ) : (
                    <CuboTreeMode
                        filteredCubos={cm.filteredCubos}
                        cuboLoading={cm.cuboLoading}
                        cuboError={cm.cuboError}
                        cuboExpanded={cm.cuboExpanded}
                        toggleCuboFolder={cm.toggleCuboFolder}
                        searchTerm={cm.searchTerm}
                        dragged={cm.dragged}
                        dropTarget={cm.dropTarget}
                        setDragged={cm.setDragged}
                        setDropTarget={cm.setDropTarget}
                        handleDragStart={cm.handleDragStart}
                        handleDropOnCubo={cm.handleDropOnCubo}
                        handleDropOnDomain={cm.handleDropOnDomain}
                        onOpenEditor={cm.openEditor}
                        onContextMenu={cm.handleContextMenu}
                        highlighted={cm.highlighted}
                        selected={cm.selected}
                    />
                )}
            </div>

            <MultiSelectToolbar
                count={cm.multiSelected.size}
                onSave={cm.handleSaveSelectedToCubos}
                onClear={() => cm.setMultiSelected(new Set())}
                saving={cm.saving}
                canSave={!!cm.cubosChoice}
            />

            {cm.contextMenu && (
                <ContextMenu
                    x={cm.contextMenu.x}
                    y={cm.contextMenu.y}
                    items={cm.buildContextMenu()}
                    onClose={() => cm.setContextMenu(null)}
                />
            )}

            <FileModal
                modal={cm.modal}
                onSubmit={cm.handleModalSubmit}
                onClose={() => cm.setModal(null)}
            />

            <EditDrawer
                editing={cm.editing}
                initialContent={cm.editContent}
                onSave={cm.handleEditSave}
                onClose={() => cm.setEditing(null)}
            />
        </>
    );
};

const Header = () => (
    <div className="component-header">
        <h2>Component Manager</h2>
        <p className="subtitle">GEN20 · SuperAdmin · Cross-domain component registry</p>
    </div>
);

export default ComponentManager;