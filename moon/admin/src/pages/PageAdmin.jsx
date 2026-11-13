// PageAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PagesLayout from '../components/PagesLayout';
import SrcFilesList from '../components/SrcFilesList';
import "./PageAdmin.css";

const PageAdmin = ({ pageId, lockedPageId, jsonData, onJsonChange }) => {
    const [selectedPageId, setSelectedPageId] = useState(lockedPageId ?? pageId ?? null);
    const [pages, setPages] = useState([]);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const [selectedDomain, setSelectedDomain] = useState('');

    const currentDomain = window.location.hostname;

    useEffect(() => {
        setSelectedDomain(currentDomain);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const pagesRes = await fetch(`/api/v1/maria/fa?folder=select * from ${publicdb}.content where type='page' order by sort asc`);
            const pagesData = await pagesRes.json();

            const relRes = await fetch(`/api/v1/maria/fa?folder=select * from ${publicdb}.content_cubos order by sort asc`);
            const relData = await relRes.json();

            if (pagesData.success) {
                const pagesWithComponents = pagesData.data.map(page => ({
                    ...page,
                    h: relData.data?.filter(r => Number(r.contentid) === Number(page.id) && r.area === 'h').map(r => Number(r.cubosid)) || [],
                    sl: relData.data?.filter(r => Number(r.contentid) === Number(page.id) && r.area === 'sl').map(r => Number(r.cubosid)) || [],
                    m: relData.data?.filter(r => Number(r.contentid) === Number(page.id) && r.area === 'm').map(r => Number(r.cubosid)) || [],
                    sr: relData.data?.filter(r => Number(r.contentid) === Number(page.id) && r.area === 'sr').map(r => Number(r.cubosid)) || [],
                    f: relData.data?.filter(r => Number(r.contentid) === Number(page.id) && r.area === 'f').map(r => Number(r.cubosid)) || []
                }));
                setPages(pagesWithComponents);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = useCallback((e, item, type) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ ...item, type }));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    }, []);

    const handleDragEnd = useCallback((e) => {
        e.currentTarget.classList.remove('dragging');
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.currentTarget.classList.remove('drag-over');
    }, []);

    // Resolve cubosid: lowercase χωρίς extension → SELECT → INSERT αν λείπει
    const resolveCubo = useCallback(async (rawName, rawPath) => {
        const name = String(rawName || '')
            .replace(/\.jsx$/i, '')
            .toLowerCase();

        if (!name) throw new Error('Invalid component name');

        const selectQuery = `SELECT id FROM ${publicdb}.cubos WHERE name = '${name.replace(/'/g, "''")}' LIMIT 1`;
        const selectRes = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(selectQuery)}`);
        const selectData = await selectRes.json();

        if (selectData.success && Array.isArray(selectData.data) && selectData.data.length > 0) {
            return Number(selectData.data[0].id);
        }

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const path = String(rawPath || name).replace(/^\/+/, '');

        const insertRes = await fetch('/api/v1/maria/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table: `${publicdb}.cubos`,
                params: { name, path, status: 'active', created: now, updated: now }
            })
        });

        const insertJson = await insertRes.json();
        console.log('INSERT cubos →', insertJson);

        // ✅ Διορθωμένο: verifyRes (όχι verifRyes)
        const verifyRes = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(selectQuery)}`);
        const verifyData = await verifyRes.json();
        console.log('verifyData', verifyData);

        if (!verifyData.success || !Array.isArray(verifyData.data) || verifyData.data.length === 0) {
            throw new Error(`Could not register cubo: ${name}`);
        }

        return Number(verifyData.data[0].id);
    }, [publicdb]);

    // Add: resolve cubo + insert στο content_cubos
    const addComponentToArea = useCallback(async (pageId, area, item) => {
        try {
            const cubosid = await resolveCubo(item.name, item.path);

            const existing = pages.find(p => Number(p.id) === Number(pageId))?.[area] || [];
            if (existing.some(id => Number(id) === cubosid)) {
                return;
            }

            const sortQuery = `SELECT COALESCE(MAX(sort), -1) + 1 AS nextSort FROM ${publicdb}.content_cubos WHERE contentid = ${Number(pageId)} AND area = '${area}'`;
            const sortRes = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(sortQuery)}`);
            const sortData = await sortRes.json();
            const sort = Number(sortData.data?.[0]?.nextSort ?? 0);

            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

            const response = await fetch('/api/v1/maria/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: `${publicdb}.content_cubos`,
                    params: {
                        contentid: Number(pageId),   // ✅ contentid
                        cubosid: cubosid,             // ✅ cubosid
                        area,                         // ✅ h/sl/m/sr/f
                        sort,
                        created: now,
                        updated: now
                    }
                })
            });

            const result = await response.json();
            console.log('insert content_cubos →', result);

            if (result.success) {
                setPages(prevPages => prevPages.map(page => {
                    if (Number(page.id) === Number(pageId)) {
                        const ex = page[area] || [];
                        if (!ex.some(id => Number(id) === cubosid)) {
                            return { ...page, [area]: [...ex, cubosid] };
                        }
                    }
                    return page;
                }));

                setComponents(prev => {
                    const found = prev.find(c => Number(c.id) === cubosid);
                    if (found) {
                        return prev.map(comp =>
                            Number(comp.id) === cubosid
                                ? { ...comp, instances: Number(comp.instances || 0) + 1 }
                                : comp
                        );
                    }
                    return [...prev, { id: cubosid, name: item.name, instances: 1 }];
                });
            } else {
                console.error('Insert content_cubos failed:', result.error);
            }
        } catch (error) {
            console.error('Error adding component:', error);
        }
    }, [publicdb, pages, resolveCubo]);

    const handleDrop = useCallback(async (e, pageId, area) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        console.log('🎯 DROP!', { pageId, area });   // ← ΝΕΟ

        const raw = e.dataTransfer.getData('text/plain');
        console.log('📦 RAW:', raw);                  // ← ΝΕΟ
        if (!raw) {
            console.log('❌ No raw data');
            return;
        }

        let data;
        try {
            data = JSON.parse(raw);
            console.log('📦 PARSED:', data);          // ← ΝΕΟ
        } catch (err) {
            console.log('❌ JSON parse error:', err);
            return;
        }

        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
            if (item.type === 'component') {
                console.log('➡️ Adding:', item);     // ← ΝΕΟ
                await addComponentToArea(pageId, area, item);
            } else {
                console.log('⏭️ Skipping (type != component):', item.type);
            }
        }
    }, [addComponentToArea]);
    // Remove
    const removeComponentFromArea = useCallback(async (content_id, area, cubosid) => {
        try {
            const query = `DELETE FROM ${publicdb}.content_cubos
                           WHERE contentid = ${Number(content_id)}
                             AND area = '${area}'
                             AND cubosid = ${Number(cubosid)}`;

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            const result = await response.json();
            console.log('delete →', result);

            if (result.success) {
                setPages(prevPages => prevPages.map(page => {
                    if (Number(page.id) === Number(content_id)) {
                        const existing = page[area] || [];
                        return { ...page, [area]: existing.filter(id => Number(id) !== Number(cubosid)) };
                    }
                    return page;
                }));

                setComponents(prev => prev.map(comp =>
                    Number(comp.id) === Number(cubosid)
                        ? { ...comp, instances: Math.max(0, Number(comp.instances || 0) - 1) }
                        : comp
                ));
            }
        } catch (error) {
            console.error('Error removing component:', error);
        }
    }, [publicdb]);

    const clearPage = useCallback(async (pageId) => {
        if (window.confirm('Clear all components from this page?')) {
            const page = pages.find(p => Number(p.id) === Number(pageId));
            if (page) {
                const areas = ['h', 'sl', 'm', 'sr', 'f'];
                areas.forEach(area => {
                    (page[area] || []).forEach(cubosid => {
                        removeComponentFromArea(pageId, area, cubosid);
                    });
                });
            }
        }
    }, [pages, removeComponentFromArea]);

    const getComponentName = useCallback((cubosid) => {
        const comp = components.find(c => Number(c.id) === Number(cubosid));
        return comp ? comp.name : `Component ${cubosid}`;
    }, [components]);

    const toggleDescription = useCallback((componentId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [componentId]: !prev[componentId]
        }));
    }, []);

    if (loading) {
        return <div className="loading-state">Loading layout manager...</div>;
    }

    return (
        <div className="layout-container">
            <div className="layout-wrapper">
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
                    selectedDomain={selectedDomain}
                    selectedPageId={selectedPageId}
                    onSelectPage={setSelectedPageId}
                    lockedPageId={lockedPageId}       // ✅ ΝΕΟ
                />

                <SrcFilesList
                    domain={currentDomain}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                />
            </div>
        </div>
    );
};

export default PageAdmin;