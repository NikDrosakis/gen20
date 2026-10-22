/*
#name: Layout
#title: Layout Manager - Page Builder
#description: Drag & drop page builder for managing components and pages. Supports local components, installable components from other domains, and real-time drag & drop layout editing.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: admin
#independent: false
#standalone: false
#compatible_areas: m
#dependencies: react, react-router-dom
#apimethods:
#   GET /api/v1/maria/fa?folder=select * from gen_*.content where type='page'
#   GET /api/v1/maria/fa?folder=select * from gen_*.content_components
#   GET /api/v1/maria/fa?folder=select * from gen_*.components
#   GET /api/v1/maria/fa?folder=select * from gen_admin.components where domain != 'current'
#   POST /api/v1/maria/insert
#   POST /api/v1/maria/q
#   POST /api/v1/local/installComponent
#methods:
#   - fetchData(): Loads pages, components, and installable components
#   - handleDragStart(): Initiates drag operation for components
#   - handleDragEnd(): Cleans up drag state
#   - handleDragOver(): Allows drop on valid areas
#   - handleDrop(): Handles component drop on page areas
#   - installComponent(): Installs component from another domain
#   - addComponentToArea(): Adds component to specific page area
#   - removeComponentFromArea(): Removes component from page area
#   - clearPage(): Removes all components from a page
#   - getComponentName(): Gets component name by ID with fallback
#   - toggleDescription(): Toggles expanded description view
#   - getFilteredComponents(): Filters components by search term
#   - getFilteredInstallable(): Filters installable components by search term
#   - pagesList(): Renders page boxes with drop zones
#drag_drop_areas:
#   - h: Header area
#   - sl: Sidebar Left
#   - m: Main content
#   - sr: Sidebar Right
#   - f: Footer
*/
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PagesLayout from '../components/layout/PagesLayout';
import CurrentComponents from '../components/layout/CurrentComponents';
import InstallComponents from '../components/layout/InstallComponents';
import ComponentsManager from '../components/layout/ComponentsManager';
import PreviewScreen from '../components/layout/PreviewScreen';
import "./Layout.css";

const Layout = () => {
    const [pages, setPages] = useState([]);
    const [components, setComponents] = useState([]);
    const [installableComponents, setInstallableComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const [selectedDomain, setSelectedDomain] = useState('');
    const [activeTab, setActiveTab] = useState('pagelayout');
    const [previewComponent, setPreviewComponent] = useState(null);
    // Get current domain from hostname
    const currentDomain = window.location.hostname;

    const handlePreview = useCallback((component) => {
        setPreviewComponent(component);
    }, []);

    const handleUseComponent = useCallback((component) => {
        // Κλείσε το preview και ξεκίνα drag
        setPreviewComponent(null);
        // Μπορείς να ενεργοποιήσεις το drag mode εδώ
        console.log('Using component:', component.name);
    }, []);

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

            // Fetch components from database (synced from filesystem)
            const compRes = await fetch(`/api/v1/maria/fa?folder=select * from ${publicdb}.components WHERE cubo IS NOT NULL group by cubo order by name asc`);
            const compData = await compRes.json();

            // ✅ Fetch installable components from gen_admin (from other domains)
            const installRes = await fetch(`/api/v1/maria/fa?folder=select * from gen_admin.components where domain != '${currentDomain}' and cubo IS NOT NULL group by cubo order by domain, name asc`);
            const installData = await installRes.json();

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

            if (compData.success) setComponents(compData.data || []);
            if (installData.success) setInstallableComponents(installData.data || []);

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
            // ✅ Έλεγχος αν είναι installable component (από άλλο domain)
            if (data.fromDomain && data.fromDomain !== currentDomain) {
                // Πρέπει να το εγκαταστήσουμε πρώτα
                const installConfirm = window.confirm(
                    `This component is from ${data.fromDomain}. Install it first?`
                );
                if (installConfirm) {
                    await installComponent(data.id, data.fromDomain);
                } else {
                    return;
                }
            }
            await addComponentToArea(pageId, area, data.id);
        }
    }, [currentDomain]);

    const installComponent = useCallback(async (componentId, sourceDomain) => {
        try {
            const response = await fetch('/api/v1/local/installComponent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    component_id: componentId,
                    source_domain: sourceDomain,
                    target_domain: currentDomain
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Component installed from ${sourceDomain}`);
                // Refresh components
                fetchData();
                alert(`Component installed successfully from ${sourceDomain}!`);
            } else {
                console.error('❌ Installation failed:', result.error);
                alert(`Installation failed: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Error installing component:', error);
            alert('Error installing component');
        }
    }, [currentDomain]);

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
        // ✅ Έλεγξε και στα installable components
        const comp = components.find(c => c.id === component_id) ||
            installableComponents.find(c => c.id === component_id);
        return comp ? comp.name : `Component ${component_id}`;
    }, [components, installableComponents]);

    const toggleDescription = useCallback((componentId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [componentId]: !prev[componentId]
        }));
    }, []);

    // Memoize filtered components
    const filteredComponents = useMemo(() => {
        return components.filter(comp =>
            comp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [components, searchTerm]);

    // Memoize filtered installable components
    const filteredInstallable = useMemo(() => {
        return installableComponents.filter(comp =>
            comp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.domain?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [installableComponents, searchTerm]);

    if (loading) {
        return <div className="loading-state">Loading layout manager...</div>;
    }

    return (
        <div className="layout-container">
            {/* Tabs Navigation */}
            <div className="layout-tabs">
                <button
                    className={`layout-tab ${activeTab === 'pagelayout' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pagelayout')}
                >
                    📐 Page Layout
                </button>
                <button
                    className={`layout-tab ${activeTab === 'components' ? 'active' : ''}`}
                    onClick={() => setActiveTab('components')}
                >
                    🧩 Components Manager
                </button>
            </div>

            {/* Tab Content */}
            <div className="layout-wrapper">
                {activeTab === 'pagelayout' ? (
                    <>
                        {/* Pages Panel */}
                        <PagesLayout
                            pages={pages}
                            components={components}
                            installableComponents={installableComponents}
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
                            onPreview={handlePreview}  // ← Πρόσθεσε αυτό
                        />
                        {previewComponent && (
                            <PreviewScreen
                                component={previewComponent}
                                onUse={handleUseComponent}
                                onClose={() => setPreviewComponent(null)}
                                onDragStart={handleDragStart}
                            />
                        )}
                        {/* Installable Components Panel */}
                        <InstallComponents
                            installableComponents={installableComponents}
                            searchTerm={searchTerm}
                            expandedDescriptions={expandedDescriptions}
                            onToggleDescription={toggleDescription}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onInstall={installComponent}
                            selectedDomain={selectedDomain}
                        />
                    </>
                ) : (
                    <ComponentsManager components={components} selectedDomain={selectedDomain} />
                )}
            </div>
        </div>
    );
};

export default Layout;