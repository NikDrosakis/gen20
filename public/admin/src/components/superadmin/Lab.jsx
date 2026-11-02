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

    useEffect(() => {
        fetchTraitMethods();
    }, []);

    const fetchTraitMethods = async () => {
        setLoadingMethods(true);
        try {
            const endpoints = [];
            const categories = {};

            // --- 1. God API (πρώτα) ---
            try {
                const godRes = await fetch('/god/v1/routes');
                const godData = await godRes.json();
                if (godData.success && godData.routes) {
                    categories['_god'] = [];
                    godData.routes.forEach(r => {
                        // Παράλειψε το landing page και το routes
                        if (r.path === '/god/v1/' || r.path === '/god/v1/routes') return;

                        endpoints.push({
                            label: r.path.replace('/god/v1/', ''),
                            path: r.path,
                            method: r.method,
                            trait: 'God',
                            visibility: 'public',
                        });

                        categories['_god'].push({
                            label: r.path.replace('/god/v1/', ''),
                            path: r.path,
                            method: r.method,
                        });
                    });
                }
            } catch (e) {
                console.warn('God routes not available:', e);
            }

            // --- 2. MariaDB ---
            try {
                const mariaResponse = await fetch('/api/v1/maria');
                const mariaResult = await mariaResponse.json();

                if (mariaResult.success && mariaResult.data) {
                    categories['_mariadb'] = [];
                    Object.entries(mariaResult.data).forEach(([methodName, methodInfo]) => {
                        if (methodName === '__construct') return;

                        let httpMethod = 'POST';
                        if (['show','f','fa','flist','fl','fetch','columns','types','tableMeta','getSchemaTable','getColumnsWithComment','count_','counter'].includes(methodName)) {
                            httpMethod = 'GET';
                        }

                        const endpointPath = `/api/v1/maria/${methodName}`;
                        endpoints.push({
                            label: methodName,
                            path: endpointPath,
                            method: httpMethod,
                            trait: 'MariaDB',
                            visibility: 'public',
                        });

                        categories['_mariadb'].push({
                            label: methodName,
                            path: endpointPath,
                            method: httpMethod,
                        });
                    });
                }
            } catch (e) {
                console.warn('MariaDB methods not available:', e);
            }

            // --- 3. Traits ---
            try {
                const traitResponse = await fetch('/api/v1/trait');
                const traitResult = await traitResponse.json();

                if (traitResult.success && traitResult.data) {
                    Object.entries(traitResult.data.traits || {}).forEach(([traitName, methods]) => {
                        if (traitName === '_api_class') return;

                        categories[traitName] = [];
                        methods.forEach(m => {
                            const methodName = m.name || m;
                            let httpMethod = 'POST';
                            if (methodName.startsWith('get') || methodName.startsWith('list') ||
                                methodName.startsWith('show') || methodName.startsWith('fetch') ||
                                methodName.startsWith('is') || methodName === 'exportThis' ||
                                methodName === 'actionLoop') {
                                httpMethod = 'GET';
                            }

                            const endpointPath = `/api/v1/local/${methodName}`;
                            endpoints.push({
                                label: methodName,
                                path: endpointPath,
                                method: httpMethod,
                                trait: traitName,
                                visibility: m.visibility || 'public',
                            });

                            categories[traitName].push({
                                label: methodName,
                                path: endpointPath,
                                method: httpMethod,
                            });
                        });
                    });
                }
            } catch (e) {
                console.warn('Trait methods not available:', e);
            }

            endpoints.sort((a, b) => a.label.localeCompare(b.label));
            setTraitMethods(endpoints);
            setTraitCategories(categories);
        } catch (error) {
            console.error('Error fetching methods:', error);
        } finally {
            setLoadingMethods(false);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('lab_saved_requests');
        if (saved) {
            try { setSavedRequests(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (savedRequests.length > 0) {
            localStorage.setItem('lab_saved_requests', JSON.stringify(savedRequests));
        }
    }, [savedRequests]);

    const handleEndpointClick = (ep) => {
        setEndpoint(ep.path);
        setMethod(ep.method || 'GET');
        if (ep.method === 'POST') {
            setParams(JSON.stringify({ domain: window.location.hostname }, null, 2));
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
                method,
                headers: { 'Content-Type': 'application/json' },
            };

            if (method === 'POST' && params && params !== '{}') {
                try {
                    options.body = JSON.stringify(JSON.parse(params));
                } catch (e) {
                    setError('Invalid JSON parameters');
                    setLoading(false);
                    return;
                }
            }

            if (method === 'GET' && params && params !== '{}') {
                try {
                    const parsed = JSON.parse(params);
                    const urlObj = new URL(url, window.location.origin);
                    Object.keys(parsed).forEach(k => urlObj.searchParams.append(k, parsed[k]));
                    url = urlObj.pathname + urlObj.search;
                } catch (e) {
                    setError('Invalid JSON parameters for GET');
                    setLoading(false);
                    return;
                }
            }

            const res = await fetch(url, options);
            const contentType = res.headers.get('content-type');
            const rawText = await res.text();
            setResponseRaw(rawText);

            try {
                setResponse(JSON.parse(rawText));
                setResponseType('json');
            } catch (e) {
                setResponse(rawText);
                setResponseType(contentType?.includes('html') ? 'html' : 'text');
            }

            setHistory(prev => [{
                timestamp: new Date().toISOString(),
                endpoint: url,
                method,
                params,
                responseType,
                status: res.status,
            }, ...prev].slice(0, 20));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRequest = () => {
        setSavedRequests(prev => [...prev, {
            id: Date.now(),
            name: `Request ${prev.length + 1}`,
            endpoint, method, params,
            timestamp: new Date().toISOString(),
        }]);
    };

    const loadSavedRequest = (req) => {
        setEndpoint(req.endpoint);
        setMethod(req.method);
        setParams(req.params);
    };

    const deleteSavedRequest = (id) => {
        setSavedRequests(prev => prev.filter(r => r.id !== id));
    };

    const copyResponse = () => {
        const text = typeof response === 'object' ? JSON.stringify(response, null, 2) : response;
        navigator.clipboard.writeText(text);
        alert('✅ Copied');
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
                    <p>Δοκιμάστε τα API endpoints του συστήματος (PHP + God)</p>
                    <div className="lab-stats">
                        <span className="stat-badge">📚 {traitMethods.length} endpoints</span>
                        <span className="stat-badge">📁 {Object.keys(traitCategories).length} categories</span>
                        <span className="stat-badge">⚡ {traitCategories['_god']?.length || 0} god</span>
                    </div>
                </div>

                <div className="lab-layout">
                    {/* Left: Request */}
                    <div className="lab-request-panel">
                        <div className="lab-method-endpoint">
                            <select value={method} onChange={(e) => setMethod(e.target.value)} className="lab-method-select">
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                            <input
                                type="text"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                                placeholder="/god/v1/... ή /api/v1/..."
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
                        </div>

                        <div className="lab-actions">
                            <button className="lab-send-btn" onClick={handleSend} disabled={loading || !endpoint}>
                                {loading ? '⏳ Sending...' : '🚀 Send'}
                            </button>
                            <button className="lab-save-btn" onClick={handleSaveRequest} disabled={!endpoint}>💾 Save</button>
                            <button className="lab-clear-btn" onClick={() => {
                                setEndpoint(''); setParams('{}'); setResponse(null); setError(null);
                            }}>🗑️ Clear</button>
                        </div>

                        <div className="lab-tabs">
                            <button className={`lab-tab ${activeTab === 'request' ? 'active' : ''}`} onClick={() => setActiveTab('request')}>📤 Request</button>
                            <button className={`lab-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>💾 Saved ({savedRequests.length})</button>
                            <button className={`lab-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📜 History</button>
                        </div>

                        {activeTab === 'request' && (
                            <div className="lab-predefined">
                                <label>🔍 Methods ({traitMethods.length}):</label>
                                <div className="predefined-scroll">
                                    {loadingMethods ? (
                                        <div className="loading-methods">Loading...</div>
                                    ) : (
                                        <>
                                            {/* God API */}
                                            {traitCategories['_god']?.length > 0 && (
                                                <div className="predefined-category">
                                                    <div className="category-label">⚡ God ({traitCategories['_god'].length})</div>
                                                    <div className="predefined-buttons">
                                                        {traitCategories['_god'].map((ep, i) => (
                                                            <button
                                                                key={i}
                                                                className={`predefined-btn ${ep.method === 'POST' ? 'post' : 'get'}`}
                                                                onClick={() => handleEndpointClick(ep)}
                                                                title={ep.path}
                                                            >
                                                                <span className="ep-method">{ep.method}</span>
                                                                {ep.label.length > 25 ? ep.label.substring(0, 25) + '…' : ep.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* MariaDB */}
                                            {traitCategories['_mariadb']?.length > 0 && (
                                                <div className="predefined-category">
                                                    <div className="category-label">🗄️ MariaDB ({traitCategories['_mariadb'].length})</div>
                                                    <div className="predefined-buttons">
                                                        {traitCategories['_mariadb'].map((ep, i) => (
                                                            <button
                                                                key={i}
                                                                className={`predefined-btn ${ep.method === 'POST' ? 'post' : 'get'}`}
                                                                onClick={() => handleEndpointClick(ep)}
                                                                title={ep.path}
                                                            >
                                                                <span className="ep-method">{ep.method}</span>
                                                                {ep.label.length > 25 ? ep.label.substring(0, 25) + '…' : ep.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Traits */}
                                            {Object.entries(traitCategories).map(([name, methods]) => {
                                                if (name === '_god' || name === '_mariadb' || methods.length === 0) return null;
                                                return (
                                                    <div key={name} className="predefined-category">
                                                        <div className="category-label">{name} ({methods.length})</div>
                                                        <div className="predefined-buttons">
                                                            {methods.map((ep, i) => (
                                                                <button
                                                                    key={i}
                                                                    className={`predefined-btn ${ep.method === 'POST' ? 'post' : 'get'}`}
                                                                    onClick={() => handleEndpointClick(ep)}
                                                                    title={ep.path}
                                                                >
                                                                    <span className="ep-method">{ep.method}</span>
                                                                    {ep.label.length > 25 ? ep.label.substring(0, 25) + '…' : ep.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className="lab-saved-list">
                                {savedRequests.length === 0 ? (
                                    <div className="lab-empty-state"><p>No saved requests</p></div>
                                ) : (
                                    savedRequests.map(req => (
                                        <div key={req.id} className="lab-saved-item">
                                            <div className="saved-item-info" onClick={() => loadSavedRequest(req)}>
                                                <span className="saved-method">{req.method}</span>
                                                <span className="saved-endpoint">{req.endpoint}</span>
                                            </div>
                                            <button className="saved-delete-btn" onClick={() => deleteSavedRequest(req.id)}>×</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="lab-history-list">
                                {history.length === 0 ? (
                                    <div className="lab-empty-state"><p>No history</p></div>
                                ) : (
                                    history.map((h, i) => (
                                        <div key={i} className="lab-history-item">
                                            <span className="history-method">{h.method}</span>
                                            <span className="history-endpoint">{h.endpoint}</span>
                                            <span className={`history-status ${h.status === 200 ? 'success' : 'error'}`}>{h.status}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Response */}
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
                                        <pre className="lab-json">{JSON.stringify(response, null, 2)}</pre>
                                    ) : responseType === 'html' ? (
                                        <div className="lab-html" dangerouslySetInnerHTML={{__html: response}} />
                                    ) : (
                                        <pre className="lab-text">{response}</pre>
                                    )}
                                </div>
                                {responseRaw && responseType === 'html' && (
                                    <details className="lab-raw-toggle">
                                        <summary>🔍 View Raw</summary>
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