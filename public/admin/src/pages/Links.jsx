// pages/Links.jsx
import React, { useState, useEffect } from 'react';
import './Links.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const LinksAdmin = ({ navigateTo }) => {
    const [links, setLinks] = useState([]);
    const [classifications, setClassifications] = useState([]);
    const [selectedClassificationId, setSelectedClassificationId] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [saving, setSaving] = useState(false);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        title: '',
        type: 'video',
        url: ''
    });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetchClassifications();
    }, []);

    useEffect(() => {
        if (selectedClassificationId) fetchLinks();
        else setLinks([]);
    }, [selectedClassificationId]);

    const fetchClassifications = async () => {
        try {
            const query = `SELECT id, name FROM ${publicdb}.classification ORDER BY name ASC`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (!result.success || !Array.isArray(result.data)) {
                throw new Error(result.error || 'Could not load classifications');
            }

            setClassifications(result.data);
            const defaultClassification = result.data.find(
                classification => classification.name?.toLowerCase() === 'links'
            ) || result.data[0];

            if (defaultClassification) {
                setSelectedClassificationId(String(defaultClassification.id));
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching classifications:', error);
            showNotification('Failed to load classifications', 'error');
            setLoading(false);
        }
    };

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const query = `SELECT content.*
                FROM ${publicdb}.content AS content
                WHERE content.classificationid = ${Number(selectedClassificationId)}
                ORDER BY content.sort ASC, content.id ASC`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success && result.data) {
                setLinks(result.data);
            } else {
                setLinks([]);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            showNotification('Failed to load content', 'error');
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
        try {
            if (editingLink) {
                // UPDATE
                const query = `UPDATE ${publicdb}.content AS content
                    SET
                        content.title='${formData.title.replace(/'/g, "\\'")}',
                        content.type='${formData.type}',
                        content.url='${formData.url.replace(/'/g, "\\'")}'
                    WHERE content.id=${Number(editingLink.id)}
                      AND content.classificationid=${Number(selectedClassificationId)}`;

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
                const query = `INSERT INTO ${publicdb}.content
                    (classificationid, title, type, url, sort)
                SELECT
                    ${Number(selectedClassificationId)},
                    '${formData.title.replace(/'/g, "\\'")}',
                    '${formData.type}',
                    '${formData.url.replace(/'/g, "\\'")}',
                    ${maxSort + 1}
                WHERE ${Number(selectedClassificationId)} > 0`;

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
            const query = `DELETE FROM ${publicdb}.content
                           WHERE id=${Number(id)}
                             AND classificationid=${Number(selectedClassificationId)}`;
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
            title: link.title || '',
            type: link.type || 'video',
            url: link.url || ''
        });
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingLink(null);
        setFormData({
            title: '',
            type: 'video',
            url: ''
        });
        setShowModal(true);
    };

    const updateSortOrder = async (id, sort) => {
        try {
            const query = `UPDATE ${publicdb}.content
                           SET sort = ${Number(sort)}
                           WHERE id = ${Number(id)}
                             AND classificationid=${Number(selectedClassificationId)}`;
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
    }, [loading, links, selectedClassificationId]);

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
                <div className="links-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <label className="classification-select-label" htmlFor="linksClassification">Classification</label>
                    <select
                        id="linksClassification"
                        className="form-select classification-select"
                        style={{ minWidth: '180px' }}
                        value={selectedClassificationId}
                        onChange={(e) => setSelectedClassificationId(e.target.value)}
                    >
                        {classifications.map((classification) => (
                            <option key={classification.id} value={String(classification.id)}>
                                {classification.name}
                            </option>
                        ))}
                    </select>
                    <button className="links-add-btn" onClick={handleAddNew} disabled={!selectedClassificationId}>
                        + Add New Link
                    </button>
                </div>
            </div>

            {links.length === 0 ? (
                <div className="links-empty">
                    <p>No content found for this classification. Click "Add New Link" to create one.</p>
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
                                        ✏️
                                    </button>
                                    <button className="links-delete-btn" onClick={() => handleDelete(link.id, link.title)}>
                                        🗑️
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
