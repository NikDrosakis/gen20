/*
#name: CurrentComponents
#title: Current Components Panel
#description: Displays all available components from the current domain with search, filtering, and drag & drop support. Shows component details like type, status, author, version, and dependencies.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: layout
#independent: true
#standalone: true
#compatible_areas: m
#dependencies: react
#methods:
#   - getFilteredComponents(): Filters components by search term
#   - toggleDescription(): Toggles expanded description view
#   - handleDragStart(): Initiates drag operation for components
#   - handleDragEnd(): Cleans up drag state
*/
import React, { useMemo } from 'react';

const CurrentComponents = ({
                               components,
                               searchTerm,
                               onSearchChange,
                               expandedDescriptions,
                               onToggleDescription,
                               onDragStart,
                               onDragEnd,
                               onPreview
                           }) => {
    // Memoize filtered components
    const filteredComponents = useMemo(() => {
        return components.filter(comp =>
            comp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [components, searchTerm]);

    return (
        <div className="components-panel">
            <div className="panel-title">
                Components ({components.length})
            </div>

            <input
                type="text"
                className="search-box"
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <div className="components-stats">
                <span>Total: {components.length}</span>
                <span>Active: {components.filter(c => c.status === 'active').length}</span>
            </div>

            {filteredComponents.length === 0 ? (
                <div className="empty-state">No components found</div>
            ) : (
                filteredComponents.map(comp => (
                    <div
                        key={comp.id}
                        className="component-card"
                        draggable
                        onDragStart={(e) => onDragStart(e, {id: comp.id, name: comp.name}, 'component')}
                        onDragEnd={onDragEnd}
                    >
                        <div className="component-header">
                            <div className="component-name">{comp.name}</div>
                            {comp.type && (
                                <span className="component-type-badge">{comp.type}</span>
                            )}
                            {comp.status && (
                                <span className={`component-status ${comp.status}`}>
                                    {comp.status === 'active' ? '✅' : '⛔'}
                                </span>
                            )}
                        </div>

                        {comp.description && (
                            <div className="component-description-wrapper">
                                <div className="component-description">
                                    {comp.description.length > 100 ? (
                                        <>
                                            {expandedDescriptions[comp.id]
                                                ? comp.description
                                                : `${comp.description.substring(0, 100)}...`
                                            }
                                            <button
                                                className="description-toggle"
                                                onClick={() => onToggleDescription(comp.id)}
                                            >
                                                {expandedDescriptions[comp.id] ? 'Show less' : 'Show more'}
                                            </button>
                                        </>
                                    ) : (
                                        comp.description
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="component-meta">
                            {comp.author && (
                                <span className="component-author">👤 {comp.author}</span>
                            )}
                            {comp.version && (
                                <span className="component-version">📌 v{comp.version}</span>
                            )}
                            <span className="component-instances">
                                📦 Used: {comp.instances || 0} times
                            </span>
                        </div>

                        {comp.modified_date && (
                            <div className="component-date">
                                📅 {new Date(comp.modified_date).toLocaleDateString()}
                            </div>
                        )}

                        {comp.dependencies && (
                            <div className="component-dependencies">
                                {JSON.parse(comp.dependencies || '[]').map((dep, i) => (
                                    <span key={i} className="dependency-tag">{dep}</span>
                                ))}
                            </div>
                        )}
                        <div className="component-actions">
                            <button
                                className="preview-btn-small"
                                onClick={() => onPreview(comp)}
                                title="Preview component"
                            >
                                👁️ Preview
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default CurrentComponents;