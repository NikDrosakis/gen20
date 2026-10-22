// pages/LangAdmin.jsx
import React, { useState, useEffect } from 'react';
import './LangAdmin.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const LangAdmin = ({ navigateTo }) => {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        sort: 0,
        status: 0
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

    // Fetch languages
    const fetchLanguages = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/fa?query=SELECT * FROM ${publicdb}.language ORDER BY sort ASC, id ASC`);
            const result = await response.json();

            let languagesData = [];
            if (result.success && result.data) {
                languagesData = Array.isArray(result.data) ? result.data : [];
            } else if (Array.isArray(result)) {
                languagesData = result;
            }
            setLanguages(languagesData);
        } catch (error) {
            console.error('Error fetching languages:', error);
            showNotification('Failed to load languages', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    // Handle edit
    const handleEdit = (lang) => {
        setEditingId(lang.id);
        setFormData({
            code: lang.code || '',
            name: lang.name || '',
            sort: lang.sort || 0,
            status: lang.status || 0
        });
    };

    // Handle delete
    const handleDelete = async (id, name) => {
        if (!confirm(`Delete language "${name}"? This action cannot be undone.`)) return;

        try {
            const query = `DELETE FROM ${publicdb}.language WHERE id = ${id}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            const result = await response.json();

            if (result.success === true) {
                showNotification('Language deleted successfully', 'success');
                fetchLanguages();
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting language:', error);
            showNotification('Delete failed: ' + error.message, 'error');
        }
    };

    // Handle save (create or update)
    const handleSave = async () => {
        if (!formData.code || !formData.name) {
            showNotification('Please fill in Code and Name', 'error');
            return;
        }

        setSaving(true);
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        try {
            let query;
            if (editingId) {
                // Update existing
                query = `UPDATE ${publicdb}.language SET
                    code='${escapeSql(formData.code)}',
                    name='${escapeSql(formData.name)}',
                    sort=${parseInt(formData.sort) || 0},
                    status=${parseInt(formData.status) || 0}
                    WHERE id=${editingId}`;
            } else {
                // Insert new
                query = `INSERT INTO ${publicdb}.language (code, name, sort, status, created)
                    VALUES (
                        '${escapeSql(formData.code)}',
                        '${escapeSql(formData.name)}',
                        ${parseInt(formData.sort) || 0},
                        ${parseInt(formData.status) || 0},
                        '${now}'
                    )`;
            }

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            const result = await response.json();

            if (result.success === true) {
                showNotification(editingId ? 'Language updated successfully' : 'Language created successfully', 'success');
                setEditingId(null);
                setFormData({ code: '', name: '', sort: 0, status: 0 });
                fetchLanguages();
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (error) {
            console.error('Error saving language:', error);
            showNotification('Save failed: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ code: '', name: '', sort: 0, status: 0 });
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 0: return { text: 'Closed', class: 'status-closed' };
            case 1: return { text: 'Installed', class: 'status-installed' };
            case 2: return { text: 'Active', class: 'status-active' };
            default: return { text: 'Unknown', class: '' };
        }
    };

    if (loading) {
        return <div className="loading-state">Loading languages...</div>;
    }

    return (
        <div className="languages-container">
            {apiStatus.show && (
                <div className={`notification notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="languages-header">
                <h1 className="languages-title">🌐 Language Management</h1>
            </div>

            {/* Add/Edit Form */}
            <div className="language-form-card">
                <h2 className="form-title">{editingId ? '✏️ Edit Language' : '➕ Add New Language'}</h2>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Code <span className="required">*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value.toLowerCase()})}
                            placeholder="en, el, fr, de, es..."
                            maxLength="10"
                        />
                        <small className="form-hint">ISO language code (e.g., en, el, fr)</small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Name <span className="required">*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="English, Ελληνικά, Français..."
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Sort Order</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.sort}
                            onChange={(e) => setFormData({...formData, sort: parseInt(e.target.value) || 0})}
                            placeholder="0"
                        />
                        <small className="form-hint">Lower numbers appear first</small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                        >
                            <option value={0}>🔒 Closed (0)</option>
                            <option value={1}>📦 Installed (1)</option>
                            <option value={2}>✅ Active (2)</option>
                        </select>
                        <small className="form-hint">
                            Active = 2 (frontend available), Installed = 1, Closed = 0
                        </small>
                    </div>
                </div>

                <div className="form-buttons">
                    {editingId && (
                        <button className="btn-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : (editingId ? '💾 Update' : '➕ Create')}
                    </button>
                </div>
            </div>

            {/* Languages Table */}
            <div className="languages-table-container">
                <h2 className="table-title">📋 Installed Languages</h2>
                <table className="languages-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sort</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {languages.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="no-data">No languages found</td>
                        </tr>
                    ) : (
                        languages.map((lang) => {
                            const statusInfo = getStatusLabel(lang.status);
                            return (
                                <tr key={lang.id}>
                                    <td>{lang.id}</td>
                                    <td>{lang.sort}</td>
                                    <td><code className="language-code">{lang.code}</code></td>
                                    <td className="language-name">{lang.name}</td>
                                    <td>
                                            <span className={`status-badge ${statusInfo.class}`}>
                                                {statusInfo.text}
                                            </span>
                                    </td>
                                    <td>{new Date(lang.created).toLocaleDateString()}</td>
                                    <td className="actions">
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => handleEdit(lang)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(lang.id, lang.name)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {/* Info Box */}
            <div className="languages-info">
                <div className="info-box">
                    <h4>ℹ️ About Language Status</h4>
                    <ul>
                        <li><span className="status-closed">🔒 Not Installed (0)</span> - Language does not exist in the DB, not available on frontend</li>
                        <li><span className="status-installed">📦 Installed (1)</span> - Language is installed (DB altered), but not available on frontend</li>
                        <li><span className="status-active">✅ Active (2)</span> - Language is installed and available on frontend</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LangAdmin;