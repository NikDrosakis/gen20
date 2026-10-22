// components/superadmin/DBTree.jsx
import React, { useState, useEffect } from 'react';
import './DBTree.css';

const DBTree = ({ selectedDomain = '' }) => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [activeTab, setActiveTab] = useState('buildTable'); // 'buildTable', 'buildSchema', 'compare'
    const [deleting, setDeleting] = useState({});


    const [databases, setDatabases] = useState([]);
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [loadingDatabases, setLoadingDatabases] = useState(true);

    const getPublicDb = () => {
        const domain = selectedDomain || window.location.hostname;
        return "gen_" + domain.replace(/\./g, '');
    };

    const publicdb = getPublicDb();

    console.log('DBTree - selectedDomain:', selectedDomain);
    console.log('DBTree - publicdb:', publicdb);

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        if (selectedDomain) {
            fetchTables();
        }
    }, [selectedDomain]);

    useEffect(() => {
        fetchTables();
    }, []);


    // Initial load - fetch databases
    useEffect(() => {
        fetchDatabases();
    }, []);

// Load tables when database changes
    useEffect(() => {
        if (selectedDatabase) {
            fetchTables(); // Η υπάρχουσα fetchTables συνάρτηση
            setSelectedTable(null);
            setTableData(null);
        }
    }, [selectedDatabase]);
    const fetchDatabases = async () => {
        setLoadingDatabases(true);
        try {
            const response = await fetch('/api/v1/maria/show?key=databases');
            const result = await response.json();

            if (result.success && result.data) {
                // Φιλτράρισμα μόνο για βάσεις gen_
                const genDatabases = result.data.filter(db => db.startsWith('gen_'));
                setDatabases(genDatabases);

                // Auto-select first database
                if (genDatabases.length > 0) {
                    setSelectedDatabase(genDatabases[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching databases:', error);
        } finally {
            setLoadingDatabases(false);
        }
    };

    const applyAllModifications = async (tableName) => {
        if (!window.confirm(`Apply all schema modifications to ${tableName}?`)) return;

        try {
            const response = await fetch('/api/v1/local/applySchemaStandards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: tableName })
            });
            const result = await response.json();

            if (result.success) {
                showNotification('✅ Schema updated successfully', 'success');
                // Refresh table data
                fetchTableData(tableName);
            } else {
                showNotification('❌ Failed to update schema', 'error');
            }
        } catch (error) {
            console.error('Error applying modifications:', error);
            showNotification('❌ Error applying modifications', 'error');
        }
    };

    const handleDeleteTable = async (tableName, e) => {
        e.stopPropagation();

        const publicdb = getPublicDb();
        const fullTableName = `${publicdb}.${tableName}`;

        if (!window.confirm(`⚠️ Are you sure you want to delete table "${fullTableName}"? This action cannot be undone!`)) {
            return;
        }

        setDeleting(prev => ({ ...prev, [tableName]: true }));

        try {
            const response = await fetch(`/api/v1/maria/drop?key=${fullTableName}`, {
                method: 'GET'
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ Table "${tableName}" deleted successfully`, 'success');
                // Remove from list
                setTables(prev => prev.filter(t => t !== tableName));
                if (selectedTable === tableName) {
                    setSelectedTable(null);
                    setTableData(null);
                }
            } else {
                showNotification(`❌ Failed to delete table: ${result.error || result.message}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting table:', error);
            showNotification('❌ Error deleting table: ' + error.message, 'error');
        } finally {
            setDeleting(prev => ({ ...prev, [tableName]: false }));
        }
    };

    const fetchTables = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/show?q=tables&db=${publicdb}`);
            const result = await response.json();

            if (result.success && result.data) {
                setTables(result.data);
            } else {
                showNotification('Failed to load tables', 'error');
                setTables([]);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
            showNotification('Error loading tables', 'error');
            setTables([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTableData = async (tableName) => {
        setLoading(true);
        setSelectedTable(tableName);
        try {
            // Χρησιμοποίησε το νέο endpoint getMariaTree
            const response = await fetch(`/api/v1/local/getMariaTree?key=${publicdb}.${tableName}`);
            const result = await response.json();

            if (result.success && result.data) {
                setTableData(result.data);
            } else {
                showNotification(`Failed to load data from ${tableName}`, 'error');
                setTableData(null);
            }
        } catch (error) {
            console.error('Error fetching table data:', error);
            showNotification('Error loading table data', 'error');
            setTableData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = (tableName) => {
        if (selectedTable === tableName) {
            setSelectedTable(null);
            setTableData(null);
        } else {
            fetchTableData(tableName);
        }
    };

    const filteredTables = tables.filter(table =>
        table.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderHtmlContent = (html) => {
        if (!html) {
            return <div className="db-tree-empty">No data found</div>;
        }

        return (
            <div
                className="db-tree-html-content"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    };

    const renderContent = () => {
        if (!tableData) {
            return <div className="db-tree-empty">No data found</div>;
        }

        // Get the content based on active tab
        let content = '';
        let title = '';
        switch(activeTab) {
            case 'buildTable':
                content = tableData.buildTable || '';
                title = '📋 Table Data';
                break;
            case 'buildSchema':
                content = tableData.buildSchema || '';
                title = '📐 Table Schema';
                break;
            case 'compare':
                // Compare is an array of strings
                const compareData = tableData.compareWithStandardReport || [];
                return (
                    <div className="db-tree-compare">
                        <div className="db-tree-table-header">
                            <h4>📊 Compare with Standard</h4>
                        </div>
                        <div className="db-tree-compare-content">
                            {compareData.map((item, idx) => (
                                <div key={idx} className="db-tree-compare-item">
                                    {typeof item === 'string' && item.includes('<button') ? (
                                        <div dangerouslySetInnerHTML={{ __html: item }} />
                                    ) : (
                                        <pre>{item}</pre>
                                    )}
                                </div>
                            ))}
                        </div>
                        {activeTab === 'compare' && tableData?.compareWithStandardReport?.length > 0 && (
                            <div className="compare-actions">
                                <button
                                    className="btn-apply-all"
                                    onClick={() => applyAllModifications(selectedTable)}
                                >
                                    ✅ Apply All Changes
                                </button>
                                <button
                                    className="btn-apply-selected"
                                    onClick={() => applySelectedModifications(selectedTable)}
                                >
                                    📝 Apply Selected
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                content = tableData.buildTable || '';
                title = '📋 Table Data';
        }

        return (
            <div className="db-tree-table-wrapper">
                <div className="db-tree-table-header">
                    <h4>{title}</h4>
                </div>
                {renderHtmlContent(content)}
            </div>
        );
    };

    if (loading && !tableData) {
        return <div className="db-tree-loading">Loading database tree...</div>;
    }

    return (
        <div className="db-tree-container">
            {apiStatus.show && (
                <div className={`db-tree-notification db-tree-notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="db-tree-header">
                <h2>🗄️ Database Tree {selectedDomain && `- ${selectedDomain}`}</h2>

                <div className="db-tree-search">
                    <input
                        type="text"
                        placeholder="Search tables..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="db-tree-search-input"
                    />
                </div>
            </div>

            <div className="db-tree-layout">
                {/* Sidebar - Tables List */}
                <div className="db-tree-sidebar">
                    <div className="db-tree-tables-list">
                        {filteredTables.length === 0 ? (
                            <div className="db-tree-no-tables">No tables found</div>
                        ) : (
                            filteredTables.map((table, idx) => (
                                <div
                                    key={idx}
                                    className={`db-tree-table-item ${selectedTable === table ? 'active' : ''}`}
                                    onClick={() => handleTableClick(table)}
                                >
                                    <span className="db-tree-table-icon">📋</span>
                                    <span className="db-tree-table-name">{table}</span>
                                    <button
                                        className="db-tree-delete-btn"
                                        onClick={(e) => handleDeleteTable(table, e)}
                                        disabled={deleting[table]}
                                        title="Delete table"
                                    >
                                        {deleting[table] ? '⏳' : '🗑️'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Tabs for different views */}
                    {selectedTable && tableData && (
                        <div className="db-tree-views">
                            <button
                                className={`view-btn ${activeTab === 'buildTable' ? 'active' : ''}`}
                                onClick={() => setActiveTab('buildTable')}
                            >
                                📋 Table
                            </button>
                            <button
                                className={`view-btn ${activeTab === 'buildSchema' ? 'active' : ''}`}
                                onClick={() => setActiveTab('buildSchema')}
                            >
                                📐 Schema
                            </button>
                            <button
                                className={`view-btn ${activeTab === 'compare' ? 'active' : ''}`}
                                onClick={() => setActiveTab('compare')}
                            >
                                🔄 Compare
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content - Table Data */}
                <div className="db-tree-main">
                    {selectedTable ? (
                        loading ? (
                            <div className="db-tree-loading">Loading table data...</div>
                        ) : (
                            renderContent()
                        )
                    ) : (
                        <div className="db-tree-select-prompt">
                            <span className="db-tree-prompt-icon">🗄️</span>
                            <p>Select a table from the left to view its data</p>
                            <small>{tables.length} tables available</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DBTree;