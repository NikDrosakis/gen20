/*
#name: ComponentsManager
#title: Component Library Manager
#description: Displays a library of all available components with filtering by type. Shows component name, description, and type badge.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: admin
#independent: true
#standalone: true
#compatible_areas: m
#dependencies: react
#props:
#   - components: Array of component objects with id, name, type, description
#methods:
#   - filterComponents(): Filters components by selected type
#   - getUniqueTypes(): Extracts unique component types for filter dropdown
*/
import React, { useState } from 'react';

const ComponentsManager = ({ components }) => {
    const [selectedType, setSelectedType] = useState('all');

    const types = ['all', ...new Set(components.map(comp => comp.type).filter(Boolean))];

    const filteredComponents = selectedType === 'all'
        ? components
        : components.filter(comp => comp.type === selectedType);

    return (
        <div className="tab-pane">
            <div className="section-header">
                <h2>Component Library</h2>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="type-filter"
                >
                    {types.map(type => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div className="components-grid">
                {filteredComponents.length === 0 ? (
                    <div className="empty-state">No components found</div>
                ) : (
                    filteredComponents.map(comp => (
                        <div key={comp.id} className="component-card">
                            <div className="comp-icon">🧩</div>
                            <div className="comp-info">
                                <h4>{comp.name}</h4>
                                <p>{comp.description || 'No description'}</p>
                                <span className="comp-type">{comp.type}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ComponentsManager;