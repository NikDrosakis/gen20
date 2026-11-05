// components/ComponentManager.jsx
import React, { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useComponentManager } from '../useComponentManager';
import { useUrlActiveFile } from '../useUrlActiveFile';
import { useDomainContext } from '../useDomainContext';

import FileTreeMode from './FileTreeMode';
import CuboTreeMode from './CuboTreeMode';
import CodeEditorPane from './CodeEditorPane';
import MultiSelectToolbar from './MultiSelectToolbar';
import CubosPanel from './CubosPanel';
import ContextMenu from './ContextMenu';
import FileModal from './FileModal';
import SimilarityBadge from './SimilarityBadge';

import './ComponentManager.css';

/* ------------------------------------------------------------------ */
/*  Tab helpers                                                       */
/* ------------------------------------------------------------------ */

const TAB_FILES = 'files';
const TAB_PACKAGES = 'packages';

const normalizeTab = (raw) => (raw === TAB_PACKAGES ? TAB_PACKAGES : TAB_FILES);

/* ------------------------------------------------------------------ */
/*  Presentational helpers                                            */
/* ------------------------------------------------------------------ */

const Header = () => (
    <div className="component-header">
        <h2>Component Manager</h2>
        <p className="subtitle">GEN20 · SuperAdmin · Cross-domain component registry</p>
    </div>
);

const LoadingState = () => (
    <div className="component-manager">
        <Header />
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <div
                style={{
                    width: 40,
                    height: 40,
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                }}
            />
            <p>Loading components from all domains…</p>
        </div>
    </div>
);

const ErrorState = ({ message }) => (
    <div className="component-manager">
        <Header />
        <div
            style={{
                padding: 20,
                color: '#dc3545',
                background: '#fee2e2',
                borderRadius: 8,
                margin: '20px 0',
            }}
        >
            ⚠️ {message}
        </div>
    </div>
);

