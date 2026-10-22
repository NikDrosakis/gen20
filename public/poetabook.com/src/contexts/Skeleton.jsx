// layouts/Skeleton.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import Cookies from 'js-cookie';
import './Skeleton.css';

export default function Skeleton({ children, lang }) {
    const location = useLocation();
    const [pageComponents, setPageComponents] = useState({ h: [], sl: [], m: [], sr: [], f: [] });
    const [loading, setLoading] = useState(true);
    const [hasCustomLayout, setHasCustomLayout] = useState(false);
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    const pageName = location.pathname === '/' ? 'home' : location.pathname.split('/')[1];
console.log(pageName,'pageName');
    useEffect(() => {
        const fetchPageComponents = async () => {
            setLoading(true);
            try {
                // ✅ 1. Πάρε το content_id
                const pageRes = await fetch(`/api/v1/maria/f?query=SELECT id, type FROM ${publicdb}.content WHERE name='${pageName}'`);
                const pageData = await pageRes.json();

                console.log('📄 Page data:', pageData);

                if (!pageData.success || !pageData.data) {
                    console.log('❌ No page found for:', pageName);
                    setHasCustomLayout(false);
                    setLoading(false);
                    return;
                }

                // ✅ 2. Το data είναι array, πάρε το πρώτο στοιχείο
                const contentId = pageData.data.id;
console.log(contentId,'contentId');
                if (!contentId) {
                    console.log('❌ No content ID found');
                    setHasCustomLayout(false);
                    setLoading(false);
                    return;
                }

                console.log('✅ Content ID:', contentId);

                // ✅ 3. Πάρε τα components
                const query = `/api/v1/maria/fa?q=SELECT * FROM ${publicdb}.content_components WHERE content_id=${contentId} ORDER BY sort ASC`;
                console.log(query);
                const compRes = await fetch(query);
                const compData = await compRes.json();
console.log(compData);
                console.log('📦 Components data:', compData);

                if (compData.success && compData.data && compData.data.length > 0) {
                    const components = { h: [], sl: [], m: [], sr: [], f: [] };

                    for (const item of compData.data) {
                        const componentRes = await fetch(`/api/v1/maria/f?query=SELECT id, name, path, type, description, props FROM ${publicdb}.components WHERE id=${item.component_id}`);
                        const componentData = await componentRes.json();

                        if (componentData.success && componentData.data) {
                            const comp = Array.isArray(componentData.data) ? componentData.data[0] : componentData.data;
                            components[item.area].push({
                                id: comp.id,
                                name: comp.name,
                                path: comp.path,
                                type: comp.type,
                                description: comp.description,
                                props: comp.props ? JSON.parse(comp.props) : {},
                                sort: item.sort
                            });
                        }
                    }

                    setPageComponents(components);
                    setHasCustomLayout(true);
                } else {
                    setHasCustomLayout(false);
                }
            } catch (error) {
                console.error('Error fetching page components:', error);
                setHasCustomLayout(false);
            } finally {
                setLoading(false);
            }
        };

        fetchPageComponents();
    }, [pageName, publicdb]);

    const showLeftSidebar = hasCustomLayout ? pageComponents.sl.length > 0 : true;
    const showRightSidebar = hasCustomLayout ? pageComponents.sr.length > 0 : false;
    const showFooter = hasCustomLayout ? pageComponents.f.length > 0 : true;

    const mainWidthClass = useMemo(() => {
        if (!showLeftSidebar && !showRightSidebar) return "w-full";
        if (!showLeftSidebar || !showRightSidebar) return "w-4/5";
        return "w-3/5";
    }, [showLeftSidebar, showRightSidebar]);

    const renderComponent = (component) => {
        return (
            <div className="component-placeholder" data-component-id={component.id}>
                <span className="component-icon">📦</span>
                <span className="component-name">{component.name}</span>
                {component.description && (
                    <span className="component-desc">{component.description}</span>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="skeleton-loading">
                <Header />
                <div className="skeleton-loading-center">
                    <div className="loading-spinner">Loading...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div id="container">
            <Header />

            <div className="skeleton-main" id="main-content">
                {/* Header Components */}
                {hasCustomLayout && pageComponents.h.length > 0 && (
                    <div id="h">
                        {pageComponents.h.map((component, i) => (
                            <div key={`h-${i}`} className="component-wrapper">
                                {renderComponent(component)}
                            </div>
                        ))}
                    </div>
                )}

                {/* Left Sidebar */}
                {showLeftSidebar && (
                    <aside className="skeleton-sidebar-left" id="sl">
                        {hasCustomLayout ? (
                            pageComponents.sl.map((component, i) => (
                                <div key={`sl-${i}`} className="component-item">
                                    {renderComponent(component)}
                                </div>
                            ))
                        ) : (
                            <Sidebar position="left" />
                        )}
                    </aside>
                )}

                {/* Main Content */}
                <main className={`skeleton-main-content ${mainWidthClass}`}>
                    {children}
                </main>

                {/* Right Sidebar */}
                {showRightSidebar && (
                    <aside className="skeleton-sidebar-right" id="sr">
                        {hasCustomLayout ? (
                            pageComponents.sr.map((component, i) => (
                                <div key={`sr-${i}`} className="component-item">
                                    {renderComponent(component)}
                                </div>
                            ))
                        ) : null}
                    </aside>
                )}
            </div>

            {/* Footer */}
            <Footer />
            {hasCustomLayout && pageComponents.f.length > 0 && (
                <div className="skeleton-footer-components">
                    {pageComponents.f.map((component, i) => (
                        <div key={`f-${i}`} className="component-wrapper">
                            {renderComponent(component)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}