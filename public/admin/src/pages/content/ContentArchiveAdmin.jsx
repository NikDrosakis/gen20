// pages/Page.jsx - ContentArchiveAdmin (με counters και search)
import React, { useState, useEffect } from 'react';
import './Content.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const ContentArchiveAdmin = ({ navigateTo }) => {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredContents, setFilteredContents] = useState([]);

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    // Fetch all content from API
    const fetchContents = async () => {
        setLoading(true);
        try {
            const query = `SELECT 
                c.id,
                c.type,
                c.name,
                c.title,
                c.description,
                c.excerpt,
                c.img,
                c.status,
                c.view_count,
                c.created,
                c.published,
                c.updated,
                c.userid,
                c.classificationid,
                c.lang,
                u.name as author_name,
                u.firstname as author_firstname,
                u.lastname as author_lastname,
                ct.title as category_title
            FROM ${publicdb}.content c
            LEFT JOIN ${publicdb}.user u ON c.userid = u.id
            LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
            ORDER BY c.id DESC`;

            const response = await fetch(`/api/v1/maria/fa?q=${encodeURIComponent(query)}`);
            const result = await response.json();

            let contentsData = [];
            if (result.success && result.data) {
                contentsData = Array.isArray(result.data) ? result.data : [];
            }

            setContents(contentsData);
            setFilteredContents(contentsData);
        } catch (error) {
            console.error('Error fetching contents:', error);
            showNotification('Failed to fetch content', 'error');
            setContents([]);
            setFilteredContents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, []);

    // Search handler
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term.trim() === '') {
            setFilteredContents(contents);
        } else {
            const filtered = contents.filter(content =>
                content.title?.toLowerCase().includes(term) ||
                content.name?.toLowerCase().includes(term) ||
                content.description?.toLowerCase().includes(term) ||
                content.category_title?.toLowerCase().includes(term) ||
                content.author_name?.toLowerCase().includes(term) ||
                content.type?.toLowerCase().includes(term)
            );
            setFilteredContents(filtered);
        }
    };

    const handleDeleteContent = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        const query = `DELETE FROM ${publicdb}.content WHERE id=${id}`;

        try {
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
            showNotification('Delete failed', 'error');
        }
    };

    // Υπολογισμός counters
    const totalPosts = filteredContents.filter(c => c.type === 'post' || !c.type).length;
    const totalPages = filteredContents.filter(c => c.type === 'page').length;
    const totalBlocks = filteredContents.filter(c => c.type === 'block').length;
    const totalComponents = filteredContents.filter(c => c.type === 'component').length;

    const getStatusLabel = (status) => {
        switch(status) {
            case 1: return 'Published';
            case 0: return 'Draft';
            case 2: return 'Closed';
            default: return 'Draft';
        }
    };

    const getStatusColorClass = (status) => {
        switch(status) {
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

    if (loading) {
        return <div className="loading-state">Loading content...</div>;
    }

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
                        {totalBlocks > 0 && (
                            <span className="stat-badge stat-blocks">🧱 Blocks: {totalBlocks}</span>
                        )}
                        {totalComponents > 0 && (
                            <span className="stat-badge stat-components">⚙️ Components: {totalComponents}</span>
                        )}
                        <span className="stat-badge stat-total">📊 Total: {filteredContents.length}</span>
                    </div>
                </div>
                <div className="content-archive-actions">
                    <div className="content-archive-search">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 Search content..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        {searchTerm && (
                            <button
                                className="search-clear"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilteredContents(contents);
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button className="btn-add" onClick={() => navigateTo('page-new')}>
                        + New Article
                    </button>
                </div>
            </div>

            <div className="content-archive-table-wrapper">
                <table className="content-archive-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Img</th>
                        <th>Type</th>
                        <th>Name (URI)</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Views</th>
                        <th>Created</th>
                        <th>Published</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredContents.map(content => (
                        <tr key={content.id}>
                            <td>{content.id}</td>
                            <td>
                                {content.img ? (
                                    <img
                                        src={content.img.startsWith('http') ? content.img : `/media/${content.img}`}
                                        alt=""
                                        className="content-thumbnail"
                                        onError={(e) => {
                                            e.target.src = '/assets/default-image.jpg';
                                            e.target.onerror = null;
                                        }}
                                    />
                                ) : (
                                    <span className="no-image">No image</span>
                                )}
                            </td>
                            <td><span className="content-type-badge">{content.type || 'post'}</span></td>
                            <td>
                                <div className="content-name-cell">
                                    <span className="content-name">{content.name}</span>
                                    <a href={`/post/${content.name}`} target="_blank" rel="noopener noreferrer" className="preview-link">
                                        🔗 Preview
                                    </a>
                                </div>
                            </td>
                            <td>
                                <strong>{content.title || 'Untitled'}</strong>
                                {content.lang && (
                                    <div className="content-default-lang">
                                        Lang: {content.lang}
                                    </div>
                                )}
                            </td>
                            <td>{content.category_title || `Category ${content.classificationid}`}</td>
                            <td>{getAuthorName(content)}</td>
                            <td>
                                    <span className={`status-badge ${getStatusColorClass(content.status)}`}>
                                        {getStatusLabel(content.status)}
                                    </span>
                            </td>
                            <td>{content.view_count?.toLocaleString() || 0}</td>
                            <td>{content.created?.slice(0, 10)}</td>
                            <td>{content.published?.slice(0, 10)}</td>

                            <td>
                                <button
                                    className="btn-edit"
                                    onClick={() => navigateTo('page-edit', content.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn-delete"
                                    onClick={() => handleDeleteContent(content.id, content.title)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {filteredContents.length === 0 && (
                <div className="no-data">
                    {searchTerm ? (
                        <>No results found for "<strong>{searchTerm}</strong>". Try a different search term.</>
                    ) : (
                        'No content found. Click "New Article" to create one.'
                    )}
                </div>
            )}
        </div>
    );
};

export default ContentArchiveAdmin;