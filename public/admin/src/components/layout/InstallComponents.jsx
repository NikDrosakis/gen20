/*
#name: InstallComponents
#title: Installable Components Panel
#description: Displays components available from other domains that can be installed locally. Shows domain source, version, and provides install button. Supports drag & drop for easy installation.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: layout
#independent: true
#standalone: true
#compatible_areas: m
#dependencies: react
#methods:
#   - getFilteredInstallable(): Filters installable components by search term
#   - toggleDescription(): Toggles expanded description view
#   - handleDragStart(): Initiates drag operation for components
#   - handleDragEnd(): Cleans up drag state
#   - handleInstall(): Installs component from another domain
*/
import React, { useMemo } from 'react';

const InstallComponents = ({
                               installableComponents,
                               searchTerm,
                               expandedDescriptions,
                               onToggleDescription,
                               onDragStart,
                               onDragEnd,
                               onInstall,
                               selectedDomain
                           }) => {
    // Memoize filtered installable components
    const filteredInstallable = useMemo(() => {
        return installableComponents.filter(comp =>
            comp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comp.domain?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [installableComponents, searchTerm]);

    return (
        <div className="components-panel install-panel">
            <div className="panel-title install-title">
                📦 Install from Other Domains ({installableComponents.length})
                <span className="install-info">Drag to pages to install</span>
            </div>

            {filteredInstallable.length === 0 ? (
                <div className="empty-state">No components available from other domains</div>
            ) : (
                filteredInstallable.map(comp => (
                    <div
                        key={comp.id}
                        className="component-card install-card"
                        draggable
                        onDragStart={(e) => onDragStart(e, {
                            id: comp.id,
                            name: comp.name,
                            fromDomain: comp.domain
                        }, 'component')}
                        onDragEnd={onDragEnd}
                    >
                        <div className="component-header">
                            <div className="component-name">{comp.cubo}</div>
                            <span className="domain-badge">🌐 {comp.domain}</span>
                            <button
                                className="install-btn"
                                onClick={() => onInstall(comp.id, comp.domain)}
                            >
                                📥 Install
                            </button>
                        </div>

                        {comp.description && (
                            <div className="component-description-wrapper">
                                <div className="component-description">
                                    {comp.description.length > 100 ? (
                                        <>
                                            {expandedDescriptions[`install-${comp.id}`]
                                                ? comp.description
                                                : `${comp.description.substring(0, 100)}...`
                                            }
                                            <button
                                                className="description-toggle"
                                                onClick={() => onToggleDescription(`install-${comp.id}`)}
                                            >
                                                {expandedDescriptions[`install-${comp.id}`] ? 'Show less' : 'Show more'}
                                            </button>
                                        </>
                                    ) : (
                                        comp.description
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="component-meta">
                            {comp.version && (
                                <span className="component-version">📌 v{comp.version}</span>
                            )}
                            <span className="component-source">📂 from {comp.domain}</span>
                        </div>

                        {comp.methods && JSON.parse(comp.methods || '[]').length > 0 && (
                            <div className="component-methods">
                                <span className="methods-label">🔧 Methods:</span>
                                {JSON.parse(comp.methods || '[]').map((method, i) => (
                                    <span key={i} className="method-tag">{method}</span>
                                ))}
                            </div>
                        )}

                        {comp.apimethods && JSON.parse(comp.apimethods || '[]').length > 0 && (
                            <div className="component-apimethods">
                                <span className="apimethods-label">📡 API:</span>
                                {JSON.parse(comp.apimethods || '[]').map((api, i) => (
                                    <span key={i} className="apimethod-tag">{api}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default InstallComponents;