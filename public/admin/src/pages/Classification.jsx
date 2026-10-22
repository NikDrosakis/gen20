// pages/Classification.jsx
import React, { useState, useEffect } from 'react';
import './Classification.css';

const Classification = () => {
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const [classifications, setClassifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        title: '',
        description: ''
    });
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    const escapeSql = (str) => {
        if (str === null || str === undefined) return '';
        return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"');
    };

    // Fetch classifications
    const fetchClassifications = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/fa?folder=select%20*%20from%20${publicdb}.classification%20order%20by%20id`);
            const result = await response.json();

            let data = [];
            if (result.success && result.data) {
                data = Array.isArray(result.data) ? result.data : [];
            } else if (Array.isArray(result)) {
                data = result;
            }

            setClassifications(data);
        } catch (error) {
            console.error('Error fetching classifications:', error);
            showNotification('Failed to fetch classifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassifications();
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        const nextId = classifications.length > 0
            ? Math.max(...classifications.map(c => c.id)) + 1
            : 1;
        setFormData({
            id: nextId.toString(),
            name: '',
            title: '',
            description: ''
        });
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            id: item.id.toString(),
            name: item.name || '',
            title: item.title || '',
            description: item.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete classification "${name}"?`)) return;

        try {
            const query = `DELETE FROM ${publicdb}.classification WHERE id=${id}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });

            const result = await response.json();
            if (result.success === true) {
                showNotification('Classification deleted successfully', 'success');
                fetchClassifications();
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting classification:', error);
            showNotification('Delete failed', 'error');
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            showNotification('Name is required', 'error');
            return;
        }

        const idValue = parseInt(formData.id);
        if (isNaN(idValue) || idValue <= 0) {
            showNotification('Valid ID is required', 'error');
            return;
        }

        if (!editingItem) {
            const existingId = classifications.find(c => c.id === idValue);
            if (existingId) {
                showNotification(`ID ${idValue} already exists. Please use a different ID.`, 'error');
                return;
            }
        }

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        if (editingItem) {
            const query = `UPDATE ${publicdb}.classification SET
                                                                 id=${idValue},
                                                                 name='${escapeSql(formData.name)}',
                                                                 title='${escapeSql(formData.title || '')}',
                                                                 description='${escapeSql(formData.description || '')}',
                                                                 updated='${now}'
                           WHERE id=${editingItem.id}`;

            try {
                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([query, []])
                });

                const result = await response.json();
                if (result.success === true) {
                    showNotification('Classification updated successfully', 'success');
                    fetchClassifications();
                    setShowModal(false);
                } else {
                    throw new Error(result.error || 'Update failed');
                }
            } catch (error) {
                console.error('Error updating classification:', error);
                showNotification('Update failed', 'error');
            }
        } else {
            const query = `INSERT INTO ${publicdb}.classification
                               (id, name, title, description, created, updated)
                           VALUES (
                                      ${idValue},
                                      '${escapeSql(formData.name)}',
                                      '${escapeSql(formData.title || '')}',
                                      '${escapeSql(formData.description || '')}',
                                      '${now}',
                                      '${now}')`;

            try {
                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([query, []])
                });

                const result = await response.json();
                if (result.success === true) {
                    showNotification('Classification created successfully', 'success');
                    fetchClassifications();
                    setShowModal(false);
                } else {
                    throw new Error(result.error || 'Create failed');
                }
            } catch (error) {
                console.error('Error creating classification:', error);
                showNotification('Create failed', 'error');
            }
        }
    };

    if (loading) {
        return <div className="loading-state">Loading classifications...</div>;
    }

    return (
        <div className="classification-container">
            {apiStatus.show && (
                <div className={`notification notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="classification-header">
                <h1 className="classification-title">📂 Classification Manager</h1>
                <button className="btn-add" onClick={handleAdd}>
                    + New Classification
                </button>
            </div>

            <div className="classification-table-wrapper">
                <table className="classification-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Title</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {classifications.map(item => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>
                                <strong>{item.name}</strong>
                            </td>
                            <td>{item.title || '-'}</td>
                            <td>{item.created?.slice(0, 10)}</td>
                            <td>{item.updated?.slice(0, 10)}</td>
                            <td>
                                <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(item.id, item.name)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {classifications.length === 0 && (
                <div className="no-data">No classifications found. Click "New Classification" to create one.</div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">
                            {editingItem ? '✏️ Edit Classification' : '📝 Create New Classification'}
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">ID {!editingItem && <span className="required">*</span>}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    placeholder="Numeric ID"
                                    disabled={!!editingItem}
                                />
                                {!editingItem && (
                                    <div className="form-hint">Enter a unique numeric ID (e.g., 1, 2, 3...)</div>
                                )}
                                {editingItem && (
                                    <div className="form-hint error">ID cannot be changed after creation</div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., pharmacogenomics"
                                />
                                <div className="form-hint">Unique identifier (slug)</div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Display title"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description of this category..."
                            />
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave}>Save Classification</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classification;