const NotificationToast = ({ notification }) => {
    if (!notification?.show) return null;
    const bg =
        notification.type === 'success'
            ? '#10b981'
            : notification.type === 'info'
                ? '#3b82f6'
                : '#ef4444';
    const icon =
        notification.type === 'success' ? '✓ ' : notification.type === 'info' ? 'ℹ️ ' : '✗ ';
    return (
        <div
            style={{
                position: 'fixed',
                top: 20,
                right: 20,
                padding: '12px 20px',
                borderRadius: 8,
                background: bg,
                color: 'white',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
        >
            {icon}
            {notification.message}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

// Μετράει αρχεία σε ένα tree (domains → children → files)
const countFiles = (tree) => {
    let count = 0;
    const walk = (node) => {
        if (!node?.children) return;
        for (const child of Object.values(node.children)) {
            if (child.children) walk(child);
            else count++;
        }
    };
    Object.values(tree || {}).forEach(walk);
    return count;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const ComponentManager = () => {
    /* ─── URL: tab + active file ───────────────────────────────────── */
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = normalizeTab(searchParams.get('tab'));

    const { activeFile, openFile: openFileInUrl, closeFile: closeFileInUrl } =
        useUrlActiveFile();

    const activeFileKey = activeFile
        ? `${activeFile.domain}/${activeFile.path}`
        : null;

    /* ─── Domain context ──────────────────────────────────────────── */
    const { domain: currentDomain } = useDomainContext();

    /* ─── Single source of truth: ενιαίο hook ─────────────────────── */
    const cm = useComponentManager();

    /* ─── Editor dirty guard ──────────────────────────────────────── */
    const [editorDirty, setEditorDirty] = useState(false);

    const handleEditorClose = useCallback(() => {
        if (
            editorDirty &&
            !window.confirm('Υπάρχουν αλλαγές που δεν αποθηκεύτηκαν. Να κλείσω;')
        ) {
            return;
        }
        setEditorDirty(false);
        closeFileInUrl();
    }, [editorDirty, closeFileInUrl]);

    /* ─── Tab switch ──────────────────────────────────────────────── */
    const setMode = useCallback(
        (nextMode) => {
            setSearchParams(
                (prev) => {
                    const params = new URLSearchParams(prev);
                    params.set('tab', nextMode);
                    return params;
                },
                { replace: false }
            );

            if (
                nextMode === TAB_PACKAGES &&
                cm.cubosWithFiles.length === 0 &&
                !cm.cuboLoading
            ) {
                cm.loadCubosWithFiles({ only_with_files: false });
            }
        },
        [setSearchParams, cm]
    );

    /* ─── File click → URL + selection ────────────────────────────── */
    const handleFileClickWithUrl = useCallback(
        (e, domain, path, name) => {
            cm.handleFileClick(e, domain, path, name);

            // Single click (χωρίς modifiers) → άνοιγμα editor
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                openFileInUrl(domain, path);
            }
        },
        [cm, openFileInUrl]
    );

    const handleFileDoubleClick = useCallback(
        (domain, path, name) => {
            openFileInUrl(domain, path);
            cm.selectFile(domain, path, name);
        },
        [cm, openFileInUrl]
    );

    const handleCuboOpenFile = useCallback(
        (domain, path, name) => {
            openFileInUrl(domain, path);
            cm.selectFile(domain, path, name);
        },
        [cm, openFileInUrl]
    );

    /* ─── Editor path resolution ──────────────────────────────────── */
    const editorPath = useMemo(() => {
        if (!activeFile) return null;
        return {
            domain: activeFile.domain,
            path: activeFile.path,
            displayPath: `${activeFile.domain}/${activeFile.path}`,
            filetype: activeFile.path.split('.').pop() || '',
        };
    }, [activeFile]);

    /* ─── File tree data (IDE focus όταν υπάρχει active file) ─────── */
    const fileTreeData = useMemo(() => {
        const all = cm.filteredData || {};

        // Χωρίς active file → ΟΛΑ τα domains
        if (!activeFile?.domain) return all;

        // Με active file → μόνο το domain του
        if (all[activeFile.domain]) {
            return { [activeFile.domain]: all[activeFile.domain] };
        }

        // Fallback: δείξε όλα (ποτέ κενή οθόνη)
        return all;
    }, [cm.filteredData, activeFile]);

    /* ─── Derived ─────────────────────────────────────────────────── */
    const highlightedCount = useMemo(
        () => Object.values(cm.highlighted || {}).filter(Boolean).length,
        [cm.highlighted]
    );

    const fileCount = useMemo(() => countFiles(cm.filteredData), [cm.filteredData]);
    const cuboCount = (cm.filteredCubos || []).length;

    /* ─── Guards ──────────────────────────────────────────────────── */
    if (cm.loading) return <LoadingState />;
    if (cm.error) return <ErrorState message={cm.error} />;

    /* ─── Render ──────────────────────────────────────────────────── */
    return (
        <>
            <NotificationToast notification={cm.notification} />

            <div className="component-manager">
                <Header domain={currentDomain} />

                {/* Tabs */}
                <div className="component-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={mode === TAB_FILES}
                        className={`component-tab ${mode === TAB_FILES ? 'active' : ''}`}
                        onClick={() => setMode(TAB_FILES)}
                    >
                        📁 Files <span className="tab-count">{fileCount}</span>
                    </button>
                    <button
                        role="tab"
                        aria-selected={mode === TAB_PACKAGES}
                        className={`component-tab ${mode === TAB_PACKAGES ? 'active' : ''}`}
                        onClick={() => setMode(TAB_PACKAGES)}
                    >
                        📦 Packages <span className="tab-count">{cuboCount}</span>
                    </button>
                </div>

                {/* Search + CubosPanel */}
                <div
                    style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-start',
                        marginBottom: 16,
                    }}
                >
                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                        <div className="search-container">
                            <input
                                type="text"
                                className="component-search-input"
                                placeholder="Αναζήτηση ή επίλεξε αρχείο για σύγκριση…"
                                value={cm.searchTerm}
                                onChange={(e) => cm.setSearchTerm(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {cm.selected && (
                            <div
                                style={{
                                    marginTop: 8,
                                    fontSize: 12,
                                    color: '#475569',
                                    lineHeight: 1.6,
                                }}
                            >
                                🎯{' '}
                                <strong style={{ fontFamily: 'monospace' }}>
                                    {cm.selected.path}
                                </strong>
                                {cm.targetMeta && (
                                    <>
                                        {' '}· {cm.targetMeta.lines} γραμμές ·{' '}
                                        {cm.targetMeta.filetype} ·{' '}
                                        {new Date(cm.targetMeta.modified).toLocaleString()}
                                    </>
                                )}
                                {cm.targetMeta?.component?.cubos_title && (
                                    <>
                                        {' '}·{' '}
                                        <span style={{ color: '#059669' }}>
                                            Cubos: {cm.targetMeta.component.cubos_title} (
                                            {cm.targetMeta.component.cubos_folder})
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {cm.selected && (
                        <CubosPanel
                            cubosList={cm.cubosList}
                            cubosChoice={cm.cubosChoice}
                            setCubosChoice={cm.setCubosChoice}
                            newTitle={cm.newTitle}
                            setNewTitle={cm.setNewTitle}
                            newName={cm.newName}
                            setNewName={cm.setNewName}
                            newVersion={cm.newVersion}
                            setNewVersion={cm.setNewVersion}
                            suggestedTitle={cm.suggestedTitle}
                            suggestedName={cm.suggestedName}
                            suggestedVersion={cm.suggestedVersion}
                            saving={cm.saving}
                            onSaveThis={() => cm.handleSaveOne(cm.selected.path)}
                            onSaveAll={cm.handleSaveAllHighlighted}
                            highlightedCount={highlightedCount}
                        />
                    )}
                </div>

                {/* Similar files */}
                {cm.simLoading && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        ⏳ Σύγκριση περιεχομένου…
                    </div>
                )}

                {cm.similar.length > 0 && (
                    <div
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            padding: 12,
                            marginBottom: 16,
                            background: '#f8fafc',
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            🔁 Όμοια αρχεία ({cm.similar.length}) — επιλέξτε για μαζική
                            αποθήκευση
                        </div>
                        {cm.similar.map((c) => (
                            <div
                                key={`${c.domain}::${c.path}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '6px 8px',
                                    borderRadius: 6,
                                    background: cm.highlighted[c.path]
                                        ? '#dbeafe'
                                        : 'transparent',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={!!cm.highlighted[c.path]}
                                    onChange={(e) =>
                                        cm.setHighlighted((p) => ({
                                            ...p,
                                            [c.path]: e.target.checked,
                                        }))
                                    }
                                />
                                <SimilarityBadge
                                    value={c.similarity}
                                    nameMatch={c.name_match}
                                />
                                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                                    {c.path}
                                </span>
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: '#64748b',
                                        marginLeft: 'auto',
                                    }}
                                >
                                    {c.lines} lines ·{' '}
                                    {new Date(c.modified).toLocaleDateString()}
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

                {/* Hint */}
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                    💡 <strong>Click</strong> = επιλογή &amp; άνοιγμα editor ·{' '}
                    <strong>Ctrl+Click</strong> = multi-select ·{' '}
                    <strong>Shift+Click</strong> = range · <strong>Drag</strong>{' '}
                    {mode === TAB_FILES
                        ? 'σε φάκελο = move (same domain) / copy (cross-domain)'
                        : 'σε cubo = copy/move component · σε domain = install'}
                </div>

                {/* Main split: tree + editor */}
                <div className={`component-main ${editorPath ? 'with-editor' : ''}`}>
                    <div className="component-tree-pane">
                        {mode === TAB_FILES ? (
                            <FileTreeMode
                                data={fileTreeData}
                                expanded={cm.expanded}
                                searchTerm={cm.searchTerm}
                                dropTarget={cm.dropTarget}
                                dragged={cm.dragged}
                                highlighted={cm.highlighted}
                                selected={cm.selected}
                                multiSelected={cm.multiSelected}
                                lastClickedPath={cm.lastClickedPath}
                                onSelect={handleFileClickWithUrl}
                                onOpen={handleFileDoubleClick}
                                onContextMenu={cm.handleContextMenu}
                                onDragStart={cm.handleDragStart}
                                onDragOver={cm.handleDragOver}
                                onDragLeave={cm.handleDragLeave}
                                onDrop={cm.handleDrop}
                                toggleFolder={cm.toggleFolder}
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
                                onOpenEditor={handleCuboOpenFile}
                                onContextMenu={cm.handleContextMenu}
                                highlighted={cm.highlighted}
                                selected={cm.selected}
                                activeFileKey={activeFileKey}
                            />
                        )}
                    </div>

                    {editorPath && (
                        <div className="component-editor-pane">
                            <CodeEditorPane
                                variant="pane"
                                path={editorPath.displayPath}
                                filetype={editorPath.filetype}
                                onSave={cm.handleEditSave}
                                onClose={handleEditorClose}
                                callApi={cm.callApi}                    // ← ΝΕΟ
                                showNotification={cm.showNotification}  // ← ΝΕΟ
                                // ❌ ΣΒΗΣΕ: initialContent, onDirtyChange
                                //    (το CodeEditorPane δεν τα χρησιμοποιεί)
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Floating multi-select toolbar */}
            <MultiSelectToolbar
                count={cm.multiSelected.size}
                onSave={cm.handleSaveSelectedToCubos}
                onClear={() => cm.setMultiSelected(new Set())}
                saving={cm.saving}
                canSave={!!cm.cubosChoice}
            />

            {/* Context menu */}
            {cm.contextMenu && (
                <ContextMenu
                    x={cm.contextMenu.x}
                    y={cm.contextMenu.y}
                    items={cm.buildContextMenu()}
                    onClose={() => cm.setContextMenu(null)}
                />
            )}

            {/* File modal */}
            <FileModal
                modal={cm.modal}
                onSubmit={cm.handleModalSubmit}
                onClose={() => cm.setModal(null)}
            />
        </>
    );
};

export default ComponentManager;