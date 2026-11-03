// components/superadmin/LayoutToolbox.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PagesLayout from './superadmin/PagesLayout';
import CurrentComponents from './superadmin/CurrentComponents';
import './LayoutToolbox.css';

const LayoutToolbox = ({ onClose, selectedDomain, pageId: pageIdProp }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // ?id=5 → συγκεκριμένη σελίδα
    const pageIdFromUrl = searchParams.get('id') || '';

    const [pages, setPages] = useState([]);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);

    const domain = selectedDomain || window.location.hostname;
    const publicdb = 'gen_' + domain.replace(/\./g, '');

    // ============================================================
    // Fetch — μόνο η σελίδα από ?id= ή όλες αν δεν υπάρχει
    // ============================================================
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Pages: φίλτρο με id αν υπάρχει
            const pageFilter = pageIdFromUrl
                ? `AND id = ${parseInt(pageIdFromUrl, 10)}`
                : '';

            const pagesRes = await fetch(
                `/api/v1/maria/fa?folder=${encodeURIComponent(
                    `select * from ${publicdb}.content where type='page' ${pageFilter} order by sort asc`
                )}`
            );
            const pagesData = await pagesRes.json();

            // Relations: μόνο για τη σελίδα (αν έχουμε id)
            const relFilter = pageIdFromUrl
                ? `WHERE contentid = ${parseInt(pageIdFromUrl, 10)}`
                : '';

            const relRes = await fetch(
                `/api/v1/maria/fa?folder=${encodeURIComponent(
                    `select * from ${publicdb}.content_cubos ${relFilter} order by sort asc`
                )}`
            );
            const relData = await relRes.json();

            // Components
            const compQuery = `
                SELECT a.*
                FROM gen_admin.components a
                INNER JOIN ${publicdb}.components b ON b.id = a.id
                WHERE a.domain = '${domain}' AND a.cubosid IS NOT NULL
                GROUP BY a.cubosid
                ORDER BY a.name ASC
            `.replace(/\s+/g, ' ').trim();

            const compRes = await fetch(
                `/api/v1/maria/fa?folder=${encodeURIComponent(compQuery)}`
            );
            const compData = await compRes.json();

            if (pagesData.success && Array.isArray(pagesData.data)) {
                const rels = Array.isArray(relData.data) ? relData.data : [];
                const pagesWithComponents = pagesData.data.map(page => ({
                    ...page,
                    h:  rels.filter(r => r.content_id === page.id && r.area === 'h').map(r => r.component_id),
                    sl: rels.filter(r => r.contentid === page.id && r.area === 'sl').map(r => r.component_id),
                    m:  rels.filter(r => r.contentid === page.id && r.area === 'm').map(r => r.component_id),
                    sr: rels.filter(r => r.contentid === page.id && r.area === 'sr').map(r => r.component_id),
                    f:  rels.filter(r => r.contentid === page.id && r.area === 'f').map(r => r.component_id),
                }));
                setPages(pagesWithComponents);

                // Αν δεν υπάρχει ?id= και υπάρχει πρώτη σελίδα, βάλε το στο URL
                if (!pageIdFromUrl && pagesWithComponents.length > 0) {
                    setSearchParams(
                        { id: pagesWithComponents[0].id },
                        { replace: true }
                    );
                }
            }

            if (compData.success && Array.isArray(compData.data)) {
                setComponents(compData.data.map(c => ({ ...c, cubo: c.cubosid })));
            }
        } catch (error) {
            console.error('LayoutToolbox fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [domain, publicdb, pageIdFromUrl, setSearchParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ============================================================
    // Drag & Drop
    // ============================================================
    const handleDragStart = useCallback((e, item, type) => {
        setDraggedItem({ ...item, type });
        e.dataTransfer.setData('text/plain', JSON.stringify({ ...item, type }));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    }, []);

    const handleDragEnd = useCallback((e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedItem(null);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.currentTarget.classList.remove('drag-over');
    }, []);

    const addComponentToArea = useCallback(async (contentid, area, component_id) => {
        try {
            const response = await fetch('/api/v1/maria/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: `${publicdb}.content_cubos`,
                    params: { contentid, cubosid, area },
                }),
            });
            const result = await response.json();
            if (result.success) {
                setPages(prev => prev.map(p =>
                    p.id === contentid && !(p[area] || []).includes(cubosid)
                        ? { ...p, [area]: [...(p[area] || []), cubosid] }
                        : p
                ));
                setComponents(prev => prev.map(c =>
                    c.id === cubosid ? { ...c, instances: (c.instances || 0) + 1 } : c
                ));
            }
        } catch (e) {
            console.error('addComponent error:', e);
        }
    }, [publicdb]);

    const removeComponentFromArea = useCallback(async (contentid, area, cubosid) => {
        try {
            const query = `DELETE FROM ${publicdb}.content_components
                           WHERE contentid = ${contentid}
                           AND area = '${area}'
                           AND cubosid = ${cubosid}`;

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const result = await response.json();
            if (result.success) {
                setPages(prev => prev.map(p =>
                    p.id === contentid
                        ? { ...p, [area]: (p[area] || []).filter(id => id !== cubosid) }
                        : p
                ));
                setComponents(prev => prev.map(c =>
                    c.id === cubosid
                        ? { ...c, instances: Math.max(0, (c.instances || 0) - 1) }
                        : c
                ));
            }
        } catch (e) {
            console.error('removeComponent error:', e);
        }
    }, [publicdb]);

    const handleDrop = useCallback(async (e, pageId, area) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.type === 'component') {
                await addComponentToArea(pageId, area, data.id);
            }
        } catch (err) {
            console.error('drop error:', err);
        }
    }, [addComponentToArea]);

    const clearPage = useCallback(async (pageId) => {
        if (!window.confirm('Clear all components from this page?')) return;
        const page = pages.find(p => p.id === pageId);
        if (!page) return;
        ['h', 'sl', 'm', 'sr', 'f'].forEach(area => {
            (page[area] || []).forEach(cid => removeComponentFromArea(pageId, area, cid));
        });
    }, [pages, removeComponentFromArea]);

    const getComponentName = useCallback((cubosid) => {
        const comp = components.find(c => c.id === cubosid);
        return comp ? comp.name : `Component ${cubosid}`;
    }, [components]);

    const toggleDescription = useCallback((componentId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [componentId]: !prev[componentId],
        }));
    }, []);

    // ============================================================
    // Render
    // ============================================================
    return (
        <div className="layout-toolbox">
            {/* Header */}
            <div className="layout-toolbox-header">
                <h3>📐 Layout Toolbox</h3>
                <div className="layout-toolbox-actions">
                    <span className="layout-toolbox-domain">{domain}</span>
                    {pageIdFromUrl && (
                        <span className="layout-toolbox-page-id">page #{pageIdFromUrl}</span>
                    )}
                    <button
                        className="layout-toolbox-refresh"
                        onClick={fetchData}
                        disabled={loading}
                        title="Refresh data"
                    >
                        {loading ? '⏳' : '🔄'}
                    </button>
                    {onClose && (
                        <button className="layout-toolbox-close" onClick={onClose} title="Close">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Split layout: pages αριστερά, components δεξιά */}
            <div className="layout-toolbox-body">
                <div className="layout-toolbox-left">
                    {loading ? (
                        <div className="layout-toolbox-loading">Loading page...</div>
                    ) : (
                        <PagesLayout
                            pages={pages}
                            components={components}
                            onClearPage={clearPage}
                            onRemoveComponent={removeComponentFromArea}
                            onAddComponent={addComponentToArea}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            getComponentName={getComponentName}
                            selectedDomain={domain}
                        />
                    )}
                </div>

                <div className="layout-toolbox-right">
                    <CurrentComponents
                        components={components}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        expandedDescriptions={expandedDescriptions}
                        onToggleDescription={toggleDescription}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    />
                </div>
            </div>
        </div>
    );
};

export default LayoutToolbox;