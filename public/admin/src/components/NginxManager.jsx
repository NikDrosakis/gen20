// components/NginxManager.jsx
import React, { useState, useEffect } from 'react';

const NginxManager = () => {
    const [files, setFiles] = useState([]);
    const [shared, setShared] = useState({ content: '', original: '', path: '' });
    const [loadingConfigs, setLoadingConfigs] = useState(true);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    const fetchAll = async () => {
        setLoadingConfigs(true);
        try {
            // 1. Hosts
            const hostsRes = await fetch(`/god/v1/hosts/list?t=${Date.now()}`, { cache: 'no-store' });
            const hostsData = await hostsRes.json();

            if (hostsData.success && hostsData.data?.hosts) {
                const hosts = hostsData.data.hosts.map(h => ({
                    domain: h.domain,
                    path: h.path,
                    content: h.content,
                    original: h.content,
                    saving: false,
                }));
                setFiles(hosts);
            } else {
                setFiles([]);
            }

            // 2. Shared
            const sharedRes = await fetch(`/god/v1/hosts/shared?t=${Date.now()}`, { cache: 'no-store' });
            const sharedData = await sharedRes.json();
            if (sharedData.success && sharedData.data) {
                setShared({
                    content: sharedData.data.content || '',
                    original: sharedData.data.content || '',
                    path: sharedData.data.path || '/var/www/gs/setup/server/gen_shared.conf',
                });
            }
        } catch (err) {
            console.error('Failed to load:', err);
            showNotification(`❌ ${err.message}`, 'error');
        } finally {
            setLoadingConfigs(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const updateFileContent = (domain, newContent) => {
        setFiles(prev => prev.map(f =>
            f.domain === domain ? { ...f, content: newContent } : f
        ));
    };

    const updateShared = (newContent) => {
        setShared(prev => ({ ...prev, content: newContent }));
    };

    // --- Save host ---
    const handleSave = async (domain, content) => {
        setFiles(prev => prev.map(f =>
            f.domain === domain ? { ...f, saving: true } : f
        ));

        try {
            const response = await fetch('/god/v1/hosts/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, content }),
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ Config saved for ${domain}`, 'success');
                setFiles(prev => prev.map(f =>
                    f.domain === domain ? { ...f, original: content, saving: false } : f
                ));
            } else {
                showNotification(`❌ Failed to save ${domain}: ${result.error || 'Unknown error'}`, 'error');
                setFiles(prev => prev.map(f =>
                    f.domain === domain ? { ...f, saving: false } : f
                ));
            }
        } catch (error) {
            showNotification(`❌ Error saving ${domain}: ${error.message}`, 'error');
            setFiles(prev => prev.map(f =>
                f.domain === domain ? { ...f, saving: false } : f
            ));
        }
    };

    // --- Delete host ---
    const handleDelete = async (domain) => {
        if (!window.confirm(`Delete nginx config for "${domain}"?`)) return;

        setFiles(prev => prev.map(f =>
            f.domain === domain ? { ...f, saving: true } : f
        ));

        try {
            const response = await fetch('/god/v1/hosts/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain }),
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ Config deleted for ${domain}`, 'success');
                setFiles(prev => prev.filter(f => f.domain !== domain));
            } else {
                showNotification(`❌ Failed to delete ${domain}: ${result.error}`, 'error');
                setFiles(prev => prev.map(f =>
                    f.domain === domain ? { ...f, saving: false } : f
                ));
            }
        } catch (error) {
            showNotification(`❌ Error: ${error.message}`, 'error');
            setFiles(prev => prev.map(f =>
                f.domain === domain ? { ...f, saving: false } : f
            ));
        }
    };

    // --- Save shared ---
    const handleSaveShared = async () => {
        try {
            const response = await fetch('/god/v1/hosts/shared', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: shared.content }),
            });
            const result = await response.json();

            if (result.success) {
                showNotification('✅ gen_shared.conf saved', 'success');
                setShared(prev => ({ ...prev, original: prev.content }));
            } else {
                showNotification(`❌ Failed to save shared: ${result.error}`, 'error');
            }
        } catch (error) {
            showNotification(`❌ Error: ${error.message}`, 'error');
        }
    };

    const handleReload = async () => {
        try {
            const response = await fetch('/god/v1/hosts/reload', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                showNotification('✅ Nginx reloaded', 'success');
            } else {
                showNotification(`❌ Reload failed: ${result.error}`, 'error');
            }
        } catch (error) {
            showNotification('❌ Error reloading Nginx', 'error');
        }
    };

    const handleTestConfig = async () => {
        try {
            const response = await fetch('/god/v1/hosts/test', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                showNotification('✅ Nginx config test passed', 'success');
            } else {
                showNotification(`❌ Test failed: ${result.error}`, 'error');
            }
        } catch (error) {
            showNotification('❌ Error testing config', 'error');
        }
    };

    const getLineCount = (content) => (!content || typeof content !== 'string') ? 0 : content.split('\n').length;
    const getSize = (content) => (!content || typeof content !== 'string') ? 0 : new Blob([content]).size;

    if (loadingConfigs) {
        return <div className="tab-pane"><div className="loading-state">Loading nginx configs...</div></div>;
    }

    const sharedModified = shared.content !== shared.original;

    return (
        <div className="tab-pane">
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>⚙️ Nginx Configuration</h2>
                <span className="db-count" style={{ marginLeft: 8 }}>
                    {files.length} hosts
                </span>
                <div className="header-actions" style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                    <button className="btn-refresh-all" onClick={fetchAll}>🔄 Refresh</button>
                    <button className="btn-test" onClick={handleTestConfig}>🔍 Test All</button>
                    <button className="btn-reload" onClick={handleReload}>🔄 Reload Nginx</button>
                </div>
            </div>

            {/* gen_shared.conf card */}
            <div className="nginx-card" style={{
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                marginBottom: 20,
            }}>
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                        🔗 {shared.path} (shared include)
                    </div>
                    <div className={`status-badge ${sharedModified ? 'modified' : ''}`} style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: sharedModified ? '#fef3c7' : '#dcfce7',
                        color: sharedModified ? '#92400e' : '#166534'
                    }}>
                        {sharedModified ? '⚠️ Modified' : '✓ Saved'}
                    </div>
                </div>

                <div style={{ padding: 12 }}>
                    <textarea
                        value={shared.content}
                        onChange={(e) => updateShared(e.target.value)}
                        style={{
                            width: '100%',
                            height: '250px',
                            fontFamily: 'monospace',
                            fontSize: 12,
                            padding: 8,
                            border: '1px solid #cbd5e1',
                            borderRadius: 4,
                            resize: 'vertical',
                        }}
                        spellCheck={false}
                    />
                </div>

                <div style={{
                    padding: '12px 16px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc'
                }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                        {getLineCount(shared.content)} lines · {getSize(shared.content)} B
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => setShared(prev => ({ ...prev, content: prev.original }))}
                            disabled={!sharedModified}
                            style={{
                                padding: '4px 8px',
                                fontSize: 12,
                                background: 'white',
                                border: '1px solid #cbd5e1',
                                borderRadius: 4,
                                cursor: !sharedModified ? 'not-allowed' : 'pointer',
                                opacity: !sharedModified ? 0.5 : 1,
                            }}
                        >
                            ↩️ Discard
                        </button>
                        <button
                            onClick={handleSaveShared}
                            disabled={!sharedModified}
                            style={{
                                padding: '4px 12px',
                                fontSize: 12,
                                background: sharedModified ? '#3b82f6' : '#cbd5e1',
                                color: sharedModified ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: 4,
                                cursor: !sharedModified ? 'not-allowed' : 'pointer',
                            }}
                        >
                            💾 Save shared
                        </button>
                    </div>
                </div>
            </div>

            {/* Hosts grid */}
            {files.length === 0 ? (
                <div className="empty-state">No nginx configs found</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {files.map(file => {
                        const isModified = file.content !== file.original;

                        return (
                            <div key={file.domain} className="nginx-card" style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                background: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{file.domain}</div>
                                    <div className={`status-badge ${isModified ? 'modified' : ''}`} style={{
                                        fontSize: 11,
                                        padding: '2px 8px',
                                        borderRadius: 12,
                                        background: isModified ? '#fef3c7' : '#dcfce7',
                                        color: isModified ? '#92400e' : '#166534'
                                    }}>
                                        {isModified ? '⚠️ Modified' : '✓ Saved'}
                                    </div>
                                </div>

                                <div style={{ padding: 12, flex: 1 }}>
                                    <textarea
                                        value={file.content}
                                        onChange={(e) => updateFileContent(file.domain, e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '300px',
                                            fontFamily: 'monospace',
                                            fontSize: 12,
                                            padding: 8,
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 4,
                                            resize: 'vertical'
                                        }}
                                        spellCheck={false}
                                    />
                                </div>

                                <div style={{
                                    padding: '12px 16px',
                                    borderTop: '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#f8fafc'
                                }}>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>
                                        {getLineCount(file.content)} lines · {getSize(file.content)} B
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => updateFileContent(file.domain, file.original)}
                                            disabled={!isModified || file.saving}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: 12,
                                                background: 'white',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: 4,
                                                cursor: (!isModified || file.saving) ? 'not-allowed' : 'pointer',
                                                opacity: (!isModified || file.saving) ? 0.5 : 1
                                            }}
                                        >
                                            ↩️ Discard
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.domain)}
                                            disabled={file.saving}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: 12,
                                                background: 'white',
                                                color: '#ef4444',
                                                border: '1px solid #fecaca',
                                                borderRadius: 4,
                                                cursor: file.saving ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                        <button
                                            onClick={() => handleSave(file.domain, file.content)}
                                            disabled={!isModified || file.saving}
                                            style={{
                                                padding: '4px 12px',
                                                fontSize: 12,
                                                background: isModified ? '#3b82f6' : '#cbd5e1',
                                                color: isModified ? 'white' : '#64748b',
                                                border: 'none',
                                                borderRadius: 4,
                                                cursor: (!isModified || file.saving) ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {file.saving ? 'Saving...' : '💾 Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NginxManager;