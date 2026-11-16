import { useMemo, useState } from 'react';
import './Pages.css';

const CubosInstalled = ({ cubos, loading, onDrop, onDragOver, onDragLeave }) => {
    const host = window.location.hostname;
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return cubos;
        return cubos.filter(
            (c) =>
                c.name?.toLowerCase().includes(q) ||
                c.title?.toLowerCase().includes(q)
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
                            <span className="cubo-icon">{cubo.color ? '🎨' : '📦'}</span>
                            <span className="cubo-name">{cubo.title || cubo.name}</span>
                            <span className="cubo-status">✅</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CubosInstalled;