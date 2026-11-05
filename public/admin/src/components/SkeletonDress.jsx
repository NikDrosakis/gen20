// components/SkeletonDress.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './SkeletonDress.css';

const AREAS = [
    { key: 'h',  label: 'Header',        icon: '🔝' },
    { key: 'sl', label: 'Sidebar Left',  icon: '⬅️' },
    { key: 'm',  label: 'Main',          icon: '📄' },
    { key: 'sr', label: 'Sidebar Right', icon: '➡️' },
    { key: 'f',  label: 'Footer',        icon: '🔻' },
];

export default function SkeletonDress({ pageId, domain, onClose }) {
    const publicdb = 'gen_' + (domain || window.location.hostname).replace(/\./g, '');

    const [page, setPage] = useState(null);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Φόρτωση δεδομένων
    const fetchData = useCallback(async () => {
        // 🧪 MOCK DATA — αντικαθιστά τα 3 queries
        setLoading(true);

        try {
            // 1. Mock page
            const pageRow = {
                id: pageId,
                title: 'Mock Page',
                type: 'page',
                status: 1,
            };

            // 2. Mock placements (content_cubos)
            const relations = [
                { contentid: pageId, cubosid: 1, area: 'h',  sort: 0 },
                { contentid: pageId, cubosid: 2, area: 'm',  sort: 0 },
                { contentid: pageId, cubosid: 3, area: 'm',  sort: 1 },
                { contentid: pageId, cubosid: 4, area: 'sl', sort: 0 },
                { contentid: pageId, cubosid: 5, area: 'sr', sort: 0 },
                { contentid: pageId, cubosid: 6, area: 'f',  sort: 0 },
            ];

            // 3. Mock components (cubos)
            const cubos = [
                { id: 1, name: 'nav',         description: 'Navigation bar' },
                { id: 2, name: 'hero',        description: 'Hero section' },
                { id: 3, name: 'contentone',  description: 'Article body' },
                { id: 4, name: 'sidebar',     description: 'Left sidebar' },
                { id: 5, name: 'related',     description: 'Related posts' },
                { id: 6, name: 'footer',      description: 'Footer' },
            ];

            // 4. Σύνθεση
            const result = { ...pageRow };
            AREAS.forEach(({ key }) => {
                result[key] = relations
                    .filter(r => r.area === key)
                    .sort((a, b) => Number(a.sort) - Number(b.sort))
                    .map(r => Number(r.cubosid));
            });

            setPage(result);
            setComponents(cubos);
        } catch (err) {
            console.error('SkeletonDress mock error:', err);
        } finally {
            setLoading(false);
        }
    }, [pageId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="sd-loading">Loading layout...</div>;
    }

    if (!page) {
        return <div className="sd-error">Page not found</div>;
    }

    return (
        <div className="skeleton-dress">
            <div className="sd-header">
                <h3>📐 Skeleton Dress — {page.title || `Page #${page.id}`}</h3>
                <button className="sd-close" onClick={onClose}>✕</button>
            </div>

            <div className="sd-areas">
                {AREAS.map(({ key, label, icon }) => (
                    <div key={key} className={`sd-area sd-area-${key}`}>
                        <div className="sd-area-label">
                            <span>{icon} {label}</span>
                            <span className="sd-area-count">
                                {(page[key] || []).length}
                            </span>
                        </div>
                        <div className="sd-area-items">
                            {(page[key] || []).length === 0 ? (
                                <div className="sd-area-empty">Empty</div>
                            ) : (
                                (page[key] || []).map(cubosid => {
                                    const comp = components.find(c => Number(c.id) === cubosid);
                                    return (
                                        <div key={cubosid} className="sd-item">
                                            <span>{comp?.name || `Component ${cubosid}`}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}