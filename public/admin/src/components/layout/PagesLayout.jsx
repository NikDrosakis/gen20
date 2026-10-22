/*
#name: PagesLayout
#title: Pages Layout Panel
#description: Displays all pages with their component areas (header, sidebar left, main, sidebar right, footer). Supports drag & drop for adding components to page areas and clearing all components from a page.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: admin
#independent: false
#standalone: false
#compatible_areas: m
#dependencies: react, react-router-dom
#props:
#   - pages: Array of page objects with areas (h, sl, m, sr, f)
#   - components: Array of available components
#   - installableComponents: Array of installable components from other domains
#   - onClearPage: Callback to clear all components from a page
#   - onRemoveComponent: Callback to remove a component from a page area
#   - onAddComponent: Callback to add a component to a page area
#   - onDragOver: Drag over event handler
#   - onDragLeave: Drag leave event handler
#   - onDrop: Drop event handler
#   - getComponentName: Function to get component name by ID
#   - selectedDomain: Currently selected domain
#methods:
#   - pagesList(): Renders page boxes with drop zones for each area
#drag_drop_areas:
#   - h: Header area
#   - sl: Sidebar Left
#   - m: Main content
#   - sr: Sidebar Right
#   - f: Footer
*/
import React, { useMemo } from 'react';

const PagesLayout = ({
                         pages,
                         components,
                         installableComponents,
                         onClearPage,
                         onRemoveComponent,
                         onAddComponent,
                         onDragOver,
                         onDragLeave,
                         onDrop,
                         getComponentName,
                         selectedDomain
                     }) => {
    // Memoize pages render
    const pagesList = useMemo(() => {
        return pages.map(page => (
            <div key={page.id} className="page-box">
                <div className="page-header">
                    <div>
                        <a href={`/${page.name}`} className="page-link">{page.name}</a>
                        <button className="clear-button" onClick={() => onClearPage(page.id)}>
                            Clear
                        </button>
                    </div>
                    <button className="auto-set-button" onClick={() => alert('Auto-set not implemented yet')}>
                        Auto-set
                    </button>
                </div>

                <div className="area-container">
                    {/* Header Area */}
                    <div
                        className="area"
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, page.id, 'h')}
                    >
                        <div className="area-title">Header (H)</div>
                        {(page.h || []).map(compId => (
                            <div key={compId} className="component-item">
                                {getComponentName(compId)}
                                <button
                                    className="remove-button"
                                    onClick={() => onRemoveComponent(page.id, 'h', compId)}
                                >
                                    ✖
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Left and Main */}
                    <div className="area-row">
                        <div
                            className="area"
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => onDrop(e, page.id, 'sl')}
                        >
                            <div className="area-title">Sidebar Left (SL)</div>
                            {(page.sl || []).map(compId => (
                                <div key={compId} className="component-item">
                                    {getComponentName(compId)}
                                    <button
                                        className="remove-button"
                                        onClick={() => onRemoveComponent(page.id, 'sl', compId)}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div
                            className="area"
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => onDrop(e, page.id, 'm')}
                        >
                            <div className="area-title">Main (M)</div>
                            {(page.m || []).map(compId => (
                                <div key={compId} className="component-item">
                                    {getComponentName(compId)}
                                    <button
                                        className="remove-button"
                                        onClick={() => onRemoveComponent(page.id, 'm', compId)}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div
                            className="area"
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => onDrop(e, page.id, 'sr')}
                        >
                            <div className="area-title">Sidebar Right (SR)</div>
                            {(page.sr || []).map(compId => (
                                <div key={compId} className="component-item">
                                    {getComponentName(compId)}
                                    <button
                                        className="remove-button"
                                        onClick={() => onRemoveComponent(page.id, 'sr', compId)}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Area */}
                    <div
                        className="area"
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, page.id, 'f')}
                    >
                        <div className="area-title">Footer (F)</div>
                        {(page.f || []).map(compId => (
                            <div key={compId} className="component-item">
                                {getComponentName(compId)}
                                <button
                                    className="remove-button"
                                    onClick={() => onRemoveComponent(page.id, 'f', compId)}
                                >
                                    ✖
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ));
    }, [pages, onClearPage, onDragOver, onDragLeave, onDrop, getComponentName, onRemoveComponent]);

    return (
        <div className="pages-panel">
            <div className="panel-title">
                Main Pages ({pages.length})
                <button className="new-page-button" onClick={() => alert('Create new page')}>
                    + New Main
                </button>
            </div>
            {pagesList}
        </div>
    );
};

export default PagesLayout;