import { useMemo, useState } from 'react';
import './Pages.css';

const CubosAvailable = ({ cubos, loading, onInstall }) => {
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
        <div className="sidebar-panel left-panel">
            <div className="panel-header">
                <h4>Available (astra/cubos)</h4>
                <span className="count-badge">{filtered.length}</span>
            </div>

            {!loading && cubos.length > 0 && (
                <div className="panel-search">
                    <input
                        type="search"
                        className="panel-search__input"
                        placeholder="Search available…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search available cubos"
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
                <div className="loading-state">Loading available cubos…</div>
            ) : cubos.length === 0 ? (
                <div className="empty-state">No cubos in astra/cubos</div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">No matches for “{query}”.</div>
            ) : (
                <ul className="cubo-list">
                    {filtered.map((cubo) => (
                        <li
                            key={cubo.name}
                            className="cubo-item available-item"
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData(
                                    'text/plain',
                                    JSON.stringify({ ...cubo, source: 'astra' })
                                );
                                e.dataTransfer.effectAllowed = 'copy';
                            }}
                            style={{
                                borderLeft: cubo.color
                                    ? `4px solid ${cubo.color}`
                                    : '4px solid transparent',
                            }}
                        >
                            <span className="cubo-icon">{cubo.color ? '🎨' : '📦'}</span>
                            <span className="cubo-name">{cubo.title || cubo.name}</span>
                            <span className="cubo-deps">{cubo.files} files</span>
                            <button
                                type="button"
                                className="install-btn"
                                onClick={() => onInstall(cubo)}
                            >
                                Install
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CubosAvailable;