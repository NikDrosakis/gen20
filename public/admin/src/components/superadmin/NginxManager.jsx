// components/superadmin/NginxManager.jsx
import React, { useState, useEffect } from 'react';

const NginxManager = () => {
    const [domains, setDomains] = useState([]);
    const [loadingDomains, setLoadingDomains] = useState(true);
    const [files, setFiles] = useState([]); // Array από { domain, path, content, original }
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
    // 2. Φόρτωση όλων των configs παράλληλα όταν έρθουν τα domains
    // ============================================================
    useEffect(() => {
        if (domains.length === 0) return;

        const fetchAllConfigs = async () => {
            setLoadingConfigs(true);

            // Δημιουργούμε promises για κάθε domain
            const promises = domains.map(async (d) => {
                const domainName = d.name;
                const path = `/etc/nginx/conf.d/${domainName}.conf`;
                let content = '';

                try {
                    const response = await fetch(`/api/v1/local/getFileContent?path=${encodeURIComponent(path)}`);
                    const result = await response.json();

                    if (result.success && result.data) {
                        if (typeof result.data === 'string') content = result.data;
                        else if (result.data.data) content = result.data.data;
                        else if (result.data.content) content = result.data.content;
                    }
                } catch (err) {
                    // Αν δεν υπάρχει το αρχείο, φτιάχνουμε template
                    content = `# Nginx configuration for ${domainName}
server {
    listen 443 ssl;
    http2 on;
    server_name ${domainName};
    root /var/www/gs/public/${domainName}/dist;
    index index.html;
    ssl_certificate /etc/letsencrypt/live/${domainName}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domainName}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    include /var/www/gs/setup/nginx/gen_shared.conf;

    location = /favicon.ico {
        log_not_found off;
        access_log off;
        try_files /favicon.ico =204;
    }

    location / {
        root /var/www/gs/public/${domainName}/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}`;
                }

                return {
                    domain: domainName,
                    path: path,
                    content: content,
                    original: content,
                    saving: false,
                    expanded: false // Για να μην ανοίγουν όλα τα textareas μαζί
                };
            });

            const results = await Promise.all(promises);
            setFiles(results);
            setLoadingConfigs(false);
        };

        fetchAllConfigs();
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
        // Βάζουμε το saving=true για το συγκεκριμένο domain
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
            console.error('Error saving config:', error);
            showNotification(`❌ Error saving ${domain}`, 'error');
            setFiles(prev => prev.map(f =>
                f.domain === domain ? { ...f, saving: false } : f
            ));
        }
    };

    const handleReload = async () => {
        try {
            const response = await fetch('/api/v1/local/reloadNginx', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                showNotification('✅ Nginx reloaded successfully', 'success');
            } else {
                showNotification(`❌ Failed to reload Nginx: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            showNotification('❌ Error reloading Nginx', 'error');
        }
    };

    const handleTestConfig = async () => {
        try {
            const response = await fetch('/api/v1/local/testNginxConfig', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                showNotification('✅ Nginx config test passed', 'success');
            } else {
                showNotification(`❌ Config test failed: ${result.error || result.details || 'Unknown error'}`, 'error');
            }
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
    if (domains.length === 0) return <div className="tab-pane"><div className="empty-state">No domains found</div></div>;

    return (
        <div className="tab-pane">
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>⚙️ Nginx Configuration</h2>
                <div className="header-actions" style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-test" onClick={handleTestConfig}>
                        🔍 Test All
                    </button>
                    <button className="btn-reload" onClick={handleReload}>
                        🔄 Reload Nginx
                    </button>
                </div>
            </div>

            {loadingConfigs ? (
                <div className="loading-state">Loading all configurations...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
                                        className="nginx-editor"
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

export default NginxManager;