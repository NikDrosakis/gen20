// pages/Lab.jsx
import React, { useState, useEffect } from 'react';
import './Lab.css';

const Lab = () => {
    const [endpoint, setEndpoint] = useState('');
    const [method, setMethod] = useState('GET');
    const [params, setParams] = useState('{}');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [responseType, setResponseType] = useState('json');
    const [history, setHistory] = useState([]);
    const [savedRequests, setSavedRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('request');
    const [responseRaw, setResponseRaw] = useState('');
    const [traitMethods, setTraitMethods] = useState([]);
    const [traitCategories, setTraitCategories] = useState({});
    const [loadingMethods, setLoadingMethods] = useState(false);

    // Φόρτωση των trait methods από το API
    useEffect(() => {
        fetchTraitMethods();
    }, []);

// pages/Lab.jsx - προσθήκη στο fetchTraitMethods

    const fetchTraitMethods = async () => {
        setLoadingMethods(true);
        try {
            // Fetch trait methods
            const traitResponse = await fetch('/api/v1/trait');
            const traitResult = await traitResponse.json();

            // Fetch MariaDB methods
            const mariaResponse = await fetch('/api/v1/maria');
            const mariaResult = await mariaResponse.json();

            const endpoints = [];
            const categories = {};

            // --- MariaDB methods (πρώτα, στην κορυφή) ---
            if (mariaResult.success && mariaResult.data) {
                categories['_mariadb'] = [];
                Object.entries(mariaResult.data).forEach(([methodName, methodInfo]) => {
                    // Skip __construct
                    if (methodName === '__construct') return;

                    let httpMethod = 'POST';
                    if (methodName === 'show' || methodName === 'f' || methodName === 'fa' ||
                        methodName === 'flist' || methodName === 'fl' || methodName === 'fetch' ||
                        methodName === 'columns' || methodName === 'types' || methodName === 'tableMeta' ||
                        methodName === 'getSchemaTable' || methodName === 'getColumnsWithComment' ||
                        methodName === 'count_' || methodName === 'counter') {
                        httpMethod = 'GET';
                    }

                    const endpointPath = `/api/v1/maria/${methodName}`;
                    endpoints.push({
                        label: methodName,
                        path: endpointPath,
                        method: httpMethod,
                        trait: 'MariaDB',
                        visibility: 'public'
                    });

                    categories['_mariadb'].push({
                        label: methodName,
                        path: endpointPath,
                        method: httpMethod
                    });
                });
            }

            // --- Trait methods ---
            if (traitResult.success && traitResult.data) {
                Object.entries(traitResult.data.traits || {}).forEach(([traitName, methods]) => {
                    if (traitName === '_api_class') return;

                    categories[traitName] = [];

                    methods.forEach(method => {
                        const methodName = method.name || method;
                        let httpMethod = 'POST';
                        if (methodName.startsWith('get') ||
                            methodName.startsWith('list') ||
                            methodName.startsWith('show') ||
                            methodName.startsWith('fetch') ||
                            methodName.startsWith('is') ||
                            methodName === 'exportThis' ||
                            methodName === 'actionLoop') {
                            httpMethod = 'GET';
                        }

                        const endpointPath = `/api/v1/local/${methodName}`;
                        endpoints.push({
                            label: methodName,
                            path: endpointPath,
                            method: httpMethod,
                            trait: traitName,
                            visibility: method.visibility || 'public'
                        });

                        categories[traitName].push({
                            label: methodName,
                            path: endpointPath,
                            method: httpMethod
                        });
                    });
                });
            }

            // Sort
            endpoints.sort((a, b) => a.label.localeCompare(b.label));
            setTraitMethods(endpoints);
            setTraitCategories(categories);
        } catch (error) {
            console.error('Error fetching methods:', error);
        } finally {
            setLoadingMethods(false);
        }
    };
    // Load saved requests from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('lab_saved_requests');
        if (saved) {
            try {
                setSavedRequests(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading saved requests:', e);
            }
        }
    }, []);

    // Save requests to localStorage
    useEffect(() => {
        if (savedRequests.length > 0) {
            localStorage.setItem('lab_saved_requests', JSON.stringify(savedRequests));
        }
    }, [savedRequests]);

    const handleEndpointClick = (ep) => {
        setEndpoint(ep.path);
        setMethod(ep.method || 'GET');

        // If POST method, add default params
        if (ep.method === 'POST') {
            const defaultParams = {
                domain: window.location.hostname
            };
            setParams(JSON.stringify(defaultParams, null, 2));
        } else {
            setParams('{}');
        }
    };

    const handleSend = async () => {
        setLoading(true);
        setError(null);
        setResponse(null);
        setResponseRaw('');

        try {
            let url = endpoint;
            let options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            // Handle POST with params
            if (method === 'POST' && params && params !== '{}') {
                try {
                    const parsedParams = JSON.parse(params);
                    options.body = JSON.stringify(parsedParams);
                } catch (e) {
                    setError('Invalid JSON parameters');
                    setLoading(false);
                    return;
                }
            }

            // Handle GET with query params
            if (method === 'GET' && params && params !== '{}') {
                try {
                    const parsedParams = JSON.parse(params);
                    const urlObj = new URL(url, window.location.origin);
                    Object.keys(parsedParams).forEach(key => {
                        urlObj.searchParams.append(key, parsedParams[key]);
                    });
                    url = urlObj.pathname + urlObj.search;
                } catch (e) {
                    setError('Invalid JSON parameters for GET request');
                    setLoading(false);
                    return;
                }
            }

            console.log('🔍 Sending request:', { url, options });

            const response = await fetch(url, options);
            const contentType = response.headers.get('content-type');

            const rawText = await response.text();
            setResponseRaw(rawText);

            try {
                const jsonData = JSON.parse(rawText);
                setResponse(jsonData);
                setResponseType('json');
            } catch (e) {
                setResponse(rawText);
                setResponseType(contentType?.includes('html') ? 'html' : 'text');
            }

            const historyEntry = {
                timestamp: new Date().toISOString(),
                endpoint: url,
                method: method,
                params: params,
                responseType: responseType,
                status: response.status
            };
            setHistory(prev => [historyEntry, ...prev].slice(0, 20));

        } catch (err) {
            console.error('❌ Request error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRequest = () => {
        const newRequest = {
            id: Date.now(),
            name: `Request ${savedRequests.length + 1}`,
            endpoint: endpoint,
            method: method,
            params: params,
            timestamp: new Date().toISOString()
        };
        setSavedRequests(prev => [...prev, newRequest]);
    };

    const loadSavedRequest = (request) => {
        setEndpoint(request.endpoint);
        setMethod(request.method);
        setParams(request.params);
    };

    const deleteSavedRequest = (id) => {
        setSavedRequests(prev => prev.filter(r => r.id !== id));
    };

    const copyResponse = () => {
        const text = typeof response === 'object' ? JSON.stringify(response, null, 2) : response;
        navigator.clipboard.writeText(text);
        alert('✅ Copied to clipboard!');
    };

    const downloadResponse = () => {
        const text = typeof response === 'object' ? JSON.stringify(response, null, 2) : response;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-response-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="lab-page">
            <div className="lab-container">
                <div className="lab-header">
                    <h1>🔬 API Lab</h1>
                    <p>Δοκιμάστε τα API endpoints του συστήματος</p>
                    <div className="lab-stats">
                        <span className="stat-badge">📚 {traitMethods.length} endpoints</span>
                        <span className="stat-badge">📁 {Object.keys(traitCategories).length} traits</span>
                    </div>
                </div>

                <div className="lab-layout">
                    {/* Left Panel - Request */}
                    <div className="lab-request-panel">
                        <div className="lab-tabs">
                            <button
                                className={`lab-tab ${activeTab === 'request' ? 'active' : ''}`}
                                onClick={() => setActiveTab('request')}
                            >
                                📤 Request
                            </button>
                            <button
                                className={`lab-tab ${activeTab === 'saved' ? 'active' : ''}`}
                                onClick={() => setActiveTab('saved')}
                            >
                                💾 Saved ({savedRequests.length})
                            </button>
                            <button
                                className={`lab-tab ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                📜 History
                            </button>
                        </div>

                        {activeTab === 'request' && (
                            <div className="lab-request-form">
                                {/* Predefined endpoints from traits */}
                                <div className="lab-predefined">
                                    <label>🔍 Όλες οι μέθοδοι ({traitMethods.length}):</label>
                                    <div className="predefined-scroll">
                                        {loadingMethods ? (
                                            <div className="loading-methods">Φόρτωση μεθόδων...</div>
                                        ) : (
                                            Object.entries(traitCategories).map(([traitName, methods]) => (
                                                methods.length > 0 && (
                                                    <div key={traitName} className="predefined-category">
                                                        <div className="category-label">{traitName}</div>
                                                        <div className="predefined-buttons">
                                                            {methods.map((ep, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    className={`predefined-btn ${ep.method === 'POST' ? 'post' : 'get'}`}
                                                                    onClick={() => handleEndpointClick(ep)}
                                                                    title={ep.label}
                                                                >
                                                                    <span className="ep-method">{ep.method}</span>
                                                                    {ep.label.length > 25 ? ep.label.substring(0, 25) + '…' : ep.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            ))
                                        )}
                                    </div>// pages/Lab.jsx - στο render, αντικατέστησε το predefined-scroll

                                    <div className="predefined-scroll">
                                        {loadingMethods ? (
                                            <div className="loading-methods">Φόρτωση μεθόδων...</div>
                                        ) : (
                                            // Πρώτα εμφάνισε το MariaDB
                                            traitCategories['_mariadb'] && traitCategories['_mariadb'].length > 0 && (
                                                <div className="predefined-category">
                                                    <div className="category-label">🗄️ MariaDB ({traitCategories['_mariadb'].length})</div>
                                                    <div className="predefined-buttons">
                                                        {traitCategories['_mariadb'].map((ep, idx) => (
                                                            <button
                                                                key={idx}
                                                                className={`predefined-btn ${ep.method === 'POST' ? 'post' : 'get'}`}
                                                                onClick={() => handleEndpointClick(ep)}
                                                                title={ep.label}
                                                            >
                                                                <span className="ep-method">{ep.method}</span>
                                                                {ep.label.length > 25 ? ep.label.substring(0, 25) + '…' : ep.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ),
                                                // Μετά τα υπόλοιπα traits
                                                Object.entries(traitCategories).map(([traitName, methods]) => {
                                                    if (traitName === '_mariadb' || methods.length === 0) return null;
                                                    return (
                                                        <div key={traitName} className="predefined-category">
                                                            <div className="category-label">{traitName} ({methods.length})</div>
                                                            <div className="predefined-buttons">
                                                                {methods.map((ep, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        className={`predefined-btn ${ep.method === 'POST' ? 'post' : 'get'}`}
                                                                        onClick={() => handleEndpointClick(ep)}
                                                                        title={ep.label}
                                                                    >
                                                                        <span className="ep-method">{ep.method}</span>
                                                                        {ep.label.length > 25 ? ep.label.substring(0, 25) + '…' : ep.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>
                                </div>

                                <div className="lab-method-endpoint">
                                    <select
                                        value={method}
                                        onChange={(e) => setMethod(e.target.value)}
                                        className="lab-method-select"
                                    >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={endpoint}
                                        onChange={(e) => setEndpoint(e.target.value)}
                                        placeholder="/api/v1/local/..."
                                        className="lab-endpoint-input"
                                    />
                                </div>

                                <div className="lab-params">
                                    <label>Parameters (JSON):</label>
                                    <textarea
                                        value={params}
                                        onChange={(e) => setParams(e.target.value)}
                                        className="lab-params-textarea"
                                        rows="6"
                                        placeholder='{"key": "value"}'
                                    />
                                    {params && params !== '{}' && (
                                        <div className="lab-params-hint">
                                            💡 Παράμετροι για {method} request
                                        </div>
                                    )}
                                </div>

                                <div className="lab-actions">
                                    <button
                                        className="lab-send-btn"
                                        onClick={handleSend}
                                        disabled={loading || !endpoint}
                                    >
                                        {loading ? '⏳ Sending...' : '🚀 Send Request'}
                                    </button>
                                    <button
                                        className="lab-save-btn"
                                        onClick={handleSaveRequest}
                                        disabled={!endpoint}
                                    >
                                        💾 Save
                                    </button>
                                    <button
                                        className="lab-clear-btn"
                                        onClick={() => {
                                            setEndpoint('');
                                            setParams('{}');
                                            setResponse(null);
                                            setError(null);
                                        }}
                                    >
                                        🗑️ Clear
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Saved and History tabs */}
                        {activeTab === 'saved' && (
                            <div className="lab-saved-list">
                                {savedRequests.length === 0 ? (
                                    <div className="lab-empty-state">
                                        <p>No saved requests</p>
                                        <small>Save a request to see it here</small>
                                    </div>
                                ) : (
                                    savedRequests.map((req) => (
                                        <div key={req.id} className="lab-saved-item">
                                            <div className="saved-item-info" onClick={() => loadSavedRequest(req)}>
                                                <span className="saved-method">{req.method}</span>
                                                <span className="saved-endpoint">{req.endpoint}</span>
                                            </div>
                                            <button
                                                className="saved-delete-btn"
                                                onClick={() => deleteSavedRequest(req.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="lab-history-list">
                                {history.length === 0 ? (
                                    <div className="lab-empty-state">
                                        <p>No history yet</p>
                                        <small>Send requests to see them here</small>
                                    </div>
                                ) : (
                                    history.map((entry, idx) => (
                                        <div key={idx} className="lab-history-item">
                                            <span className="history-method">{entry.method}</span>
                                            <span className="history-endpoint">{entry.endpoint}</span>
                                            <span className={`history-status ${entry.status === 200 ? 'success' : 'error'}`}>
                                                {entry.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Response */}
                    <div className="lab-response-panel">
                        <div className="lab-response-header">
                            <h3>📥 Response</h3>
                            {response && (
                                <div className="lab-response-actions">
                                    <button onClick={copyResponse} className="res-btn">📋 Copy</button>
                                    <button onClick={downloadResponse} className="res-btn">💾 Download</button>
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="lab-loading">
                                <div className="lab-spinner"></div>
                                <p>Waiting for response...</p>
                            </div>
                        )}

                        {error && (
                            <div className="lab-error">
                                <span className="error-icon">❌</span>
                                <p>{error}</p>
                            </div>
                        )}

                        {response && !loading && (
                            <div className="lab-response-content">
                                <div className="lab-response-meta">
                                    <span className="response-type">{responseType.toUpperCase()}</span>
                                    <span className="response-size">
                                        {typeof response === 'object'
                                            ? `${JSON.stringify(response).length} chars`
                                            : `${String(response).length} chars`}
                                    </span>
                                </div>
                                <div className="lab-response-body">
                                    {responseType === 'json' ? (
                                        <pre className="lab-json">
                                            {JSON.stringify(response, null, 2)}
                                        </pre>
                                    ) : responseType === 'html' ? (
                                        <div
                                            className="lab-html"
                                            dangerouslySetInnerHTML={{ __html: response }}
                                        />
                                    ) : (
                                        <pre className="lab-text">{response}</pre>
                                    )}
                                </div>
                                {responseRaw && responseType === 'html' && (
                                    <details className="lab-raw-toggle">
                                        <summary>🔍 View Raw Response</summary>
                                        <pre className="lab-raw">{responseRaw}</pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {!response && !loading && !error && (
                            <div className="lab-empty-response">
                                <span className="empty-icon">🔌</span>
                                <p>Send a request to see the response here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lab;