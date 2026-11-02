// components/superadmin/DBTree.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DBTemplate from './DBTemplate';
import './DBTree.css';

const TEMPLATE_KEY = '__template__';

const DBTree = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // ?db=... ή ?db=__template__
    const dbFromUrl = searchParams.get('db') || '';

    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableData, setTableData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [activeTab, setActiveTab] = useState('buildTable');
    const [deleting, setDeleting] = useState({});

    const [databases, setDatabases] = useState([]);
    const [selectedDatabase, setSelectedDatabase] = useState(dbFromUrl);
    const [loadingDatabases, setLoadingDatabases] = useState(true);

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    // ============================================================
    // Sync με URL
    // ============================================================
    useEffect(() => {
        if (dbFromUrl && dbFromUrl !== selectedDatabase) {
            setSelectedDatabase(dbFromUrl);
        }
    }, [dbFromUrl, selectedDatabase]);

    // ============================================================
    // Φόρτωση databases
    // ============================================================
    const fetchDatabases = async () => {
        setLoadingDatabases(true);
        try {
            const url = `/api/v1/maria/show?q=databases&t=${Date.now()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
                cache: 'no-store',
            });

            if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

            const result = await response.json();
            let dbList = [];
            if (Array.isArray(result)) dbList = result;
            else if (Array.isArray(result.data)) dbList = result.data;
            else if (Array.isArray(result.data?.data)) dbList = result.data.data;
            else if (result.success && Array.isArray(result.data?.data)) dbList = result.data.data;
            else if (result.success && Array.isArray(result.data)) dbList = result.data;

            const genDatabases = dbList.filter(
                db => typeof db === 'string' && db.startsWith('gen_')
            );

            setDatabases(genDatabases);

            if (genDatabases.length === 0) {
                showNotification('⚠️ No gen_* databases found', 'error');
                return;
            }

            // Auto-select
            if (!dbFromUrl || (dbFromUrl !== TEMPLATE_KEY && !genDatabases.includes(dbFromUrl))) {
                const defaultDb = genDatabases[0];
                setSelectedDatabase(defaultDb);
                setSearchParams({ db: defaultDb }, { replace: true });
            } else {
                setSelectedDatabase(dbFromUrl);
            }
        } catch (error) {
            console.error('❌ Error fetching databases:', error);
            showNotification(`❌ Failed to load databases: ${error.message}`, 'error');
            setDatabases([]);
        } finally {
            setLoadingDatabases(false);
        }
    };

    useEffect(() => {
        fetchDatabases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Όταν αλλάζει το database (και δεν είναι template), φόρτωσε tables
    useEffect(() => {
        if (selectedDatabase && selectedDatabase !== TEMPLATE_KEY) {
            fetchTables(selectedDatabase);
            setSelectedTable(null);
            setTableData(null);
        }
    }, [selectedDatabase]);

    const fetchTables = async (db) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/show?q=tables&db=${db}&t=${Date.now()}`);
            const result = await response.json();

            let tableList = [];
            if (Array.isArray(result)) tableList = result;
            else if (Array.isArray(result.data)) tableList = result.data;
            else if (Array.isArray(result.data?.data)) tableList = result.data.data;

            setTables(tableList);

            if (tableList.length === 0) {
                showNotification(`No tables found in ${db}`, 'error');
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
            const response = await fetch(
                `/api/v1/local/getMariaTree?key=${selectedDatabase}.${tableName}&t=${Date.now()}`
            );
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

    // ============================================================
    // Αλλαγή database — γράφει στο URL
    // ============================================================
    const handleSelectDatabase = (db) => {
        setSelectedDatabase(db);
        setSearchParams({ db }, { replace: true });
    };

    const handleDeleteTable = async (tableName, e) => {
        e.stopPropagation();
        const fullTableName = `${selectedDatabase}.${tableName}`;
        if (!window.confirm(`⚠️ Delete table "${fullTableName}"?`)) return;
        setDeleting(prev => ({ ...prev, [tableName]: true }));
        try {
            const response = await fetch(`/api/v1/maria/drop?key=${fullTableName}`, { method: 'GET' });
            const result = await response.json();
            if (result.success) {
                showNotification(`✅ Table "${tableName}" deleted`, 'success');
                setTables(prev => prev.filter(t => t !== tableName));
                if (selectedTable === tableName) {
                    setSelectedTable(null);
                    setTableData(null);
                }
            } else {
                showNotification(`❌ Failed: ${result.error || result.message}`, 'error');
            }
        } catch (error) {
            showNotification('❌ Error: ' + error.message, 'error');
        } finally {
            setDeleting(prev => ({ ...prev, [tableName]: false }));
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
        if (!html) return <div className="db-tree-empty">No data found</div>;
        return <div className="db-tree-html-content" dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const renderContent = () => {
        if (!tableData) return <div className="db-tree-empty">No data found</div>;

        let content = '';
        let title = '';
        switch (activeTab) {
            case 'buildTable':
                content = tableData.buildTable || '';
                title = '📋 Table Data';
                break;
            case 'buildSchema':
                content = tableData.buildSchema || '';
                title = '📐 Table Schema';
                break;
            case 'compare':
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

    // ============================================================
    // Render
    // ============================================================
    if (loadingDatabases && databases.length === 0) {
        return (
            <div className="db-tree-container">
                <div className="db-tree-loading">Loading databases...</div>
            </div>
        );
    }

    // Αν είναι template
    const isTemplateMode = selectedDatabase === TEMPLATE_KEY;

    return (
        <div className="db-tree-container">
            {apiStatus.show && (
                <div className={`db-tree-notification db-tree-notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="db-tree-header">
                <h2>🗄️ Database Tree</h2>

                {/* Buttons αντί dropdown */}
                <div className="db-tree-buttons">
                    {databases.map(db => (
                        <button
                            key={db}
                            className={`db-tree-btn ${selectedDatabase === db ? 'active' : ''}`}
                            onClick={() => handleSelectDatabase(db)}
                            title={db}
                        >
                            🗄️ {db}
                        </button>
                    ))}
                    <button
                        className={`db-tree-btn db-tree-btn-template ${isTemplateMode ? 'active' : ''}`}
                        onClick={() => handleSelectDatabase(TEMPLATE_KEY)}
                        title="Edit template.sql"
                    >
                        📄 Template
                    </button>
                    <button
                        onClick={fetchDatabases}
                        disabled={loadingDatabases}
                        className="db-tree-btn db-tree-btn-refresh"
                        title="Refresh databases"
                    >
                        {loadingDatabases ? '⏳' : '🔄'}
                    </button>
                </div>
            </div>

            {/* Αν είναι template, δείξε το DBTemplate */}
            {isTemplateMode ? (
                <DBTemplate />
            ) : (
                <>
                    <div className="db-tree-controls">
                        <input
                            type="text"
                            placeholder="Search tables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="db-tree-search-input"
                        />
                    </div>

                    <div className="db-tree-layout">
                        <div className="db-tree-sidebar">
                            <div className="db-tree-tables-list">
                                {loading ? (
                                    <div className="db-tree-loading">Loading tables...</div>
                                ) : filteredTables.length === 0 ? (
                                    <div className="db-tree-no-tables">
                                        {selectedDatabase ? 'No tables found' : 'Select a database'}
                                    </div>
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
                </>
            )}
        </div>
    );
};

export default DBTree;