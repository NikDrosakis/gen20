// src/components/YourList.jsx
import React, { useState, useEffect } from 'react';
import './YourList.css';

const YourList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/fa?folder=SELECT * FROM ${publicdb}.your_table ORDER BY sort ASC`);
            const result = await response.json();
            if (result.success) {
                setItems(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const query = `DELETE FROM ${publicdb}.your_table WHERE id = ${id}`;
            await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            await fetchItems();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="your-list">
            <div className="list-header">
                <h2>Your List</h2>
                <div className="list-actions">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                    />
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        + Add
                    </button>
                </div>
            </div>
            <div className="list-body">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">No items found</div>
                ) : (
                    filteredItems.map(item => (
                        <div key={item.id} className="list-item">
                            <span className="item-name">{item.name}</span>
                            <span className="badge badge-success">Active</span>
                            <div className="item-actions">
                                <button className="btn-small">✏️ Edit</button>
                                <button className="btn-small btn-danger" onClick={() => handleDelete(item.id)}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default YourList;