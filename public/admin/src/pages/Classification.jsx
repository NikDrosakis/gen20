// Skeleton.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

import "./Skeleton.css";

const publicdb = "gen_" + window.location.hostname.replace(/\./g, "");

export default function Skeleton({ children }) {
    const location = useLocation();

    const [pageComponents, setPageComponents] = useState({
        h: [],
        sl: [],
        m: [],
        sr: [],
        f: []
    });

    const [loading, setLoading] = useState(true);
    const [hasCustomLayout, setHasCustomLayout] = useState(false);

    // --------------------------------------------------
    // ROUTING
    // --------------------------------------------------

    const pathname = location.pathname;
    const segments = pathname.split("/").filter(Boolean);
    const pageName = segments[0] || "home";

    // --------------------------------------------------
    // FETCH PAGE LAYOUT
    // --------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        const fetchPageComponents = async () => {
            setLoading(true);
            setHasCustomLayout(false);

            try {
                // 1. Fetch page
                const pageQuery = `
                    SELECT id, name
                    FROM ${publicdb}.content
                    WHERE name = '${pageName.replace(/'/g, "''")}'
                    AND type = 'page'
                    LIMIT 1
                `;

                const pageRes = await fetch(
                    `/api/v1/maria/f?folder=${encodeURIComponent(pageQuery)}`
                );

                if (!pageRes.ok) {
                    throw new Error(`Page request failed: ${pageRes.status}`);
                }

                const pageData = await pageRes.json();

                const page = Array.isArray(pageData.data)
                    ? pageData.data[0]
                    : pageData.data;

                const contentId = page?.id;

                if (!pageData.success || !contentId) {
                    console.log("No page found for:", pageName);

                    if (!cancelled) {
                        setPageComponents({
                            h: [],
                            sl: [],
                            m: [],
                            sr: [],
                            f: []
                        });
                        setHasCustomLayout(false);
                    }

                    return;
                }

                // 2. Fetch page components
                const componentsQuery = `
                    SELECT *
                    FROM ${publicdb}.content_components
                    WHERE content_id = ${Number(contentId)}
                    ORDER BY sort ASC
                `;

                const compRes = await fetch(
                    `/api/v1/maria/fa?folder=${encodeURIComponent(componentsQuery)}`
                );

                if (!compRes.ok) {
                    throw new Error(
                        `Components request failed: ${compRes.status}`
                    );
                }

                const compData = await compRes.json();

                const components = {
                    h: [],
                    sl: [],
                    m: [],
                    sr: [],
                    f: []
                };

                if (
                    compData.success &&
                    Array.isArray(compData.data) &&
                    compData.data.length > 0
                ) {
                    // 3. Fetch component definitions
                    for (const item of compData.data) {
                        const componentId = Number(item.component_id);

                        if (!componentId) continue;

                        const componentQuery = `
                            SELECT id, name, path, type, description, props
                            FROM ${publicdb}.components
                            WHERE id = ${componentId}
                            LIMIT 1
                        `;

                        const componentRes = await fetch(
                            `/api/v1/maria/f?folder=${encodeURIComponent(componentQuery)}`
                        );

                        if (!componentRes.ok) continue;

                        const componentData = await componentRes.json();

                        const comp = Array.isArray(componentData.data)
                            ? componentData.data[0]
                            : componentData.data;

                        if (!componentData.success || !comp) continue;

                        const area = item.area;

                        // Ignore unsupported areas
                        if (!Object.prototype.hasOwnProperty.call(components, area)) {
                            console.warn("Unknown component area:", area);
                            continue;
                        }

                        let props = {};

                        if (comp.props) {
                            try {
                                props = typeof comp.props === "string"
                                    ? JSON.parse(comp.props)
                                    : comp.props;
                            } catch (error) {
                                console.error(
                                    "Invalid component props:",
                                    comp.id,
                                    error
                                );
                            }
                        }

                        components[area].push({
                            id: comp.id,
                            name: comp.name,
                            path: comp.path,
                            type: comp.type,
                            description: comp.description,
                            props,
                            sort: item.sort
                        });
                    }
                }

                if (!cancelled) {
                    setPageComponents(components);

                    const hasComponents = Object.values(components)
                        .some(area => area.length > 0);

                    setHasCustomLayout(hasComponents);
                }

            } catch (error) {
                console.error(
                    "Error fetching page components:",
                    error
                );

                if (!cancelled) {
                    setPageComponents({
                        h: [],
                        sl: [],
                        m: [],
                        sr: [],
                        f: []
                    });

                    setHasCustomLayout(false);
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchPageComponents();

        return () => {
            cancelled = true;
        };

    }, [pageName]);

    // --------------------------------------------------
    // LAYOUT VISIBILITY
    // --------------------------------------------------

    const showLeftSidebar = pageComponents.sl.length > 0;
    const showRightSidebar = pageComponents.sr.length > 0;
    const showHeaderComponents = pageComponents.h.length > 0;
    const showFooterComponents = pageComponents.f.length > 0;

    // --------------------------------------------------
    // MAIN WIDTH
    // --------------------------------------------------

    const mainWidthClass = useMemo(() => {
        if (!showLeftSidebar && !showRightSidebar) return "w-full";
        if (!showLeftSidebar || !showRightSidebar) return "w-4/5";
        return "w-3/5";
    }, [showLeftSidebar, showRightSidebar]);

    // --------------------------------------------------
    // COMPONENT RENDERER
    // --------------------------------------------------

    const renderComponent = (component) => {
        return (
            <div
                className="component-placeholder"
                data-component-id={component.id}
            >
                <span className="component-icon">📦</span>

                <span className="component-name">
                    {component.name}
                </span>

                {component.description && (
                    <span className="component-desc">
                        {component.description}
                    </span>
                )}
            </div>
        );
    };

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="skeleton-loading">
                <Header />

                <div className="skeleton-loading-center">
                    <div className="loading-spinner">
                        Loading...
                    </div>
                </div>

                <Footer />
            </div>
        );
    }

    // --------------------------------------------------
    // MAIN LAYOUT
    // --------------------------------------------------

    return (
        <div id="container">

            <Header />

            <div
                className="skeleton-main"
                id="main-content"
            >

                {/* Header Components */}

                {showHeaderComponents && (
                    <div id="h">
                        {pageComponents.h.map((component, i) => (
                            <div
                                key={`h-${component.id}-${i}`}
                                className="component-wrapper"
                            >
                                {renderComponent(component)}
                            </div>
                        ))}
                    </div>
                )}

                {/* Left Sidebar */}

                {showLeftSidebar && (
                    <aside
                        className="skeleton-sidebar-left"
                        id="sl"
                    >
                        {pageComponents.sl.map((component, i) => (
                            <div
                                key={`sl-${component.id}-${i}`}
                                className="component-item"
                            >
                                {renderComponent(component)}
                            </div>
                        ))}
                    </aside>
                )}

                {/* Main Content */}

                <main className={`skeleton-main-content ${mainWidthClass}`}>
                    {children}
                </main>

                {/* Right Sidebar */}

                {showRightSidebar && (
                    <aside
                        className="skeleton-sidebar-right"
                        id="sr"
                    >
                        {pageComponents.sr.map((component, i) => (
                            <div
                                key={`sr-${component.id}-${i}`}
                                className="component-item"
                            >
                                {renderComponent(component)}
                            </div>
                        ))}
                    </aside>
                )}

            </div>

            <Footer />

            {/* Footer Components */}

            {showFooterComponents && (
                <div className="skeleton-footer-components">
                    {pageComponents.f.map((component, i) => (
                        <div
                            key={`f-${component.id}-${i}`}
                            className="component-wrapper"
                        >
                            {renderComponent(component)}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}