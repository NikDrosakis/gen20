// Layout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PagesLayout from './PagesLayout';
import CurrentComponents from './CurrentComponents';
import "./Layout.css";

const Layout = () => {
    const [pages, setPages] = useState([]);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const [selectedDomain, setSelectedDomain] = useState('');

    // Get current domain from hostname
    const currentDomain = window.location.hostname;

    useEffect(() => {
        setSelectedDomain(currentDomain);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch pages from content table (type='page')
            const pagesRes = await fetch(`/api/v1/maria/fa?folder=select * from ${publicdb}.content where type='page' order by sort asc`);
            const pagesData = await pagesRes.json();

            // Fetch content_components relations (to restore saved components)
            const relRes = await fetch(`/api/v1/maria/fa?folder=select * from ${publicdb}.content_components order by sort asc`);
            const relData = await relRes.json();

            // ✅ Fetch components directly from gen_admin.components, filtered by current domain
            // We JOIN with the local publicdb.components to ensure we only get components synced for this site.
            const compQuery = `
                SELECT a.* 
                FROM gen_admin.components a
                INNER JOIN ${publicdb}.components b ON b.id = a.id
                WHERE a.domain = '${currentDomain}' AND a.cubosid IS NOT NULL
                GROUP BY a.cubosid 
                ORDER BY a.name ASC
            `.replace(/\s+/g, ' ').trim();

            const compRes = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(compQuery)}`);
            const compData = await compRes.json();

            if (pagesData.success) {
                // Merge relations into pages
                const pagesWithComponents = pagesData.data.map(page => ({
                    ...page,
                    h: relData.data?.filter(r => r.content_id === page.id && r.area === 'h').map(r => r.component_id) || [],
                    sl: relData.data?.filter(r => r.content_id === page.id && r.area === 'sl').map(r => r.component_id) || [],
                    m: relData.data?.filter(r => r.content_id === page.id && r.area === 'm').map(r => r.component_id) || [],
                    sr: relData.data?.filter(r => r.content_id === page.id && r.area === 'sr').map(r => r.component_id) || [],
                    f: relData.data?.filter(r => r.content_id === page.id && r.area === 'f').map(r => r.component_id) || []
                }));
                setPages(pagesWithComponents);
            }

            if (compData.success) {
                // Optionally map the data if you need to rename fields (e.g. 'cubosid' -> 'cubo')
                const formattedComponents = compData.data.map(c => ({
                    ...c,
                    cubo: c.cubosid // Keeping legacy key if CurrentComponents expects it
                }));
                setComponents(formattedComponents || []);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleDrop = useCallback(async (e, pageId, area) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const data = JSON.parse(e.dataTransfer.getData('text/plain'));

        if (data.type === 'component') {
            // ✅ Μόνο local components — το install γίνεται από το Cubo Mode του ComponentManager
            await addComponentToArea(pageId, area, data.id);
        }
    }, []);

    const addComponentToArea = useCallback(async (content_id, area, component_id) => {
        try {
            const response = await fetch('/api/v1/maria/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: `${publicdb}.content_components`,
                    params: {
                        content_id: content_id,
                        component_id: component_id,
                        area: area
                    }
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Component ${component_id} added to area ${area}`);

                setPages(prevPages => prevPages.map(page => {
                    if (page.id === content_id) {
                        const existing = page[area] || [];
                        if (!existing.includes(component_id)) {
                            return { ...page, [area]: [...existing, component_id] };
                        }
                    }
                    return page;
                }));

                setComponents(prev => prev.map(comp =>
                    comp.id === component_id ? { ...comp, instances: (comp.instances || 0) + 1 } : comp
                ));
            } else {
                console.error('❌ Failed to add component:', result.error);
            }
        } catch (error) {
            console.error('❌ Error adding component:', error);
        }
    }, [publicdb]);

    const removeComponentFromArea = useCallback(async (content_id, area, component_id) => {
        try {
            const query = `DELETE FROM ${publicdb}.content_components 
                       WHERE content_id = ${content_id} 
                       AND area = '${area}' 
                       AND component_id = ${component_id}`;

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Component ${component_id} removed from area ${area}`);

                setPages(prevPages => prevPages.map(page => {
                    if (page.id === content_id) {
                        const existing = page[area] || [];
                        return { ...page, [area]: existing.filter(id => id !== component_id) };
                    }
                    return page;
                }));

                setComponents(prev => prev.map(comp =>
                    comp.id === component_id ? { ...comp, instances: Math.max(0, (comp.instances || 0) - 1) } : comp
                ));
            } else {
                console.error('❌ Failed to remove component:', result.error);
            }
        } catch (error) {
            console.error('❌ Error removing component:', error);
        }
    }, [publicdb]);

    const clearPage = useCallback(async (pageId) => {
        if (window.confirm('Clear all components from this page?')) {
            const page = pages.find(p => p.id === pageId);
            if (page) {
                const areas = ['h', 'sl', 'm', 'sr', 'f'];
                areas.forEach(area => {
                    (page[area] || []).forEach(component_id => {
                        removeComponentFromArea(pageId, area, component_id);
                    });
                });
            }
        }
    }, [pages, removeComponentFromArea]);

    const getComponentName = useCallback((component_id) => {
        const comp = components.find(c => c.id === component_id);
        return comp ? comp.name : `Component ${component_id}`;
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
                {/* Pages Panel */}
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
                />

                {/* Current Components Panel */}
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
    );
};

export default Layout;