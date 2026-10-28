// components/ClassificationModal.jsx
import React, { useState, useEffect } from 'react';
import "../pages/Classification.css";

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const ClassificationModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const escapeSql = (str) => {
        if (str === null || str === undefined) return '';
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
    };

    // Όταν ανοίγει το modal, γεμίζει τα πεδία
    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setFormData({
                    name: editingItem.name || '',
                    title: editingItem.title || '',
                    description: editingItem.description || ''
                });
            } else {
                setFormData({ name: '', title: '', description: '' });
            }
            setError('');
        }
    }, [isOpen, editingItem]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.name) {
            setError('Name is required');
            return;
        }

        setLoading(true);
        setError('');
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        try {
            let query;
            if (editingItem) {
                // UPDATE (Χωρίς ID)
                query = `UPDATE ${publicdb}.classification SET
                                                               name='${escapeSql(formData.name)}',
                                                               title='${escapeSql(formData.title || '')}',
                                                               description='${escapeSql(formData.description || '')}',
                                                               updated='${now}'
                         WHERE id=${editingItem.id}`;
            } else {
                // INSERT (Χωρίς ID, αφήνουμε το Auto-Increment να το κάνει)
                query = `INSERT INTO ${publicdb}.classification
                             (name, title, description, created, updated)
                         VALUES (
                                        '${escapeSql(formData.name)}',
                                        '${escapeSql(formData.title || '')}',
                                        '${escapeSql(formData.description || '')}',
                                        '${now}', '${now}')`;
            }

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });

            const result = await response.json();
            if (result.success === true) {
                onSave?.(); // Ενημερώνει τον γονέα να κάνει refresh
                onClose?.(); // Κλείνει το modal
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{
                background: 'white', padding: '24px', borderRadius: '12px',
                width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <h3 className="modal-title" style={{ marginTop: 0 }}>
                    {editingItem ? '✏️ Edit Classification' : '📝 Create New Classification'}
                </h3>

                {error && <div style={{ color: '#dc3545', marginBottom: '16px', padding: '8px', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Name <span className="required">*</span></label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., pharmacogenomics"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Display title"
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-textarea"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description of this classification..."
                    />
                </div>

                <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button className="btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn-save" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Classification'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassificationModal;