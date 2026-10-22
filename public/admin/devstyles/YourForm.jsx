// src/components/YourForm.jsx
import React, { useState } from 'react';
import './YourForm.css';

const YourForm = ({ onSuccess, onCancel, initialData = null, editId = null }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        status: 1,
        sort: 0
    });
    const [saving, setSaving] = useState(false);

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let query;
            if (editId) {
                // UPDATE
                query = `UPDATE ${publicdb}.your_table SET 
                         name = '${formData.name}', 
                         description = '${formData.description}', 
                         status = ${formData.status}, 
                         sort = ${formData.sort} 
                         WHERE id = ${editId}`;
            } else {
                // INSERT
                query = `INSERT INTO ${publicdb}.your_table (name, description, status, sort) 
                         VALUES ('${formData.name}', '${formData.description}', ${formData.status}, ${formData.sort})`;
            }

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });

            const result = await response.json();
            if (result.success) {
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="your-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                />
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Sort</label>
                    <input
                        type="number"
                        name="sort"
                        value={formData.sort}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
            </div>
            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : (editId ? 'Update' : 'Create')}
                </button>
            </div>
        </form>
    );
};

export default YourForm;