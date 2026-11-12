// pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import './Settings.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const Setup = ({ onSetupDataChange }) => {
    const [setupData, setSetupData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState('all');

    const [newItem, setNewItem] = useState({
        name: '',
        val: '',
        tag: 'setup',
        type: 'text',
        description: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Φιλτράρισμα δεδομένων βάσει του ενεργού tab ΚΑΙ του search
    const filteredData = setupData.filter(item => {
        const matchesTag = activeTag === 'all' || (item.tag || 'uncategorized') === activeTag;
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            item.name?.toLowerCase().includes(term) ||
            item.val?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term);

        return matchesTag && matchesSearch;
    });

    const fetchSetupData = async () => {
        try {
            const response = await fetch(`/api/v1/maria/fa?query=SELECT%20*%20FROM%20${publicdb}.setup%20ORDER%20BY%20tag,name`);
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setSetupData(result.data);
                onSetupDataChange?.(result.data);
            }
        } catch (error) {
            showNotification('Error fetching data: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSetupData();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const handleUpdate = async (id, updatedData) => {
        try {
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `UPDATE ${publicdb}.setup SET
                                                         name = '${updatedData.name.replace(/'/g, "\\'")}',
                                                         val = '${updatedData.val.replace(/'/g, "\\'")}',
                                                         tag = '${updatedData.tag}',
                                                         type = '${updatedData.type}',                                                       
                                                         description = ${updatedData.description ? `'${updatedData.description.replace(/'/g, "\\'")}'` : 'NULL'}
                            WHERE id = ${id}`
                })
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Record updated successfully');
                fetchSetupData();
                setEditingId(null);
            } else {
                showNotification('Update failed', 'error');
            }
        } catch (error) {
            showNotification('Error: ' + error.message, 'error');
        }
    };

    const handleAdd = async () => {
        if (!newItem.name || !newItem.val) {
            showNotification('Name and Value are required', 'error');
            return;
        }

        try {
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `INSERT INTO ${publicdb}.setup (name, val, tag, type, description)
                            VALUES (
                                           '${newItem.name.replace(/'/g, "\\'")}',
                                           '${newItem.val.replace(/'/g, "\\'")}',
                                           '${newItem.tag}',
                                           '${newItem.type}',                                          
                                           ${newItem.description ? `'${newItem.description.replace(/'/g, "\\'")}'` : 'NULL'}
                                   )`
                })
            });

            const result = await response.json();
            if (result.success) {
                showNotification('New record added successfully');
                fetchSetupData();
                setShowAddForm(false);
                setNewItem({
                    name: '', val: '', tag: 'setup', type: 'text', description: ''
                });
            } else {
                showNotification('Add failed', 'error');
            }
        } catch (error) {
            showNotification('Error: ' + error.message, 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: `DELETE FROM ${publicdb}.setup WHERE id = ${id}`
                    })
                });

                const result = await response.json();
                if (result.success) {
                    showNotification('Record deleted successfully');
                    fetchSetupData();
                } else {
                    showNotification('Delete failed', 'error');
                }
            } catch (error) {
                showNotification('Error: ' + error.message, 'error');
            }
        }
    };

    // ✅ ΝΕΑ ΣΥΝΑΡΤΗΣΗ: Έλεγχος για το πλήκτρο Enter
    const handleKeyDown = (e, item, currentEdit) => {
        if (e.key === 'Enter') {
            if (e.target.tagName === 'TEXTAREA') return; // Αγνόησε το Enter στο textarea
            e.preventDefault();
            handleUpdate(item.id, currentEdit);
        }
    };

    const uniqueTags = ['all', ...new Set(setupData.map(item => item.tag || 'uncategorized'))];

    const renderEditForm = (item) => {
        const currentEdit = editForm[item.id] || item;

        return (
            <tr key={`edit-${item.id}`} className="editing-row">
                <td>
                    <input
                        type="text"
                        value={currentEdit.name}
                        onChange={(e) => setEditForm({...editForm, [item.id]: {...currentEdit, name: e.target.value}})}
                        onKeyDown={(e) => handleKeyDown(e, item, currentEdit)} // ✅ ENTER
                        className="edit-input"
                    />
                </td>
                <td>
                    {item.type === 'textarea' || item.val?.length > 100 ? (
                        <textarea
                            value={currentEdit.val || ''}
                            onChange={(e) => setEditForm({
                                ...editForm,
                                [item.id]: {...currentEdit, val: e.target.value}
                            })}
                            rows={4}
                            className="edit-textarea"
                        />
                    ) : (
                        <input
                            type="text"
                            value={currentEdit.val || ''}
                            onChange={(e) => setEditForm({
                                ...editForm,
                                [item.id]: {...currentEdit, val: e.target.value}
                            })}
                            onKeyDown={(e) => handleKeyDown(e, item, currentEdit)} // ✅ ENTER
                            className="edit-input"
                        />
                    )}
                </td>
                <td>
                    <select
                        value={currentEdit.tag || 'setup'}
                        onChange={(e) => setEditForm({...editForm, [item.id]: {...currentEdit, tag: e.target.value}})}
                        onKeyDown={(e) => handleKeyDown(e, item, currentEdit)} // ✅ ENTER
                        className="edit-select"
                    >
                        <option value="setup">Setup</option>
                        <option value="public">Public</option>
                        <option value="seo">SEO</option>
                        <option value="link">Link</option>
                        <option value="head-css">Head CSS</option>
                        <option value="head-js">Head JS</option>
                    </select>
                </td>
                <td>
                    <select
                        value={currentEdit.type || 'text'}
                        onChange={(e) => setEditForm({...editForm, [item.id]: {...currentEdit, type: e.target.value}})}
                        onKeyDown={(e) => handleKeyDown(e, item, currentEdit)} // ✅ ENTER
                        className="edit-select"
                    >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="integer">Integer</option>
                        <option value="decimal">Decimal</option>
                        <option value="json">JSON</option>
                        <option value="pug">Pug</option>
                        <option value="img">Image</option>
                        <option value="meta">Meta</option>
                    </select>
                </td>
                <td className="action-buttons">
                    <button onClick={() => handleUpdate(item.id, currentEdit)} className="btn-save">💾 Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-cancel">✕ Cancel</button>
                </td>
            </tr>
        );
    };

    const renderRow = (item) => (
        <tr
            key={item.id}
            onDoubleClick={() => { // ✅ ΔΙΠΛΟ ΚΛΙΚ ΓΙΑ EDIT
                setEditingId(item.id);
                setEditForm({...editForm, [item.id]: {...item}});
            }}
            style={{ cursor: 'pointer' }}
            title="Double click to edit"
        >
            <td className="name-cell">{item.name}</td>
            <td className="value-cell">
                {item.type === 'json' ? (
                    <pre className="json-preview">{item.val}</pre>
                ) : item.val?.length > 100 ? (
                    <div className="truncated-value" title={item.val}>
                        {item.val.substring(0, 100)}...
                    </div>
                ) : (
                    item.val
                )}
            </td>
            <td>{item.tag}</td>
            <td>{item.type || 'text'}</td>
            <td className="action-buttons">
                <button onClick={() => {
                    setEditingId(item.id);
                    setEditForm({...editForm, [item.id]: {...item}});
                }} className="btn-edit">✏️ Edit</button>
                <button onClick={() => handleDelete(item.id, item.name)} className="btn-delete">🗑️ Delete</button>
            </td>
        </tr>
    );

    if (loading) return <div className="loading">Loading setup data...</div>;

    return (
        <div className="setup-manager">
            <div className="header">
                <h1>⚙️ Settings Manager</h1>

                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                    <input
                        type="text"
                        placeholder="🔍 Search settings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{minWidth: '250px'}}
                    />
                    <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add">
                        {showAddForm ? '✕ Cancel' : '➕ Add New Setting'}
                    </button>
                </div>
            </div>

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {showAddForm && (
                <div className="add-form">
                    <h3>➕ Add New Setting</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>📝 Name *</label>
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                placeholder="setting_name"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>📄 Value *</label>
                            <textarea
                                value={newItem.val}
                                onChange={(e) => setNewItem({...newItem, val: e.target.value})}
                                rows={3}
                            />
                        </div>
                        <div className="form-group">
                            <label>🏷️ Tag</label>
                            <select value={newItem.tag} onChange={(e) => setNewItem({...newItem, tag: e.target.value})}>
                                <option value="setup">Setup</option>
                                <option value="public">Public</option>
                                <option value="seo">SEO</option>
                                <option value="link">Link</option>
                                <option value="head-css">Head CSS</option>
                                <option value="head-js">Head JS</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>📂 Type</label>
                            <select value={newItem.type}
                                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}>
                                <option value="text">Text</option>
                                <option value="textarea">Textarea</option>
                                <option value="integer">Integer</option>
                                <option value="decimal">Decimal</option>
                                <option value="json">JSON</option>
                                <option value="pug">Pug</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button onClick={handleAdd} className="btn-submit">➕ Add Setting</button>
                        <button onClick={() => setShowAddForm(false)} className="btn-cancel">✕ Cancel</button>
                    </div>
                </div>
            )}

            <div className="tabs">
                {uniqueTags.map(tag => (
                    <button
                        key={tag}
                        className={`tab-btn ${activeTag === tag ? 'active' : ''}`}
                        onClick={() => setActiveTag(tag)}
                    >
                        {tag.toUpperCase()} ({tag === 'all' ? setupData.length : setupData.filter(i => (i.tag || 'uncategorized') === tag).length})
                    </button>
                ))}
            </div>

            <div className="section">
                <table className="setup-table">
                    <thead>
                    <tr>
                        <th>📝 Name</th>
                        <th>📄 Value</th>
                        <th>🏷️ Tag</th>
                        <th>📂 Type</th>
                        <th>⚡ Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.map(item => (
                        editingId === item.id ? renderEditForm(item) : renderRow(item)
                    ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <p style={{textAlign: 'center', padding: '20px', color: '#666'}}>No settings found in this category.</p>
                )}
            </div>
        </div>
    );
};

export default Setup;