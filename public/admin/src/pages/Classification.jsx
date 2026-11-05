// pages/Classification.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './Classification.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const Classification = ({ navigateTo }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', title: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const escapeSql = (str) => {
        if (str === null || str === undefined) return '';
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
    };

    // Φόρτωση όλων των classifications
    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const query = `SELECT * FROM ${publicdb}.classification ORDER BY title ASC, name ASC`;
            const res = await fetch(
                `/api/v1/maria/fa?query=${encodeURIComponent(query)}`
            );
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setItems(data.data);
            } else {
                setItems([]);
            }
        } catch (err) {
            console.error('Error fetching classifications:', err);
            setError('Failed to load classifications');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // Άνοιγμα modal
    const openModal = (item = null) => {
        setEditingItem(item);
        setFormData(item
            ? { name: item.name || '', title: item.title || '', description: item.description || '' }
            : { name: '', title: '', description: '' }
        );
        setFormError('');
        setModalOpen(true);
    };

    // Κλείσιμο modal
    const closeModal = () => {
        setModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', title: '', description: '' });
        setFormError('');
    };

    // Αποθήκευση
    const handleSave = async () => {
        if (!formData.name) {
            setFormError('Name is required');
            return;
        }

        setSaving(true);
        setFormError('');
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        try {
            let query;
            if (editingItem) {
                query = `UPDATE ${publicdb}.classification SET
                    name='${escapeSql(formData.name)}',
                    title='${escapeSql(formData.title || '')}',
                    description='${escapeSql(formData.description || '')}',
                    updated='${now}'
                    WHERE id=${editingItem.id}`;
            } else {
                query = `INSERT INTO ${publicdb}.classification
                    (name, title, description, created, updated)
                    VALUES (
                        '${escapeSql(formData.name)}',
                        '${escapeSql(formData.title || '')}',
                        '${escapeSql(formData.description || '')}',
                        '${now}', '${now}')`;
            }

            const res = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });

            const result = await res.json();
            if (result.success === true) {
                closeModal();
                fetchItems();
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Διαγραφή
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        try {
            const query = `DELETE FROM ${publicdb}.classification WHERE id=${id}`;
            const res = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            const result = await res.json();
            if (result.success === true) {
                fetchItems();
            } else {
                alert(result.error || 'Delete failed');
            }
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="classification-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>🏷️ Classification</h1>
                <button
                    className="btn-add"
                    onClick={() => openModal()}
                    style={{
                        padding: '8px 16px',
                        background: '#4a90e2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    + New Classification
                </button>
            </div>

            {loading && <div style={{ padding: 20 }}>Loading...</div>}
            {error && <div style={{ color: '#dc3545', padding: 20 }}>{error}</div>}

            {!loading && !error && items.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                    No classifications yet. Click "+ New Classification" to create one.
                </div>
            )}

            {!loading && items.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ background: '#f7f7f7', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: 10, textAlign: 'left' }}>ID</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Title</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Description</th>
                        <th style={{ padding: 10, textAlign: 'right' }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: 10 }}>{item.id}</td>
                            <td style={{ padding: 10 }}>{item.name}</td>
                            <td style={{ padding: 10 }}>{item.title || '—'}</td>
                            <td style={{ padding: 10, color: '#888' }}>{item.description || '—'}</td>
                            <td style={{ padding: 10, textAlign: 'right' }}>
                                <button
                                    onClick={() => openModal(item)}
                                    style={{ marginRight: 6, padding: '4px 10px', cursor: 'pointer' }}
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id, item.name)}
                                    style={{ padding: '4px 10px', cursor: 'pointer', color: '#dc3545' }}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* Modal */}
            {modalOpen && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white', padding: '24px', borderRadius: '12px',
                            width: '100%', maxWidth: '500px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>
                            {editingItem ? '✏️ Edit Classification' : '📝 Create New Classification'}
                        </h3>

                        {formError && (
                            <div style={{
                                color: '#dc3545', marginBottom: 16, padding: 8,
                                background: '#fee2e2', borderRadius: 4
                            }}>
                                {formError}
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
                                Name <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., pharmacogenomics"
                                style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
                            />
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Display title"
                                style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Description</label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description..."
                                style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button
                                onClick={closeModal}
                                disabled={saving}
                                style={{ padding: '8px 16px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: '8px 16px',
                                    background: '#4a90e2',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: saving ? 'wait' : 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Classification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classification;