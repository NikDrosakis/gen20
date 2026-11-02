// components/superadmin/DNSManager.jsx
import React, { useState, useEffect } from 'react';

const DNSManager = () => {
    const [files, setFiles] = useState([]);
    const [namedConf, setNamedConf] = useState({ content: '', original: '', path: '' });
    const [loadingConfigs, setLoadingConfigs] = useState(true);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    const fetchAll = async () => {
        setLoadingConfigs(true);
        try {
            const listRes = await fetch(`/god/v1/bind/list?t=${Date.now()}`, { cache: 'no-store' });
            const listData = await listRes.json();

            if (!listData.success || !listData.data) {
                showNotification('⚠️ No data from bind/list', 'error');
                setFiles([]);
                return;
            }

            const { zones, named_conf, named_path } = listData.data;

            // named.conf.remote
            setNamedConf({
                content: named_conf || '',
                original: named_conf || '',
                path: named_path || '/etc/bind/named.conf.remote',
            });

            // Zones
            const promises = (zones || []).map(async (z) => {
                let content = '';
                try {
                    const res = await fetch(`/god/v1/bind/read?domain=${encodeURIComponent(z.domain)}`);
                    const data = await res.json();
                    if (data.success && data.data?.content) {
                        content = data.data.content;
                    }
                } catch (err) {
                    console.error(`Failed to read ${z.domain}:`, err);
                }

                return {
                    domain: z.domain,
                    path: z.file,
                    content,
                    original: content,
                    saving: false,
                };
            });

            const results = await Promise.all(promises);
            setFiles(results);
        } catch (error) {
            console.error('Error fetching:', error);
            showNotification(`❌ ${error.message}`, 'error');
        } finally {
            setLoadingConfigs(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const updateZoneContent = (domain, newContent) => {
        setFiles(prev => prev.map(f =>
            f.domain === domain ? { ...f, content: newContent } : f
        ));
    };

    const updateNamedConf = (newContent) => {
        setNamedConf(prev => ({ ...prev, content: newContent }));
    };

    const handleSaveZone = async (domain, content) => {
        setFiles(prev => prev.map(f =>
            f.domain === domain ? { ...f, saving: true } : f
        ));

        try {
            const response = await fetch('/god/v1/bind/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, content }),
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ DNS zone saved for ${domain}`, 'success');
                setFiles(prev => prev.map(f =>
                    f.domain === domain ? { ...f, original: content, saving: false } : f
                ));
            } else {
                showNotification(`❌ Failed to save ${domain}: ${result.error}`, 'error');
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

    const handleSaveNamedConf = async () => {
        try {
            const response = await fetch('/god/v1/bind/named-conf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: namedConf.content }),
            });
            const result = await response.json();

            if (result.success) {
                showNotification('✅ named.conf.remote saved', 'success');
                setNamedConf(prev => ({ ...prev, original: prev.content }));
                // Reload zones γιατί μπορεί να άλλαξαν
                await fetchAll();
            } else {
                showNotification(`❌ Failed to save named.conf.remote: ${result.error}`, 'error');
            }
        } catch (error) {
            showNotification(`❌ Error: ${error.message}`, 'error');
        }
    };

    const handleReload = async () => {
        try {
            const response = await fetch('/god/v1/bind/reload', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                showNotification('✅ Bind reloaded', 'success');
            } else {
                showNotification(`❌ Reload failed: ${result.error}`, 'error');
            }
        } catch (error) {
            showNotification('❌ Error reloading Bind', 'error');
        }
    };

    const handleDeleteZone = async (domain) => {
        // Διπλή επιβεβαίωση — είναι καταστροφικό
        if (!window.confirm(`Delete DNS zone "${domain}"?\n\nThis will:\n• Remove the zone file\n• Remove the entry from named.conf.remote\n• Reload Bind\n\nThis cannot be undone.`)) {
            return;
        }

        setFiles(prev => prev.map(f =>
            f.domain === domain ? { ...f, saving: true } : f
        ));

        try {
            const response = await fetch('/god/v1/bind/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain }),
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ Zone "${domain}" deleted`, 'success');
                // Αφαίρεσε από τη λίστα
                setFiles(prev => prev.filter(f => f.domain !== domain));
            } else {
                showNotification(`❌ Failed to delete ${domain}: ${result.error}`, 'error');
                setFiles(prev => prev.map(f =>
                    f.domain === domain ? { ...f, saving: false } : f
                ));
            }
        } catch (error) {
            showNotification(`❌ Error deleting ${domain}: ${error.message}`, 'error');
            setFiles(prev => prev.map(f =>
                f.domain === domain ? { ...f, saving: false } : f
            ));
        }
    };
    const handleTestConfig = async () => {
        try {
            const response = await fetch('/god/v1/bind/test', { method: 'POST' });
            const result = await response.json();

            if (result.success) {
                const data = result.data || {};
                showNotification(
                    `✅ Test passed: ${data.passed}/${data.total} zones OK${data.failed > 0 ? ` (${data.failed} failed)` : ''}`,
                    data.failed > 0 ? 'error' : 'success'
                );
                console.log('Zone test results:', data.results);
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
        return <div className="tab-pane"><div className="loading-state">Loading DNS zones...</div></div>;
    }

    const namedConfModified = namedConf.content !== namedConf.original;

    return (
        <div className="tab-pane">
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>🌍 DNS Zone Configuration</h2>
                <span className="db-count" style={{ marginLeft: 8 }}>
                    {files.length} zones
                </span>
                <div className="header-actions" style={{ display: 'flex',  marginLeft: 'auto' }}>
                    <button className="btn-refresh-all" onClick={fetchAll}>🔄 Refresh</button>
                    <button className="btn-test" onClick={handleTestConfig}>🔍 Test All</button>
                    <button className="btn-reload" onClick={handleReload}>🔄 Reload Bind</button>
                </div>
            </div>

            {/* named.conf.remote card */}
            <div className="dns-card" style={{
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
                        ⚙️ {namedConf.path}
                    </div>
                    <div className={`status-badge ${namedConfModified ? 'modified' : ''}`} style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: namedConfModified ? '#fef3c7' : '#dcfce7',
                        color: namedConfModified ? '#92400e' : '#166534'
                    }}>
                        {namedConfModified ? '⚠️ Modified' : '✓ Saved'}
                    </div>
                </div>

                <div style={{ padding: 12 }}>
                    <textarea
                        value={namedConf.content}
                        onChange={(e) => updateNamedConf(e.target.value)}
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
                    <div style={{fontSize: 11, color: '#64748b'}}>
                        {getLineCount(namedConf.content)} lines · {getSize(namedConf.content)} B
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                        <button
                            onClick={() => setNamedConf(prev => ({...prev, content: prev.original}))}
                            disabled={!namedConfModified}
                            style={{
                                padding: '4px 8px',
                                fontSize: 12,
                                background: 'white',
                                border: '1px solid #cbd5e1',
                                borderRadius: 4,
                                cursor: !namedConfModified ? 'not-allowed' : 'pointer',
                                opacity: !namedConfModified ? 0.5 : 1,
                            }}
                        >
                            ↩️ Discard
                        </button>
                        <button
                            onClick={handleSaveNamedConf}
                            disabled={!namedConfModified}
                            style={{
                                padding: '4px 12px',
                                fontSize: 12,
                                background: namedConfModified ? '#3b82f6' : '#cbd5e1',
                                color: namedConfModified ? 'white' : '#64748b',
                                border: 'none',
                                borderRadius: 4,
                                cursor: !namedConfModified ? 'not-allowed' : 'pointer',
                            }}
                        >
                            💾 Save named.conf
                        </button>
                    </div>
                </div>
            </div>

            {/* Zones grid */}
            {files.length === 0 ? (
                <div className="empty-state">No DNS zones found</div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'}}>
                    {files.map(file => {
                        const isModified = file.content !== file.original;
                        return (
                            <div key={file.domain} className="dns-card" style={{
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
                                        onChange={(e) => updateZoneContent(file.domain, e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '300px',
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
                                        {getLineCount(file.content)} lines · {getSize(file.content)} B
                                    </div>
                                    <div style={{display: 'flex', gap: 8}}>
                                        <button
                                            onClick={() => handleDeleteZone(file.domain)}
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
                                            title="Delete zone (removes file + named.conf entry)"
                                        >
                                            🗑️ Delete
                                        </button>
                                        <button
                                            onClick={() => updateZoneContent(file.domain, file.original)}
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
                                            onClick={() => handleSaveZone(file.domain, file.content)}
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

export default DNSManager;