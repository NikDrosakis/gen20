// components/monetize/AffiliateManager.jsx
import React, { useState, useEffect } from 'react';

const AffiliateManager = () => {
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        link: '',
        commission: '',
        notes: ''
    });
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        loadAffiliates();
    }, []);

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    const loadAffiliates = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/f?folder=select * from ${publicdb}.affiliate_links order by id desc`);
            const result = await response.json();
            if (result.success && result.data) {
                setAffiliates(result.data);
            }
        } catch (error) {
            console.error('Error loading affiliates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code) {
            showNotification('Please fill in name and code', 'error');
            return;
        }

        try {
            let query;
            if (editingId) {
                // Update existing
                query = `UPDATE ${publicdb}.affiliate_links SET 
                    name='${formData.name}',
                    code='${formData.code}',
                    link='${formData.link}',
                    commission='${formData.commission}',
                    notes='${formData.notes}'
                    WHERE id=${editingId}`;
            } else {
                // Insert new
                query = `INSERT INTO ${publicdb}.affiliate_links (name, code, link, commission, notes, created) 
                    VALUES ('${formData.name}', '${formData.code}', '${formData.link}', '${formData.commission}', '${formData.notes}', NOW())`;
            }

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            const result = await response.json();

            if (result.success === true) {
                showNotification(editingId ? 'Affiliate updated!' : 'Affiliate added!', 'success');
                resetForm();
                loadAffiliates();
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (error) {
            console.error('Error saving affiliate:', error);
            showNotification('Save failed: ' + error.message, 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"?`)) return;

        try {
            const query = `DELETE FROM ${publicdb}.affiliate_links WHERE id=${id}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            const result = await response.json();

            if (result.success === true) {
                showNotification('Affiliate deleted!', 'success');
                loadAffiliates();
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting affiliate:', error);
            showNotification('Delete failed: ' + error.message, 'error');
        }
    };

    const handleEdit = (affiliate) => {
        setEditingId(affiliate.id);
        setFormData({
            name: affiliate.name || '',
            code: affiliate.code || '',
            link: affiliate.link || '',
            commission: affiliate.commission || '',
            notes: affiliate.notes || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            code: '',
            link: '',
            commission: '',
            notes: ''
        });
        setShowForm(false);
    };

    if (loading) {
        return <div className="loading-state">Loading affiliates...</div>;
    }

    return (
        <div className="affiliate-container">
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="section-header">
                <h3>🔗 Affiliate Links Manager</h3>
                <p>Manage your affiliate programs and track earnings</p>
                <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Affiliate Program</button>
            </div>

            {showForm && (
                <div className="form-modal">
                    <div className="form-card">
                        <h4>{editingId ? 'Edit Affiliate' : 'Add Affiliate Program'}</h4>
                        <div className="form-group">
                            <label>Program Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g., Amazon Associates"
                            />
                        </div>
                        <div className="form-group">
                            <label>Affiliate Code/ID *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                placeholder="e.g., amazon-20"
                            />
                        </div>
                        <div className="form-group">
                            <label>Affiliate Link</label>
                            <input
                                type="url"
                                className="form-input"
                                value={formData.link}
                                onChange={(e) => setFormData({...formData, link: e.target.value})}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Commission Rate (%)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.commission}
                                onChange={(e) => setFormData({...formData, commission: e.target.value})}
                                placeholder="e.g., 5%"
                            />
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                className="form-textarea"
                                rows="3"
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Additional notes..."
                            />
                        </div>
                        <div className="form-actions">
                            <button className="btn-cancel" onClick={resetForm}>Cancel</button>
                            <button className="btn-save" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="affiliate-table-container">
                <table className="affiliate-table">
                    <thead>
                    <tr>
                        <th>Program</th>
                        <th>Code/ID</th>
                        <th>Commission</th>
                        <th>Link</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {affiliates.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>No affiliate programs yet. Click "Add Affiliate Program" to start.</td>
                        </tr>
                    ) : (
                        affiliates.map(aff => (
                            <tr key={aff.id}>
                                <td><strong>{aff.name}</strong></td>
                                <td><code>{aff.code}</code></td>
                                <td>{aff.commission || '-'}</td>
                                <td>
                                    {aff.link ? (
                                        <a href={aff.link} target="_blank" rel="noopener noreferrer">View Link →</a>
                                    ) : '-'}
                                </td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(aff)}>Edit</button>
                                    <button className="btn-delete" onClick={() => handleDelete(aff.id, aff.name)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AffiliateManager;