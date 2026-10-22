// pages/Links.jsx
import React, { useState, useEffect } from 'react';
import './Links.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const LinksAdmin = ({ navigateTo }) => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [saving, setSaving] = useState(false);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        classification_id: 1,
        title: '',
        type: 'video',
        url: ''
    });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const query = `SELECT * FROM ${publicdb}.links ORDER BY sort ASC, id ASC`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success && result.data) {
                setLinks(result.data);
            } else {
                setLinks([]);
            }
        } catch (error) {
            console.error('Error fetching links:', error);
            showNotification('Failed to load links', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.url) {
            showNotification('Title and URL are required', 'error');
            return;
        }

        setSaving(true);
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        try {
            if (editingLink) {
                // UPDATE
                const query = `UPDATE ${publicdb}.links SET
                    classification_id=${parseInt(formData.classification_id) || 1},
                    title='${formData.title.replace(/'/g, "\\'")}',
                    type='${formData.type}',
                    url='${formData.url.replace(/'/g, "\\'")}'
                WHERE id=${editingLink.id}`;

                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([query, []])
                });

                const result = await response.json();
                if (result.success) {
                    showNotification('Link updated successfully', 'success');
                    setShowModal(false);
                    setEditingLink(null);
                    fetchLinks();
                } else {
                    throw new Error(result.error || 'Update failed');
                }
            } else {
                // INSERT
                const maxSort = links.length > 0 ? Math.max(...links.map(l => l.sort || 0)) : 0;
                const query = `INSERT INTO ${publicdb}.links
                    (classification_id, title, type, url, sort)
                VALUES (
                    ${parseInt(formData.classification_id) || 1},
                    '${formData.title.replace(/'/g, "\\'")}',
                    '${formData.type}',
                    '${formData.url.replace(/'/g, "\\'")}',
                    ${maxSort + 1}
                )`;

                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([query, []])
                });

                const result = await response.json();
                if (result.success) {
                    showNotification('Link added successfully', 'success');
                    setShowModal(false);
                    fetchLinks();
                } else {
                    throw new Error(result.error || 'Insert failed');
                }
            }
        } catch (error) {
            console.error('Error saving link:', error);
            showNotification('Save failed: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            const query = `DELETE FROM ${publicdb}.links WHERE id=${id}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Link deleted successfully', 'success');
                fetchLinks();
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting link:', error);
            showNotification('Delete failed: ' + error.message, 'error');
        }
    };

    const handleEdit = (link) => {
        setEditingLink(link);
        setFormData({
            classification_id: link.classification_id || 1,
            title: link.title || '',
            type: link.type || 'video',
            url: link.url || ''
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingLink(null);
        setFormData({
            classification_id: 1,
            title: '',
            type: 'video',
            url: ''
        });
        setShowModal(true);
    };

    const updateSortOrder = async (id, sort) => {
        try {
            const query = `UPDATE ${publicdb}.links SET sort = ${sort} WHERE id = ${id}`;
            await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
        } catch (error) {
            console.error('Error updating sort order:', error);
        }
    };

    const handleSortEnd = async (evt) => {
        const orderList = [];
        const rows = document.querySelectorAll('#sortableLinks tbody tr');

        rows.forEach((element, index) => {
            const id = element.getAttribute('data-id');
            if (id) {
                orderList.push({ id: parseInt(id), sort: index + 1 });
            }
        });

        for (let i = 0; i < orderList.length; i++) {
            await updateSortOrder(orderList[i].id, orderList[i].sort);
        }

        fetchLinks();
        showNotification('Sort order updated', 'success');
    };

    // Initialize Sortable
    useEffect(() => {
        if (typeof window.Sortable !== 'undefined' && !loading && links.length > 0) {
            const tbody = document.querySelector('#sortableLinks tbody');
            if (tbody) {
                const sortable = new window.Sortable(tbody, {
                    animation: 150,
                    onEnd: handleSortEnd,
                    handle: '.sort-handle'
                });
                return () => sortable.destroy();
            }
        }
    }, [loading, links]);

    const getTypeIcon = (type) => {
        switch(type) {
            case 'video': return '▶️';
            case 'vimeo': return '📹';
            case 'dailymotion': return '🎬';
            case 'twitch': return '🎮';
            default: return '🔗';
        }
    };

    const getPreviewUrl = (url, type) => {
        if (type === 'video') {
            const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?#]+)/)?.[1];
            return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : null;
        }
        return null;
    };

    if (loading) {
        return <div className="links-loading">Loading links...</div>;
    }

    return (
        <div className="links-container">
            {apiStatus.show && (
                <div className={`links-notification links-notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="links-header">
                <h1>🔗 Links Manager</h1>
                <button className="links-add-btn" onClick={handleAddNew}>
                    + Add New Link
                </button>
            </div>

            {links.length === 0 ? (
                <div className="links-empty">
                    <p>🔗 No links found. Click "Add New Link" to create one.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table id="sortableLinks" className="styled-table">
                        <thead>
                        <tr>
                            <th style={{ width: '50px' }}>Sort</th>
                            <th style={{ width: '80px' }}>Type</th>
                            <th>Title</th>
                            <th>URL</th>
                            <th style={{ width: '100px' }}>Preview</th>
                            <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {links.map((link) => (
                            <tr key={link.id} data-id={link.id}>
                                <td className="sort-handle">
                                    <span className="drag-icon">⋮⋮</span>
                                    <span className="sort-number">{link.sort || link.id}</span>
                                </td>
                                <td>
                                        <span className={`link-type-badge link-type-${link.type}`}>
                                            {getTypeIcon(link.type)} {link.type}
                                        </span>
                                </td>
                                <td className="link-title">{link.title}</td>
                                <td className="link-url">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                                        {link.url.length > 50 ? link.url.substring(0, 50) + '...' : link.url}
                                    </a>
                                </td>
                                <td>
                                    {getPreviewUrl(link.url, link.type) ? (
                                        <img
                                            src={getPreviewUrl(link.url, link.type)}
                                            alt="preview"
                                            className="link-preview"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span className="no-preview">-</span>
                                    )}
                                </td>
                                <td>
                                    <button className="links-edit-btn" onClick={() => handleEdit(link)}>
                                        ✏️ Edit
                                    </button>
                                    <button className="links-delete-btn" onClick={() => handleDelete(link.id, link.title)}>
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="links-modal">
                    <div className="links-modal-content">
                        <div className="links-modal-header">
                            <h2>{editingLink ? '✏️ Edit Link' : '➕ Add New Link'}</h2>
                            <button className="links-modal-close" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="links-modal-body">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="Enter link title"
                                />
                            </div>
                            <div className="form-group">
                                <label>Type *</label>
                                <select
                                    className="form-select"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="video">video</option>
                                    <option value="website">Website</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>URL *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Classification ID</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.classification_id}
                                    onChange={(e) => setFormData({...formData, classification_id: parseInt(e.target.value) || 1})}
                                />
                            </div>
                        </div>
                        <div className="links-modal-footer">
                            <button className="links-cancel-btn" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="links-save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : (editingLink ? 'Save Changes' : 'Create Link')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinksAdmin;