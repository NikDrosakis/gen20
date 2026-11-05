// components/SrcFilesList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PreviewModal from './PreviewModal';

const EXCLUDED_NAMES = new Set([
    'app', 'main', 'router', 'index',
]);

const isComponentFile = (name) => {
    const lower = name.toLowerCase();
    if (!lower.endsWith('.jsx')) return false;
    const base = lower.replace(/\.jsx$/i, '');
    if (EXCLUDED_NAMES.has(base)) return false;
    if (base.includes('context')) return false;
    if (base.includes('.test') || base.includes('.spec')) return false;
    return true;
};

export default function SrcFilesList({ domain = 'admin' }) {
    const [tree, setTree] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [expandedDeps, setExpandedDeps] = useState({});
    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.all([
            fetch('/api/v1/local/getComponentFiles').then(r => r.json()),
            fetch('/api/v1/local/getCuboPackages').then(r => r.json())
        ])
            .then(([filesJson, packagesJson]) => {
                const d = filesJson?.data?.data?.[domain];
                setTree(d?.children || {});
                const pkgData = packagesJson?.data;
                setPackages(
                    Array.isArray(pkgData)
                        ? pkgData.map(p => String(p).toLowerCase())
                        : []
                );
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [domain]);

    const files = useMemo(() => {
        const out = [];
        const walk = (children, parentPath = '') => {
            Object.entries(children || {}).forEach(([name, item]) => {
                if (!item) return;
                const path = parentPath ? `${parentPath}/${name}` : name;

                if (item.type === 'file') {
                    if (!isComponentFile(name)) return;

                    const baseName = name.replace(/\.jsx$/i, '');
                    const cubosName = item.cubos_name ? String(item.cubos_name).toLowerCase() : null;

                    out.push({
                        name: baseName,
                        filename: name,
                        path,
                        dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
                        inPackage: item.in_package === true,
                        inPlace: item.in_place === true,
                        cubosName,
                    });
                } else if (item.children) {
                    walk(item.children, path);
                }
            });
        };
        walk(tree);
        return out.sort((a, b) => a.name.localeCompare(b.name));
    }, [tree]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return files;
        return files.filter(f =>
            f.name.toLowerCase().includes(term) ||
            f.path.toLowerCase().includes(term)
        );
    }, [files, search]);

    const toggleDeps = (path) => {
        setExpandedDeps(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const handleDragStart = (e, file) => {
        const payload = {
            type: 'component',
            name: file.name,
            filename: file.filename,
            path: file.path,
            cubosName: file.cubosName
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
    };

    const getFileStatus = (file) => {
        if (!file.inPlace) return 'broken-deps';   // Κόκκινο
        if (!file.inPackage) return 'not-cubos';   // Κίτρινο
        return 'ok';                               // Πράσινο
    };

    const statusStyle = {
        'ok': {
            bg: '#f0fff4',
            border: '#38a169',
            icon: '✅'
        },
        'not-cubos': {
            bg: '#fffbeb',
            border: '#f59e0b',
            icon: '⚠️'
        },
        'broken-deps': {
            bg: '#fef2f2',
            border: '#ef4444',
            icon: '⛔'
        },
    };

    if (loading) return <div className="src-files-list">Loading files…</div>;
    if (error) return <div className="src-files-list">Error: {error}</div>;

    return (
        <div className="src-files-list">
            <div className="src-files-header">
                <h4 style={{ margin: 0 }}>src/ files ({filtered.length})</h4>
            </div>

            <input
                type="text"
                className="src-files-search"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: '100%', padding: 6, margin: '8px 0',
                    border: '1px solid #ccc', borderRadius: 4,
                    fontSize: 12, boxSizing: 'border-box'
                }}
            />

            {filtered.length === 0 ? (
                <div className="src-files-empty" style={{ padding: 12, color: '#888', fontSize: 12 }}>
                    No files
                </div>
            ) : (
                <ul className="src-files-items" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filtered.map(file => {
                        const status = getFileStatus(file);
                        const s = statusStyle[status];

                        return (
                            <li
                                role="button"
                                tabIndex={0}
                                onDoubleClick={() => setPreviewFile(file.path)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setPreviewFile(file.path);
                                    }
                                }}
                                key={file.path} style={{ marginBottom: 4 }}>
                                <div
                                    className="src-file-item"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, file)}
                                    onDragEnd={handleDragEnd}
                                    title={file.path + (file.cubosName ? `\ncubos: ${file.cubosName}` : '')}
                                    style={{
                                        padding: '6px 8px',
                                        background: s.bg,
                                        border: `1px solid ${s.border}`,
                                        borderRadius: 4,
                                        cursor: 'grab',
                                        fontSize: 12,
                                        fontFamily: 'monospace',
                                        userSelect: 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>
                                        {s.icon} {file.name}
                                        {file.cubosName && (
                                            <span style={{
                                                fontSize: 10, marginLeft: 6,
                                                color: file.inPackage ? '#38a169' : '#f59e0b',
                                                fontWeight: 'bold'
                                            }}>
                                                [{file.cubosName}]
                                            </span>
                                        )}
                                        {!file.inPackage && file.inPlace && (
                                            <span style={{ color: '#f59e0b', fontSize: 10, marginLeft: 6 }}>
                                                ready for cubos
                                            </span>
                                        )}
                                        {!file.inPlace && (
                                            <span style={{ color: '#ef4444', fontSize: 10, marginLeft: 6 }}>
                                                broken deps
                                            </span>
                                        )}
                                    </span>
                                    {file.dependencies.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleDeps(file.path); }}
                                            title={`${file.dependencies.length} dependencies`}
                                            style={{
                                                background: '#e8f4ff',
                                                border: '1px solid #4a90e2',
                                                borderRadius: 4,
                                                padding: '2px 6px',
                                                fontSize: 10,
                                                cursor: 'pointer',
                                                color: '#4a90e2'
                                            }}
                                        >
                                            {file.dependencies.length} deps
                                        </button>
                                    )}
                                </div>

                                {expandedDeps[file.path] && file.dependencies.length > 0 && (
                                    <ul style={{
                                        listStyle: 'none', padding: '4px 0 4px 20px', margin: 0,
                                        fontSize: 11, color: '#555', fontFamily: 'monospace',
                                        borderLeft: '2px solid #4a90e2', marginLeft: 8
                                    }}>
                                        {file.dependencies.map((dep, i) => {
                                            const resolvedPath = dep.path || dep;
                                            return (
                                                <li key={i}>↳ {resolvedPath}</li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}