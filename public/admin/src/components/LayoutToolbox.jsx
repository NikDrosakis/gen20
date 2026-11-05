// /LayoutToolbox.jsx
import React, {
    useState,
    useMemo,
    useCallback,
    useEffect
} from 'react';

import { useComponentManager } from '../useComponentManager';
import { useDomainContext } from '../useDomainContext';

import CurrentComponents from './CurrentComponents';
import './LayoutToolbox.css';

const AREAS = [
    { key: 'h', label: 'Header', icon: '🔝' },
    { key: 'sl', label: 'Sidebar Left', icon: '⬅️' },
    { key: 'm', label: 'Main', icon: '📄' },
    { key: 'sr', label: 'Sidebar Right', icon: '➡️' },
    { key: 'f', label: 'Footer', icon: '🔻' }
];

const AREA_KEYS = AREAS.map(a => a.key);

const normalizeName = (filename) =>
    String(filename || '')
        .replace(/\.jsx$/i, '')
        .toLowerCase();

const escapeSql = (value) =>
    String(value ?? '').replace(/'/g, "''");

const normalizePath = (path, domain) => {
    let result = String(path || '').replace(/\\/g, '/');

    if (domain && result.startsWith(`${domain}/`)) {
        result = result.slice(domain.length + 1);
    }

    if (result.startsWith('src/')) {
        result = result.slice(4);
    }

    return result.replace(/^\/+/, '');
};

const nowSql = () =>
    new Date().toISOString().slice(0, 19).replace('T', ' ');

const collectJsxFiles = (tree, domain) => {
    const files = [];

    const walk = (children, parentPath = '') => {
        if (!children || typeof children !== 'object') return;

        Object.entries(children).forEach(([key, item]) => {
            if (!item) return;

            const filename = item.name || key;

            if (item.type === 'file') {
                if (!filename.toLowerCase().endsWith('.jsx')) return;

                const path = normalizePath(
                    item.displayPath ||
                    item.path ||
                    `${parentPath}${filename}`,
                    domain
                );

                files.push({
                    name: normalizeName(filename),
                    label: filename.replace(/\.jsx$/i, ''),
                    filename,
                    path,
                    type: 'jsx',
                    description: item.description || '',
                    author: item.author || '',
                    version: item.version || '',
                    dependencies: item.dependencies || [],
                    file_size: item.file_size || null,
                    modified: item.modified || null
                });

                return;
            }

            if (item.children) {
                walk(
                    item.children,
                    `${parentPath}${filename}/`
                );
            }
        });
    };

    walk(tree?.children || tree);

    return files.sort((a, b) => a.name.localeCompare(b.name));
};

const LayoutToolbox = ({
                           onClose,
                           selectedDomain,
                           pageId: pageIdProp
                       }) => {
    const { domain: contextDomain } = useDomainContext();

    const domain =
        selectedDomain || contextDomain || window.location.hostname;

    const publicdb = 'gen_' + domain.replace(/\./g, '');

    const pageIdFromUrl = pageIdProp ? String(pageIdProp) : '';

    const cm = useComponentManager();

    const [pages, setPages] = useState([]);
    const [cubosRows, setCubosRows] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);

    const filesystemComponents = useMemo(() => {
        if (!cm.data || !domain) return [];

        const domainTree = cm.data[domain];
        if (!domainTree) return [];

        return collectJsxFiles(domainTree, domain);
    }, [cm.data, domain]);

    const components = useMemo(() => {
        return filesystemComponents.map(file => {
            const dbComponent = cubosRows.find(
                c => String(c.name).toLowerCase() === file.name
            );

            return {
                ...file,
                ...(dbComponent || {}),
                name: file.name,
                label: file.label,
                path: file.path,
                id: dbComponent?.id || null,
                cubo: dbComponent?.id || null,
                description:
                    dbComponent?.description || file.description,
                author: dbComponent?.author || file.author,
                version: dbComponent?.version || file.version,
                dependencies:
                    dbComponent?.dependencies || file.dependencies
            };
        });
    }, [filesystemComponents, cubosRows]);

    const fetchData = useCallback(async () => {
        if (cm.loading) return;

        setLoading(true);

        try {
            const pageId = parseInt(pageIdFromUrl, 10);

            const pageFilter =
                Number.isInteger(pageId) && pageId > 0
                    ? `AND id = ${pageId}`
                    : '';

            const relFilter =
                Number.isInteger(pageId) && pageId > 0
                    ? `WHERE contentid = ${pageId}`
                    : '';

            const queries = [
                `SELECT * FROM ${publicdb}.content
                 WHERE type = 'page' ${pageFilter}
                 ORDER BY sort ASC`,

                `SELECT * FROM ${publicdb}.content_cubos
                 ${relFilter}
                 ORDER BY sort ASC`,

                `SELECT * FROM ${publicdb}.cubos
                 ORDER BY name ASC`
            ];

            const responses = await Promise.all(
                queries.map(query =>
                    fetch(
                        `/api/v1/maria/fa?folder=${encodeURIComponent(
                            query.replace(/\s+/g, ' ').trim()
                        )}`
                    ).then(res => res.json())
                )
            );

            const [pagesData, relData, cubosData] = responses;

            if (!pagesData.success) {
                throw new Error('Unable to load pages');
            }

            const relations = Array.isArray(relData.data)
                ? relData.data
                : [];

            const cubos = Array.isArray(cubosData.data)
                ? cubosData.data
                : [];

            setCubosRows(cubos);

            const pagesWithComponents = (pagesData.data || []).map(
                page => {
                    const pageRelations = relations.filter(
                        relation =>
                            Number(relation.contentid) ===
                            Number(page.id)
                    );

                    const result = { ...page };

                    AREA_KEYS.forEach(area => {
                        result[area] = pageRelations
                            .filter(relation => relation.area === area)
                            .sort(
                                (a, b) =>
                                    Number(a.sort) - Number(b.sort)
                            )
                            .map(relation =>
                                Number(relation.cubosid)
                            );
                    });

                    return result;
                }
            );

            setPages(pagesWithComponents);
        } catch (error) {
            console.error('LayoutToolbox fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [cm.loading, publicdb, pageIdFromUrl]);

    useEffect(() => {
        if (!cm.loading) {
            fetchData();
        }
    }, [cm.loading, fetchData]);

    const resolveCubo = useCallback(
        async (component) => {
            const rawName =
                component.filename || component.name || '';

            const name = normalizeName(rawName).toLowerCase();
            const path = normalizePath(component.path, domain);

            if (!name || !path) {
                throw new Error('Component name or path is missing');
            }

            const selectQuery = `
                SELECT id
                FROM ${publicdb}.cubos
                WHERE name = '${escapeSql(name)}'
                LIMIT 1
            `
                .replace(/\s+/g, ' ')
                .trim();

            const selectResponse = await fetch(
                `/api/v1/maria/fa?folder=${encodeURIComponent(
                    selectQuery
                )}`
            );

            const selectData = await selectResponse.json();

            if (selectData.success && selectData.data?.length) {
                return Number(selectData.data[0].id);
            }

            const createdAt = nowSql();

            const insertResponse = await fetch(
                '/api/v1/maria/insert',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        table: `${publicdb}.cubos`,
                        params: {
                            name,
                            path,
                            status: 'active',
                            created: createdAt,
                            updated: createdAt
                        }
                    })
                }
            );

            const insertData = await insertResponse.json();

            if (!insertData.success) {
                throw new Error(
                    insertData.error ||
                    `Could not register Cubo: ${name}`
                );
            }

            const verifyResponse = await fetch(
                `/api/v1/maria/fa?folder=${encodeURIComponent(
                    selectQuery
                )}`
            );

            const verifyData = await verifyResponse.json();

            if (!verifyData.success || !verifyData.data?.length) {
                throw new Error(
                    `Cubo ID not found after insert: ${name}`
                );
            }

            const id = Number(verifyData.data[0].id);

            setCubosRows(prev => {
                if (prev.some(c => Number(c.id) === id)) {
                    return prev;
                }

                return [
                    ...prev,
                    { id, name, path, status: 'active' }
                ];
            });

            return id;
        },
        [publicdb, domain]
    );

    const handleDragStart = useCallback((e, item, type) => {
        const payload = {
            name: item.name,
            filename: item.filename,
            path: item.path,
            type
        };

        setDraggedItem(payload);

        e.dataTransfer.setData(
            'text/plain',
            JSON.stringify(payload)
        );

        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    }, []);

    const handleDragEnd = useCallback((e) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedItem(null);
    }, []);

    const handleDragOver = useCallback((e, pageId, area) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDropTarget({ pageId, area });
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.currentTarget.classList.remove('drag-over');
        setDropTarget(null);
    }, []);

    const addComponentToArea = useCallback(
        async (contentid, area, component) => {
            if (!AREA_KEYS.includes(area)) return;

            try {
                const page = pages.find(
                    p => Number(p.id) === Number(contentid)
                );

                if (!page) {
                    throw new Error('Target page not found');
                }

                const cubosid = await resolveCubo(component);

                const existing = page[area] || [];

                if (existing.some(id => Number(id) === cubosid)) {
                    return;
                }

                const sortQuery = `
                    SELECT COALESCE(MAX(sort), -1) + 1 AS nextSort
                    FROM ${publicdb}.content_cubos
                    WHERE contentid = ${Number(contentid)}
                    AND area = '${area}'
                `
                    .replace(/\s+/g, ' ')
                    .trim();

                const sortResponse = await fetch(
                    `/api/v1/maria/fa?folder=${encodeURIComponent(
                        sortQuery
                    )}`
                );

                const sortData = await sortResponse.json();

                const sort = Number(
                    sortData.data?.[0]?.nextSort ?? 0
                );

                const createdAt = nowSql();

                const response = await fetch(
                    '/api/v1/maria/insert',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            table: `${publicdb}.content_cubos`,
                            params: {
                                contentid: Number(contentid),
                                cubosid,
                                area,
                                sort,
                                created: createdAt,
                                updated: createdAt
                            }
                        })
                    }
                );

                const result = await response.json();

                if (!result.success) {
                    throw new Error(
                        result.error || 'Placement insert failed'
                    );
                }

                setPages(prev =>
                    prev.map(p =>
                        Number(p.id) === Number(contentid)
                            ? {
                                ...p,
                                [area]: [
                                    ...(p[area] || []),
                                    cubosid
                                ]
                            }
                            : p
                    )
                );

                setCubosRows(prev =>
                    prev.map(cubo =>
                        Number(cubo.id) === cubosid
                            ? {
                                ...cubo,
                                instances:
                                    Number(cubo.instances || 0) + 1
                            }
                            : cubo
                    )
                );
            } catch (error) {
                console.error(
                    'addComponentToArea error:',
                    error
                );
            }
        },
        [pages, publicdb, resolveCubo]
    );

    const removeComponentFromArea = useCallback(
        async (contentid, area, cubosid) => {
            if (!AREA_KEYS.includes(area)) return;

            try {
                const deleteQuery = `
                    DELETE FROM ${publicdb}.content_cubos
                    WHERE contentid = ${Number(contentid)}
                    AND area = '${area}'
                    AND cubosid = ${Number(cubosid)}
                `
                    .replace(/\s+/g, ' ')
                    .trim();

                await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: deleteQuery })
                });

                const remainingQuery = `
                    SELECT id
                    FROM ${publicdb}.content_cubos
                    WHERE contentid = ${Number(contentid)}
                    AND area = '${area}'
                    ORDER BY sort ASC, id ASC
                `
                    .replace(/\s+/g, ' ')
                    .trim();

                const remainingRes = await fetch(
                    `/api/v1/maria/fa?folder=${encodeURIComponent(
                        remainingQuery
                    )}`
                );

                const remainingData = await remainingRes.json();

                const remaining = Array.isArray(remainingData.data)
                    ? remainingData.data
                    : [];

                for (let i = 0; i < remaining.length; i++) {
                    await fetch('/api/v1/maria/q', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            query: `
                                UPDATE ${publicdb}.content_cubos
                                SET sort = ${i}
                                WHERE id = ${Number(remaining[i].id)}
                            `
                                .replace(/\s+/g, ' ')
                                .trim()
                        })
                    });
                }

                setPages(prev =>
                    prev.map(p =>
                        Number(p.id) === Number(contentid)
                            ? {
                                ...p,
                                [area]: (p[area] || []).filter(
                                    id =>
                                        Number(id) !==
                                        Number(cubosid)
                                )
                            }
                            : p
                    )
                );

                setCubosRows(prev =>
                    prev.map(cubo =>
                        Number(cubo.id) === Number(cubosid)
                            ? {
                                ...cubo,
                                instances: Math.max(
                                    0,
                                    Number(cubo.instances || 0) -
                                    1
                                )
                            }
                            : cubo
                    )
                );
            } catch (error) {
                console.error(
                    'removeComponentFromArea error:',
                    error
                );
            }
        },
        [publicdb]
    );

    const clearPage = useCallback(
        async (pageId) => {
            if (
                !window.confirm(
                    'Clear all components from this page?'
                )
            ) {
                return;
            }

            try {
                await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `
                            DELETE FROM ${publicdb}.content_cubos
                            WHERE contentid = ${Number(pageId)}
                        `
                            .replace(/\s+/g, ' ')
                            .trim()
                    })
                });

                setPages(prev =>
                    prev.map(p =>
                        Number(p.id) === Number(pageId)
                            ? {
                                ...p,
                                h: [],
                                sl: [],
                                m: [],
                                sr: [],
                                f: []
                            }
                            : p
                    )
                );
            } catch (error) {
                console.error('clearPage error:', error);
            }
        },
        [publicdb]
    );

    const handleDrop = useCallback(
        async (e, pageId, area) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            setDropTarget(null);

            try {
                const data = JSON.parse(
                    e.dataTransfer.getData('text/plain')
                );

                if (data.type !== 'component') return;

                if (!data.name || !data.path) {
                    throw new Error(
                        'Invalid component payload. Expected name and path.'
                    );
                }

                await addComponentToArea(pageId, area, {
                    name: data.name,
                    filename:
                        data.filename ||
                        data.name + '.jsx',
                    path: data.path
                });
            } catch (error) {
                console.error('Layout drop error:', error);
            }
        },
        [addComponentToArea]
    );

    const getComponentName = useCallback(
        (cubosid) => {
            const component = cubosRows.find(
                c => Number(c.id) === Number(cubosid)
            );

            return component
                ? component.name
                : `Component ${cubosid}`;
        },
        [cubosRows]
    );

    const toggleDescription = useCallback((componentId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [componentId]: !prev[componentId]
        }));
    }, []);

    const renderPage = (page) => {
        return (
            <div className="lt-page" key={page.id}>
                <div className="lt-page-header">
                    <div className="lt-page-title">
                        <span className="lt-page-id">
                            #{page.id}
                        </span>{' '}
                        {page.title || 'Untitled'}
                    </div>
                    <div className="lt-page-actions">
                        <button
                            type="button"
                            className="lt-btn-clear"
                            onClick={() => clearPage(page.id)}
                            title="Clear all components"
                        >
                            🗑 Clear
                        </button>
                    </div>
                </div>

                <div className="lt-areas">
                    {AREAS.map(({ key, label, icon }) => {
                        const isOver =
                            dropTarget &&
                            Number(dropTarget.pageId) ===
                            Number(page.id) &&
                            dropTarget.area === key;

                        return (
                            <div
                                key={key}
                                className={`lt-area lt-area-${key} ${
                                    isOver ? 'drag-over' : ''
                                }`}
                                onDragOver={(e) =>
                                    handleDragOver(e, page.id, key)
                                }
                                onDragLeave={handleDragLeave}
                                onDrop={(e) =>
                                    handleDrop(e, page.id, key)
                                }
                            >
                                <div className="lt-area-label">
                                    <span>
                                        {icon} {label}
                                    </span>
                                    <span className="lt-area-count">
                                        {(page[key] || []).length}
                                    </span>
                                </div>

                                <div className="lt-area-items">
                                    {(page[key] || []).length ===
                                    0 ? (
                                        <div className="lt-area-empty">
                                            Drop components here
                                        </div>
                                    ) : (
                                        (page[key] || []).map(
                                            cubosid => (
                                                <div
                                                    key={cubosid}
                                                    className="lt-item"
                                                >
                                                    <span className="lt-item-name">
                                                        {getComponentName(
                                                            cubosid
                                                        )}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="lt-item-remove"
                                                        onClick={() =>
                                                            removeComponentFromArea(
                                                                page.id,
                                                                key,
                                                                cubosid
                                                            )
                                                        }
                                                        title="Remove"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="layout-toolbox">
            <div className="layout-toolbox-header">
                <h3>📐 Layout Toolbox</h3>

                <div className="layout-toolbox-actions">
                    <span className="layout-toolbox-domain">
                        {domain}
                    </span>

                    {pageIdFromUrl && (
                        <span className="layout-toolbox-page-id">
                            page #{pageIdFromUrl}
                        </span>
                    )}

                    <button
                        className="layout-toolbox-refresh"
                        onClick={fetchData}
                        disabled={loading || cm.loading}
                        title="Refresh data"
                    >
                        {loading || cm.loading ? '⏳' : '🔄'}
                    </button>

                    {onClose && (
                        <button
                            className="layout-toolbox-close"
                            onClick={onClose}
                            title="Close"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="layout-toolbox-body">
                <div className="layout-toolbox-left">
                    {loading || cm.loading ? (
                        <div className="layout-toolbox-loading">
                            Loading pages...
                        </div>
                    ) : pages.length === 0 ? (
                        <div className="layout-toolbox-empty">
                            No pages found.
                        </div>
                    ) : (
                        <div className="lt-pages">
                            {pages.map(renderPage)}
                        </div>
                    )}
                </div>

                <div className="layout-toolbox-right">
                    <CurrentComponents
                        components={components}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        expandedDescriptions={
                            expandedDescriptions
                        }
                        onToggleDescription={toggleDescription}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    />
                </div>
            </div>
        </div>
    );
};

export default LayoutToolbox;