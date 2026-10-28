import React, { useState, useEffect } from 'react';
import ClassificationModal from '../components/ClassificationModal'; // <-- Import
import './Classification.css';

const Classification = () => {
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const [classifications, setClassifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchClassifications = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/fa?folder=select%20*%20from%20${publicdb}.classification%20order%20by%20id`);
            const result = await response.json();
            setClassifications(result.success && Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClassifications(); }, []);

    const handleAdd = () => {
        setEditingItem(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        try {
            const query = `DELETE FROM ${publicdb}.classification WHERE id=${id}`;
            await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            fetchClassifications();
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="loading-state">Loading classifications...</div>;

    return (
        <div className="classification-container">
            <div className="classification-header">
                <h1 className="classification-title">📂 Classification Manager</h1>
                <button className="btn-add" onClick={handleAdd}>+ New Classification</button>
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
                            <td><strong>{item.name}</strong></td>
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
                <div className="no-data">No classifications found.</div>
            )}

            {/* ✅ Χρήση του νέου Modal */}
            <ClassificationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={fetchClassifications}
                editingItem={editingItem}
            />
        </div>
    );
};

export default Classification;