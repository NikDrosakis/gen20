// components/superadmin/DNSManager.jsx
import React, { useState, useEffect } from 'react';

const DNSManager = () => {
    const [domains, setDomains] = useState([]);
    const [loadingDomains, setLoadingDomains] = useState(true);
    const [files, setFiles] = useState([]); // Array από { domain, path, content, original, saving }
    const [loadingConfigs, setLoadingConfigs] = useState(false);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    // ============================================================
    // 1. Φόρτωση domains
    // ============================================================
    useEffect(() => {
        (async () => {
            setLoadingDomains(true);
            try {
                const res = await fetch('/api/v1/maria/fa?folder=select * from gen_admin.domain order by name asc');
                const data = await res.json();
                if (data.success && data.data && data.data.length > 0) {
                    setDomains(data.data);
                } else {
                    setDomains([]);
                }
            } catch (err) {
                console.error('Failed to load domains:', err);
                showNotification('❌ Failed to load domains', 'error');
                setDomains([]);
            } finally {
                setLoadingDomains(false);
            }
        })();
    }, []);

    // ============================================================
    // 2. Φόρτωση όλων των zone files παράλληλα
    // ============================================================
    useEffect(() => {
        if (domains.length === 0) return;

        const fetchAllZones = async () => {
            setLoadingConfigs(true);

            const promises = domains.map(async (d) => {
                const domainName = d.name;
                const path = `/etc/bind/zones/db.${domainName}`;
                let content = '';

                try {
                    const response = await fetch(`/api/v1/local/getFileContent?path=${encodeURIComponent(path)}`);
                    const result = await response.json();

                    if (result.success && result.data) {
                        if (typeof result.data === 'string') content = result.data;
                        else if (result.data.data) content = result.data.data;
                        else if (result.data.content) content = result.data.content;
                    }

                    // Αν το αποτέλεσμα είναι επιτυχές αλλά άδειο, πετάμε error για να πάει στο catch (template)
                    if (!content) throw new Error('Empty content');
                } catch (err) {
                    // Template για νέο zone file
                    content = `; DNS Zone file for ${domainName}
$TTL 86400
@   IN  SOA ns1.${domainName}. admin.${domainName}. (
    2024010101
    3600
    1800
    604800
    86400
)

@       IN  NS  ns1.${domainName}.
@       IN  NS  ns2.${domainName}.
@       IN  A   192.168.1.100
ns1     IN  A   192.168.1.100
ns2     IN  A   192.168.1.101
www     IN  A   192.168.1.100`;
                }

                return {
                    domain: domainName,
                    path: path,
                    content: content,
                    original: content,
                    saving: false
                };
            });

            const results = await Promise.all(promises);
            setFiles(results);
            setLoadingConfigs(false);
        };

        fetchAllZones();
    }, [domains]);

    // ============================================================
    // 3. Handlers για κάθε Card
    // ============================================================
    const updateFileContent = (domain, newContent) => {
        setFiles(prev => prev.map(f =>
            f.domain === domain ? { ...f, content: newContent } : f
        ));
    };

    const handleSave = async (domain, path, content) => {
        setFiles(prev => prev.map(f =>
            f.domain === domain ? { ...f, saving: true } : f
        ));

        try {
            const response = await fetch('/api/v1/local/saveFileContent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, content })
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ DNS zone saved for ${domain}`, 'success');
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
            console.error('Error saving config:', error);
            showNotification(`❌ Error saving ${domain}`, 'error');
            setFiles(prev => prev.map(f =>
                f.domain === domain ? { ...f, saving: false } : f
            ));
        }
    };

    const handleReload = async () => {
        try {
            const response = await fetch('/api/v1/local/reloadBind', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const result = await response.json();
            if (result.success) showNotification('✅ Bind reloaded successfully', 'success');
            else showNotification(`❌ Reload failed: ${result.error}`, 'error');
        } catch (error) {
            showNotification('❌ Error reloading Bind', 'error');
        }
    };

    const handleTestConfig = async () => {
        try {
            const response = await fetch('/api/v1/local/testBindConfig', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const result = await response.json();
            if (result.success) showNotification('✅ Config test passed', 'success');
            else showNotification(`❌ Test failed: ${result.error || result.details || 'Unknown error'}`, 'error');
        } catch (error) {
            showNotification('❌ Error testing config', 'error');
        }
    };

    const getLineCount = (content) => (!content || typeof content !== 'string') ? 0 : content.split('\n').length;
    const getSize = (content) => (!content || typeof content !== 'string') ? 0 : new Blob([content]).size;

    // ============================================================
    // Render
    // ============================================================
    if (loadingDomains) return <div className="tab-pane"><div className="loading-state">Loading domains...</div></div>;

    return (
        <div className="tab-pane">
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>🌍 DNS Zone Configuration</h2>
                <div className="header-actions" style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-test" onClick={handleTestConfig}>
                        🔍 Test All
                    </button>
                    <button className="btn-reload" onClick={handleReload}>
                        🔄 Reload Bind
                    </button>
                </div>
            </div>

            {loadingConfigs ? (
                <div className="loading-state">Loading all DNS zones...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
                                {/* Header του Card */}
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

                                {/* Textarea */}
                                <div style={{ padding: 12, flex: 1 }}>
                                    <textarea
                                        value={file.content}
                                        onChange={(e) => updateFileContent(file.domain, e.target.value)}
                                        className="dns-editor"
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

                                {/* Footer του Card */}
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
                                            onClick={() => handleSave(file.domain, file.path, file.content)}
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