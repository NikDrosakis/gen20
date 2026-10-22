// components/superadmin/DatabaseManager.jsx
import React, { useState, useEffect } from 'react';

const DatabaseManager = ({ databases }) => {
    const [selectedDB, setSelectedDB] = useState(null);
    const [dbDetails, setDbDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('view'); // 'view' or 'drop'
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    // Fetch database details
    const fetchDatabaseDetails = async (dbName) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/show?key=tables&q=${dbName}`);
            const result = await response.json();

            if (result.success && result.data) {
                setDbDetails(result.data);
            } else {
                showNotification('Failed to load database details', 'error');
                setDbDetails(null);
            }
        } catch (error) {
            console.error('Error fetching database details:', error);
            showNotification('Error loading database details', 'error');
            setDbDetails(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle View
    const handleView = async (db) => {
        const dbName = typeof db === 'string' ? db : db.Database;
        setSelectedDB(dbName);
        setModalType('view');
        setShowModal(true);
        await fetchDatabaseDetails(dbName);
    };

    // Handle Drop
    const handleDrop = (db) => {
        const dbName = typeof db === 'string' ? db : db.Database;
        setSelectedDB(dbName);
        setModalType('drop');
        setShowModal(true);
    };

    // Confirm Drop
    const confirmDrop = async () => {
        if (!selectedDB) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/drop?key=${selectedDB}&operation=database`, {
                method: 'GET'
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ Database "${selectedDB}" dropped successfully`, 'success');
                setShowModal(false);
                setSelectedDB(null);
                // Refresh the page or update the list
             //   window.location.reload();
            } else {
                showNotification(`❌ Failed to drop database: ${result.error || result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error dropping database:', error);
            showNotification('❌ Error dropping database: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedDB(null);
        setDbDetails(null);
        setModalType('view');
    };

    // Render modal content
    const renderModalContent = () => {
        if (modalType === 'view') {
            if (loading) {
                return (
                    <div className="modal-loading">
                        <div className="spinner"></div>
                        <p>Loading database details...</p>
                    </div>
                );
            }

            if (!dbDetails) {
                return (
                    <div className="modal-empty">
                        <p>No details available for this database</p>
                    </div>
                );
            }

            return (
                <div className="modal-db-details">
                    <div className="db-info-row">
                        <span className="db-info-label">Database:</span>
                        <span className="db-info-value">{selectedDB}</span>
                    </div>
                    <div className="db-info-row">
                        <span className="db-info-label">Size:</span>
                        <span className="db-info-value">{dbDetails.size || 'N/A'}</span>
                    </div>
                    <div className="db-info-row">
                        <span className="db-info-label">Tables:</span>
                        <span className="db-info-value">{dbDetails.tables_count || dbDetails.tables?.length || 0}</span>
                    </div>

                    {dbDetails && dbDetails.length > 0 && (
                        <div className="db-tables-list">
                            <h4>Tables</h4>
                            <ul>
                                {dbDetails.map((table, idx) => (
                                    <li key={idx}>
                                        <span className="table-icon">📋</span>
                                        {table}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        if (modalType === 'drop') {
            return (
                <div className="modal-drop-confirm">
                    <div className="drop-warning">
                        <span className="drop-icon">⚠️</span>
                        <h3>Are you sure you want to drop this database?</h3>
                        <p><strong>{selectedDB}</strong></p>
                        <p className="drop-danger-text">This action will delete ALL data and CANNOT be undone!</p>
                    </div>
                    <div className="modal-actions drop-actions">
                        <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                        <button className="btn-danger" onClick={confirmDrop} disabled={loading}>
                            {loading ? 'Dropping...' : '🗑️ Confirm Drop'}
                        </button>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="tab-pane">
            {/* Notifications */}
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header">
                <h2>🗄️ Databases</h2>
                <span className="db-count">{databases.length} databases</span>
            </div>

            <div className="databases-grid">
                {databases.length === 0 ? (
                    <div className="empty-state">No databases found</div>
                ) : (
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Database Name</th>
                            <th>Size</th>
                            <th>Tables</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {databases.map((db, idx) => {
                            const dbName = typeof db === 'string' ? db : db.Database;
                            return (
                                <tr key={idx}>
                                    <td>
                                        <span className="db-icon">🗄️</span>
                                        {dbName}
                                    </td>
                                    <td>{db.size || 'N/A'}</td>
                                    <td>{db.tables || 'N/A'}</td>
                                    <td>
                                        <button
                                            className="btn-small btn-view"
                                            onClick={() => handleView(db)}
                                        >
                                            🔍 View
                                        </button>
                                        <button
                                            className="btn-small-danger"
                                            onClick={() => handleDrop(db)}
                                        >
                                            🗑️ Drop
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {modalType === 'view' ? '🔍 Database Details' : '🗑️ Drop Database'}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            {renderModalContent()}
                        </div>
                        {modalType === 'view' && (
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={closeModal}>Close</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatabaseManager;