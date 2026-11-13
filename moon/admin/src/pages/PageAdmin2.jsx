import React, { useState, useEffect, useCallback } from 'react';
import './PageAdmin2.css';

const currentDomain = window.location.hostname;
const API_BASE = window.location.origin;

// --------------------------------------------------
// Helper: fetch JSON με error handling
// --------------------------------------------------
async function fetchJson(url) {
    try {
        const r = await fetch(url, { cache: 'no-cache' });
        if (!r.ok) return null;
        return await r.json();
    } catch {
        return null;
    }
}

// --------------------------------------------------
// Helper: φίλτρο για έγκυρα cubos
// --------------------------------------------------
function isValidCubo(cubo) {
    return (
        cubo &&
        cubo.name &&
        !cubo.name.includes('.') &&
        !cubo.name.startsWith('.')
    );
}

// --------------------------------------------------
// Αριστερά — Available (astra/cubos → astralist.json)
// --------------------------------------------------
const AvailableCubos = ({ cubos, loading, onInstall }) => (
    <div className="sidebar-panel left-panel">
        <div className="panel-header">
            <h4>Available (astra/cubos)</h4>
            <span className="count-badge">{cubos.length}</span>
        </div>

        {loading ? (
            <div className="loading-state">Loading available cubos...</div>
        ) : cubos.length === 0 ? (
            <div className="empty-state">No cubos in astra/cubos</div>
        ) : (
            <ul className="cubo-list">
                {cubos.map(cubo => (
                    <li
                        key={cubo.name}
                        className="cubo-item available-item"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify({
                                ...cubo,
                                source: 'astra'
                            }));
                            e.dataTransfer.effectAllowed = 'copy';
                        }}
                        style={{
                            borderLeft: cubo.color
                                ? `4px solid ${cubo.color}`
                                : '4px solid transparent'
                        }}
                    >
                        <span className="cubo-icon">
                            {cubo.color ? '🎨' : '📦'}
                        </span>
                        <span className="cubo-name">{cubo.title || cubo.name}</span>
                        <span className="cubo-deps">{cubo.files} files</span>
                        <button
                            className="install-btn"
                            onClick={() => onInstall(cubo)}
                        >
                            Install
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

// --------------------------------------------------
// Δεξιά — Installed (moon/<domain>/src/cubos → moonlist.json)
// --------------------------------------------------
const InstalledCubos = ({ cubos, loading, onDrop, onDragOver, onDragLeave }) => (
    <div
        className="sidebar-panel right-panel"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
        <div className="panel-header">
            <h4>Installed (moon/{currentDomain})</h4>
            <span className="count-badge">{cubos.length}</span>
        </div>

        {loading ? (
            <div className="loading-state">Loading installed cubos...</div>
        ) : cubos.length === 0 ? (
            <div className="empty-state">
                No cubos installed yet.
                <br />
                <small>Drag here to install.</small>
            </div>
        ) : (
            <ul className="cubo-list">
                {cubos.map(cubo => (
                    <li
                        key={cubo.name}
                        className="cubo-item installed-item"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify({
                                ...cubo,
                                source: 'moon'
                            }));
                            e.dataTransfer.effectAllowed = 'move';
                        }}
                        style={{
                            borderLeft: cubo.color
                                ? `4px solid ${cubo.color}`
                                : '4px solid transparent'
                        }}
                    >
                        <span className="cubo-icon">
                            {cubo.color ? '🎨' : '📦'}
                        </span>
                        <span className="cubo-name">{cubo.title || cubo.name}</span>
                        <span className="cubo-status">✅</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

// --------------------------------------------------
// Κύριο Component
// --------------------------------------------------
const PageAdmin2 = ({ pageId, lockedPageId, jsonData, onJsonChange }) => {
    const [selectedPageId, setSelectedPageId] = useState(lockedPageId ?? pageId ?? null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Αριστερά — astralist.json
    const [availableCubos, setAvailableCubos] = useState([]);
    const [loadingAvailable, setLoadingAvailable] = useState(true);

    // Δεξιά — moonlist.json
    const [installedCubos, setInstalledCubos] = useState([]);
    const [loadingInstalled, setLoadingInstalled] = useState(true);

    // --------------------------------------------------
    // Φόρτωση available — astralist.json (κοινό, astra/cubos)
    // --------------------------------------------------
    useEffect(() => {
        let cancelled = false;
        setLoadingAvailable(true);

        fetchJson(`${API_BASE}/data/${currentDomain}/astralist.json`).then(data => {
            if (cancelled) return;
            const cubos = (data?.cubos || []).filter(isValidCubo);
            setAvailableCubos(cubos);
            setLoadingAvailable(false);
        });

        return () => { cancelled = true; };
    }, []);

    // --------------------------------------------------
    // Φόρτωση installed — moonlist.json (ανά domain, moon/<domain>/src/cubos)
    // --------------------------------------------------
    useEffect(() => {
        let cancelled = false;
        setLoadingInstalled(true);

        fetchJson(`${API_BASE}/data/${currentDomain}/moonlist.json`).then(data => {
            if (cancelled) return;
            const cubos = (data?.cubos || []).filter(isValidCubo);
            setInstalledCubos(cubos);
            setLoadingInstalled(false);
        });

        return () => { cancelled = true; };
    }, []);

    // --------------------------------------------------
    // Pages (mock — θα αντικατασταθεί με πραγματικό fetch)
    // --------------------------------------------------
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setPages([
                { id: 147, name: 'dasein', h: [], sl: [], m: [], sr: [], f: [] },
                { id: 148, name: 'poetry', h: [], sl: [], m: [], sr: [], f: [] }
            ]);
            setLoading(false);
        }, 300);
    }, []);

    // --------------------------------------------------
    // Drag & Drop
    // --------------------------------------------------
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        e.currentTarget.classList.add('drag-over');
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.currentTarget.classList.remove('drag-over');
    }, []);

    const handleDropOnArea = useCallback((e, pageId, area) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            console.log(`Drop ${data.name} (${data.source}) → area ${area} of page ${pageId}`);
            // TODO: onJsonChange(...)
        } catch (err) {
            console.error('Invalid drop:', err);
        }
    }, []);

    // --------------------------------------------------
    // Install — astra → moon
    // --------------------------------------------------
    const handleInstall = async (cubo) => {
        console.log(`Install: ${cubo.name}`);

        // Optimistic UI
        setInstalledCubos(prev => {
            if (prev.find(c => c.name === cubo.name)) return prev;
            return [{ ...cubo, status: 'installed' }, ...prev];
        });

        // TODO: πραγματικό install
    };

    const handleDropOnInstalled = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            if (data.source === 'astra') {
                handleInstall(data);
            }
        } catch (err) {
            console.error('Invalid drop on installed:', err);
        }
    };

    // --------------------------------------------------
    // Render
    // --------------------------------------------------
    if (loading) return <div className="loading-state">Loading layout manager...</div>;

    const selectedPage = pages.find(p => Number(p.id) === Number(selectedPageId)) || pages[0];

    return (
        <div className="page-admin2-container">
            {/* Αριστερά — Available (astra/cubos → astralist.json) */}
            <AvailableCubos
                cubos={availableCubos}
                loading={loadingAvailable}
                onInstall={handleInstall}
            />

            {/* Κέντρο — Page Builder */}
            <div className="center-panel">
                <div className="page-tabs">
                    {pages.map(page => (
                        <button
                            key={page.id}
                            className={`page-tab ${selectedPageId === page.id ? 'active' : ''}`}
                            onClick={() => setSelectedPageId(page.id)}
                        >
                            {page.name} (#{page.id})
                        </button>
                    ))}
                </div>

                {selectedPage && (
                    <div className="page-content-box">
                        <div className="page-header">
                            <h3>{selectedPage.name} (#{selectedPage.id})</h3>
                            <div className="header-actions">
                                <button className="clear-btn">Clear</button>
                                <button className="auto-set-btn">Auto-set</button>
                            </div>
                        </div>

                        <div className="page-areas">
                            <div
                                className="area header-area"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDropOnArea(e, selectedPage.id, 'h')}
                            >
                                <div className="area-label">Header (H) - Nav</div>
                                <div className="area-content"></div>
                            </div>

                            <div className="area-row">
                                <div
                                    className="area"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDropOnArea(e, selectedPage.id, 'sl')}
                                >
                                    <div className="area-label">Sidebar Left (SL)</div>
                                    <div className="area-content"></div>
                                </div>
                                <div
                                    className="area main-area"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDropOnArea(e, selectedPage.id, 'm')}
                                >
                                    <div className="area-label">Main (M)</div>
                                    <div className="area-content"></div>
                                </div>
                                <div
                                    className="area"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDropOnArea(e, selectedPage.id, 'sr')}
                                >
                                    <div className="area-label">Sidebar Right (SR)</div>
                                    <div className="area-content"></div>
                                </div>
                            </div>

                            <div
                                className="area footer-area"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDropOnArea(e, selectedPage.id, 'f')}
                            >
                                <div className="area-label">Footer (F)</div>
                                <div className="area-content"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Δεξιά — Installed (moon → moonlist.json) */}
            <InstalledCubos
                cubos={installedCubos}
                loading={loadingInstalled}
                onDrop={handleDropOnInstalled}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            />
        </div>
    );
};

export default PageAdmin2;