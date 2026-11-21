import { useMemo, useState } from 'react';
import './Pages.css';

const CubosInstalled = ({ cubos, loading, onDrop, onDragOver, onDragLeave, onStatusChange }) => {
    const host = window.location.hostname;
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return cubos;
        return cubos.filter(
            (c) =>
                c.name?.toLowerCase().includes(q) ||
                c.title?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q)
        );
    }, [cubos, query]);

    return (
        <div
            className="sidebar-panel right-panel"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="panel-header">
                <h4>Installed (moon/{host})</h4>
                <span className="count-badge">{filtered.length}</span>
            </div>

            {!loading && cubos.length > 0 && (
                <div className="panel-search">
                    <input
                        type="search"
                        className="panel-search__input"
                        placeholder="Search installed…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search installed cubos"
                    />
                    {query && (
                        <button
                            type="button"
                            className="panel-search__clear"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="loading-state">Loading installed cubos…</div>
            ) : cubos.length === 0 ? (
                <div className="empty-state">
                    No cubos installed yet.
                    <br />
                    <small>Drag here to install.</small>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">No matches for “{query}”.</div>
            ) : (
                <ul className="cubo-list">
                    {filtered.map((cubo) => (
                        <li
                            key={cubo.name}
                            className="cubo-item installed-item"
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData(
                                    'text/plain',
                                    JSON.stringify({ ...cubo, source: 'moon' })
                                );
                                e.dataTransfer.effectAllowed = 'copyMove';
                            }}
                            style={{
                                borderLeft: cubo.color
                                    ? `4px solid ${cubo.color}`
                                    : '4px solid transparent',
                            }}
                        >
                            {/* Header: Icon + Name + Version */}
                            <div className="cubo-item__header">
                                <span className="cubo-icon" aria-hidden="true">
                                    {cubo.icon || '📦'}
                                </span>
                                <span className="cubo-name">{cubo.name}</span>
                                <span className="cubo-version">v{cubo.version || '1.0'}</span>
                            </div>

                            {/* Title */}
                            {cubo.title && cubo.title !== cubo.name && (
                                <div className="cubo-title">{cubo.title}</div>
                            )}

                            {/* Description */}
                            {cubo.description && (
                                <div className="cubo-description">{cubo.description}</div>
                            )}

                            {/* Footer: Status dropdown */}
                            <div className="cubo-item__footer" onClick={(e) => e.stopPropagation()}>
                                <select
                                    className="cubo-status-select"
                                    draggable={false}
                                    value={cubo.status || 'dev'}
                                    onChange={(e) => onStatusChange?.(cubo.name, e.target.value)}
                                    title="Cubo status"
                                >
                                    <option value="dev">dev</option>
                                    <option value="testing">testing</option>
                                    <option value="active">active</option>
                                    <option value="production">production</option>
                                </select>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CubosInstalled;