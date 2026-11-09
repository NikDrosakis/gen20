// Skeleton.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ContentOne from "./ContentOne";
import { useG } from "./GContext";
import "./Skeleton.css";

const publicdb = "gen_" + window.location.hostname.replace(/\./g, "");

// ============================================================
// Skeleton
// ============================================================

export default function Skeleton() {
    const location = useLocation();
    const { G } = useG();

    const pageComponents = useMemo(() => {
        const cubo = G?.PAGECUBO?.components || {};
        return {
            h:  Array.isArray(cubo.h)  ? cubo.h  : [],
            sl: Array.isArray(cubo.sl) ? cubo.sl : [],
            m:  Array.isArray(cubo.m)  ? cubo.m  : [],
            sr: Array.isArray(cubo.sr) ? cubo.sr : [],
            f:  Array.isArray(cubo.f)  ? cubo.f  : [],
        };
    }, [G?.PAGECUBO]);

    const pathname = location.pathname;
    const segments = pathname.split("/").filter(Boolean);
    const pageName = segments[0] || "home";

    // --------------------------------------------------
    // LAYOUT
    // --------------------------------------------------
    const showLeftSidebar = pageComponents.sl.length > 0;
    const showRightSidebar = pageComponents.sr.length > 0;
    const showHeaderComponents = pageComponents.h.length > 0;
    const showFooterComponents = pageComponents.f.length > 0;

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
                <span className="component-name">{component.name}</span>
                {component.description && (
                    <span className="component-desc">
                        {component.description}
                    </span>
                )}
            </div>
        );
    };

    // --------------------------------------------------
    // MAIN LAYOUT
    // --------------------------------------------------
    return (
        <div id="container">

            <Header />

            <div className="skeleton-main" id="main-content">

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

                {showLeftSidebar && (
                    <aside className="skeleton-sidebar-left" id="sl">
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

                {/* ✅ Main: ContentOne αντί για dangerouslySetInnerHTML */}
                <main className={`skeleton-main-content ${mainWidthClass}`}>
                    <ContentOne name={pageName} lang="el" />
                </main>

                {showRightSidebar && (
                    <aside className="skeleton-sidebar-right" id="sr">
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