// components/layout/PreviewScreen.jsx
import React, { useState, useEffect } from 'react';
import './PreviewScreen.css';

const PreviewScreen = ({
                           component,
                           onUse,
                           onClose,
                           onDragStart
                       }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [Component, setComponent] = useState(null);

    useEffect(() => {
        if (component) {
            loadComponent();
        }
    }, [component]);

    const loadComponent = async () => {
        setLoading(true);
        setError(null);

        try {
            // ✅ Δυναμικό import του component
            const componentPath = component.path || `${component.name}.jsx`;

            try {
                // Προσπάθησε να φορτώσεις το component
                const module = await import(`../components/${componentPath}`);
                const LoadedComponent = module.default || module[component.name];

                if (LoadedComponent) {
                    setComponent(() => LoadedComponent);
                } else {
                    throw new Error('Component not found');
                }
            } catch (importError) {
                console.error('Import error:', importError);
                setError(`Failed to load component: ${component.name}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="preview-screen-overlay" onClick={onClose}>
                <div className="preview-screen" onClick={(e) => e.stopPropagation()}>
                    <div className="preview-loading">
                        <div className="spinner"></div>
                        <p>Loading component preview...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !Component) {
        return (
            <div className="preview-screen-overlay" onClick={onClose}>
                <div className="preview-screen" onClick={(e) => e.stopPropagation()}>
                    <div className="preview-error">
                        <span className="error-icon">⚠️</span>
                        <h4>Failed to load preview</h4>
                        <p>{error || 'Component not available'}</p>
                        <div className="preview-info-fallback">
                            <h3>{component?.name}</h3>
                            {component?.description && (
                                <p>{component.description}</p>
                            )}
                            <div className="preview-meta">
                                {component?.author && <span>👤 {component.author}</span>}
                                {component?.version && <span>📌 v{component.version}</span>}
                                <span>📦 {component?.type || 'component'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="preview-footer">
                        <button className="preview-btn preview-btn-close" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="preview-screen-overlay" onClick={onClose}>
            <div className="preview-screen" onClick={(e) => e.stopPropagation()}>
                <div className="preview-header">
                    <div className="preview-title">
                        <span className="preview-icon">🔍</span>
                        <h3>{component?.name || 'Component Preview'}</h3>
                        <span className="preview-type">{component?.type || 'component'}</span>
                    </div>
                    <button className="preview-close" onClick={onClose}>×</button>
                </div>

                <div className="preview-body">
                    {/* ✅ ΕΔΩ ΕΜΦΑΝΙΖΕΤΑΙ ΤΟ ΠΡΑΓΜΑΤΙΚΟ COMPONENT */}
                    <div className="preview-component-wrapper">
                        <Component {...(component?.props || {})} />
                    </div>
                </div>

                <div className="preview-footer">
                    <button className="preview-btn preview-btn-close" onClick={onClose}>Close</button>
                    <button
                        className="preview-btn preview-btn-use"
                        onClick={() => onUse(component)}
                    >
                        📥 Use Component
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewScreen;