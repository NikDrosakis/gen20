// pages/Page.jsx - ContentArchiveAdmin
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Content.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
const FALLBACK_CONTENT_TYPES = ['post', 'page', 'block', 'website', 'video'];

const sqlEscape = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const parseEnumValues = (columnType) => {
    const match = String(columnType || '').match(/^enum\((.*)\)$/i);
    if (!match) return [];
    return [...match[1].matchAll(/'((?:\\.|[^'])*)'/g)].map((item) =>
        item[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\')
    );
};

const ContentArchiveAdmin = ({ navigateTo }) => {
    const [contents, setContents] = useState([]);
    const [classifications, setClassifications] = useState([]);
    const [contentTypes, setContentTypes] = useState(FALLBACK_CONTENT_TYPES);
    const [selectedClassificationId, setSelectedClassificationId] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    const fetchClassifications = async () => {
        try {
            const query = `SELECT id, name, title FROM ${publicdb}.classification ORDER BY title ASC, name ASC`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();
            if (!result.success || !Array.isArray(result.data)) {
                throw new Error(result.error || 'Could not load classifications');
            }
            setClassifications(result.data);
        } catch (error) {
            console.error('Error fetching classifications:', error);
            showNotification('Failed to load classifications', 'error');
        }
    };

    const fetchContentTypes = async () => {
        try {
            const query = `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA='${publicdb}' AND TABLE_NAME='content' AND COLUMN_NAME='type'`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();
            const enumValues = result.success && Array.isArray(result.data)
                ? parseEnumValues(result.data[0]?.COLUMN_TYPE)
                : [];
            if (enumValues.length) setContentTypes(enumValues);
        } catch (error) {
            console.error('Error fetching content types:', error);
        }
    };

    const fetchContents = useCallback(async () => {
        setLoading(true);
        try {
            const query = `SELECT
                    c.id, c.type, c.name, c.title, c.description, c.excerpt, c.img, c.url,
                    c.status, c.view_count, c.created, c.published, c.updated, c.userid,
                    c.classificationid, c.lang, c.sort,
                    u.name AS author_name, u.firstname AS author_firstname,
                    u.lastname AS author_lastname,
                    ct.name AS category_name, ct.title AS category_title
                FROM ${publicdb}.content c
                LEFT JOIN ${publicdb}.user u ON c.userid = u.id
                LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
                ORDER BY c.sort ASC, c.published DESC, c.id DESC`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to fetch content');
            setContents(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error('Error fetching contents:', error);
            showNotification('Failed to fetch content', 'error');
            setContents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClassifications();
        fetchContentTypes();
        fetchContents();
    }, [fetchContents]);

    const filteredContents = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return contents.filter((content) => {
            const matchesClassification = !selectedClassificationId ||
                String(content.classificationid) === String(selectedClassificationId);
            const matchesType = selectedType === 'all' || content.type === selectedType;
            const matchesSearch = !term ||
                content.title?.toLowerCase().includes(term) ||
                content.name?.toLowerCase().includes(term) ||
                content.description?.toLowerCase().includes(term) ||
                content.excerpt?.toLowerCase().includes(term) ||
                content.category_title?.toLowerCase().includes(term) ||
                content.category_name?.toLowerCase().includes(term) ||
                content.author_name?.toLowerCase().includes(term) ||
                content.type?.toLowerCase().includes(term);
            return matchesClassification && matchesType && matchesSearch;
        });
    }, [contents, selectedClassificationId, selectedType, searchTerm]);

    const updateSortOrder = async (id, sort) => {
        const query = `UPDATE ${publicdb}.content
            SET sort=${Number(sort)}
            WHERE id=${Number(id)}
              AND classificationid=${Number(selectedClassificationId)}`;
        const response = await fetch('/api/v1/maria/q', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([query, []])
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error || `Failed to sort item ${id}`);
    };

    const handleSortEnd = useCallback(async () => {
        // Reordering is enabled only for one complete classification (no search/type filters).
        const rows = document.querySelectorAll('#contentSortable tbody tr[data-id]');
        const orderList = Array.from(rows).map((row, index) => ({
            id: Number(row.getAttribute('data-id')),
            sort: index + 1
        })).filter((item) => item.id > 0);

        try {
            for (const item of orderList) {
                await updateSortOrder(item.id, item.sort);
            }
            setContents((current) => current.map((content) => {
                const item = orderList.find((entry) => entry.id === Number(content.id));
                return item ? { ...content, sort: item.sort } : content;
            }));
            showNotification('Sort order updated', 'success');
        } catch (error) {
            console.error('Error updating sort order:', error);
            showNotification('Failed to update sort order', 'error');
            fetchContents();
        }
    }, [selectedClassificationId, fetchContents]);

    const canReorder = Boolean(selectedClassificationId) &&
        selectedType === 'all' && searchTerm.trim() === '';

    useEffect(() => {
        if (!canReorder || loading || filteredContents.length < 2 ||
            typeof window.Sortable === 'undefined') return undefined;
        const tbody = document.querySelector('#contentSortable tbody');
        if (!tbody) return undefined;
        const sortable = new window.Sortable(tbody, {
            animation: 150,
            handle: '.content-sort-handle',
            draggable: 'tr[data-id]',
            onEnd: handleSortEnd
        });
        return () => sortable.destroy();
    }, [canReorder, loading, filteredContents.length, handleSortEnd]);

    const handleDeleteContent = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title || 'Untitled'}"?`)) return;
        try {
            const query = `DELETE FROM ${publicdb}.content WHERE id=${Number(id)}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            const result = await response.json();
            if (result.success === true) {
                showNotification('Content deleted successfully', 'success');
                fetchContents();
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            showNotification('Delete failed: ' + error.message, 'error');
        }
    };

    const getStatusLabel = (status) => {
        switch (Number(status)) {
            case 1: return 'Published';
            case 0: return 'Draft';
            case 2: return 'Closed';
            default: return 'Draft';
        }
    };

    const getStatusColorClass = (status) => {
        switch (Number(status)) {
            case 1: return 'status-published';
            case 0: return 'status-draft';
            case 2: return 'status-closed';
            default: return 'status-draft';
        }
    };

    const getAuthorName = (content) => {
        if (content.author_firstname || content.author_lastname) {
            return `${content.author_firstname || ''} ${content.author_lastname || ''}`.trim();
        }
        return content.author_name || `User ${content.userid}`;
    };

    const getTypeCount = (type) => {
        const term = searchTerm.trim().toLowerCase();
        return contents.filter((content) => {
            const matchesClassification = !selectedClassificationId ||
                String(content.classificationid) === String(selectedClassificationId);
            const matchesSearch = !term ||
                content.title?.toLowerCase().includes(term) ||
                content.name?.toLowerCase().includes(term) ||
                content.description?.toLowerCase().includes(term) ||
                content.excerpt?.toLowerCase().includes(term) ||
                content.category_title?.toLowerCase().includes(term) ||
                content.category_name?.toLowerCase().includes(term) ||
                content.author_name?.toLowerCase().includes(term) ||
                content.type?.toLowerCase().includes(term);
            return matchesClassification && matchesSearch && content.type === type;
        }).length;
    };
    const totalPosts = filteredContents.filter((content) => content.type === 'post' || !content.type).length;
    const totalPages = filteredContents.filter((content) => content.type === 'page').length;
    const totalBlocks = filteredContents.filter((content) => content.type === 'block').length;
    const totalComponents = filteredContents.filter((content) => content.type === 'component').length;

    if (loading) return <div className="loading-state">Loading content...</div>;

    return (
        <div className="content-archive-container">
            {apiStatus.show && (
                <div className={`notification notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="content-archive-header">
                <div className="content-archive-title-section">
                    <h1 className="content-archive-title">📄 Content Manager</h1>
                    <div className="content-archive-stats">
                        <span className="stat-badge stat-posts">📝 Posts: {totalPosts}</span>
                        <span className="stat-badge stat-pages">📄 Pages: {totalPages}</span>
                        {totalBlocks > 0 && <span className="stat-badge stat-blocks">🧱 Blocks: {totalBlocks}</span>}
                        {totalComponents > 0 && <span className="stat-badge stat-components">⚙️ Components: {totalComponents}</span>}
                        <span className="stat-badge stat-total">📊 Total: {filteredContents.length}</span>
                    </div>
                </div>

                <div className="content-archive-actions">
                    <select
                        className="search-input content-classification-select"
                        value={selectedClassificationId}
                        onChange={(event) => setSelectedClassificationId(event.target.value)}
                        aria-label="Filter by classification"
                    >
                        <option value="">All classifications</option>
                        {classifications.map((classification) => (
                            <option key={classification.id} value={classification.id}>
                                {classification.title || classification.name || `Classification ${classification.id}`}
                            </option>
                        ))}
                    </select>

                    <div className="content-archive-search">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 Search content..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                        {searchTerm && (
                            <button className="search-clear" onClick={() => setSearchTerm('')} aria-label="Clear search">
                                ✕
                            </button>
                        )}
                    </div>
                    <button className="btn-add" onClick={() => navigateTo('page-new')}>
                        + New Content
                    </button>
                </div>
            </div>

            <div className="content-type-filters" role="group" aria-label="Filter by content type">
                <button
                    type="button"
                    className={`content-type-filter ${selectedType === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedType('all')}
                >
                    All types <span>{contents.filter((content) =>
                    (!selectedClassificationId || String(content.classificationid) === String(selectedClassificationId))
                ).length}</span>
                </button>
                {contentTypes.map((type) => (
                    <button
                        key={type}
                        type="button"
                        className={`content-type-filter ${selectedType === type ? 'active' : ''}`}
                        onClick={() => setSelectedType(type)}
                    >
                        {type} <span>{getTypeCount(type)}</span>
                    </button>
                ))}
            </div>

            {canReorder && (
                <p className="content-sort-hint">Drag rows using the ⋮⋮ handle to change their order within this classification.</p>
            )}

            <div className="content-archive-table-wrapper">
                <table id="contentSortable" className="content-archive-table">
                    <thead>
                    <tr>
                        <th>{canReorder ? 'Sort' : 'ID'}</th>
                        <th>Img</th>
                        <th>Type</th>
                        <th>Name (URI)</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Published</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredContents.map((content) => (
                        <tr key={content.id} data-id={content.id}>
                            <td>
                                {canReorder ? (
                                    <span className="content-sort-handle" title="Drag to reorder"
                                          style={{cursor: 'grab'}}>
                                            ⋮⋮ <span>{content.sort ?? content.id}</span>
                                        </span>
                                ) : content.id}
                            </td>
                            <td>
                                {content.type === 'video' && content.url ? (
                                        <div className="content-iframe-wrapper">
                                            <iframe
                                                src={
                                                    content.url.includes('youtube.com/watch') || content.url.includes('youtu.be')
                                                        ? content.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                                                        : content.url
                                                }
                                                title={content.title || 'Video'}
                                                className="content-iframe"
                                                loading="lazy"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            /></div>
                                            ) : content.img ? (
                                    <img
                                        src={content.img.startsWith('http') ? content.img : `/media/${content.img}`}
                                        alt={content.title || ''}
                                        className="content-thumbnail"
                                        loading="lazy"
                                        onError={(event) => {
                                            event.currentTarget.src = '/assets/default-image.jpg';
                                            event.currentTarget.onerror = null;
                                        }}
                                    />
                                ) : (
                                    <span className="no-image">No image</span>
                                )}
                            </td>
                            <td><span className="content-type-badge">{content.type || 'post'}</span></td>
                            <td>
                                <div className="content-name-cell">
                                    <span className="content-name">{content.name || '—'}</span>
                                    {content.name && (
                                        <a href={`/post/${content.name}`} target="_blank" rel="noopener noreferrer"
                                           className="preview-link">
                                            🔗 Preview
                                        </a>
                                    )}
                                </div>
                            </td>
                            <td>
                                {content.title || 'Untitled'}
                                {content.lang && <div className="content-default-lang">Lang: {content.lang}</div>}
                                {content.excerpt && <div className="content-excerpt">{content.excerpt}</div>}
                            </td>
                            <td>{content.category_title || content.category_name || `Category ${content.classificationid}`}</td>
                            <td>{getAuthorName(content)}</td>
                            <td>
                                    <span className={`status-badge ${getStatusColorClass(content.status)}`}>
                                        {getStatusLabel(content.status)}
                                    </span>
                            </td>
                            <td>{Number(content.view_count || 0).toLocaleString()}</td>
                            <td>{content.published ? new Date(content.published).toLocaleDateString('el-GR') : ''}</td>
                            <td>
                                <button className="btn-edit" onClick={() => navigateTo('page-edit', content.id)}
                                        title="Edit">✏️
                                </button>
                                <button className="btn-delete"
                                        onClick={() => handleDeleteContent(content.id, content.title)}
                                        title="Delete">🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {filteredContents.length === 0 && (
                <div className="no-data">
                    {searchTerm
                        ? <>No results found for "<strong>{searchTerm}</strong>". Try a different search term.</>
                        : 'No content found for the selected filters.'}
                </div>
            )}
        </div>
    );
};

export default ContentArchiveAdmin;
