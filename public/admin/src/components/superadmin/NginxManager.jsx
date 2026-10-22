// components/superadmin/NginxManager.jsx
import React, { useState, useEffect } from 'react';

const NginxManager = ({ selectedDomain = '' }) => {
    const [loading, setLoading] = useState(false);
    const [configContent, setConfigContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [filePath, setFilePath] = useState('');

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    // Φόρτωση του config για το συγκεκριμένο domain
    const loadConfig = async (domain) => {
        if (!domain) {
            setConfigContent('');
            setFilePath('');
            return;
        }

        setLoading(true);
        const path = `/etc/nginx/conf.d/${domain}.conf`;
        setFilePath(path);

        try {
            const response = await fetch(`/api/v1/local/getFileContent?path=${encodeURIComponent(path)}`);
            const result = await response.json();

            console.log('🔍 API Response:', result);

            if (result.success && result.data) {
                let content = null;

                if (typeof result.data === 'string') {
                    content = result.data;
                } else if (result.data.data) {
                    content = result.data.data;
                } else if (result.data.content) {
                    content = result.data.content;
                }

                if (content) {
                    setConfigContent(content);
                    setOriginalContent(content);
                } else {
                    throw new Error('No content found in response');
                }
            } else {
                throw new Error(result.error || 'Failed to load config');
            }
        } catch (error) {
            console.error('Error loading config:', error);

            const template = `# Nginx configuration for ${domain}
server {
    listen 443 ssl;
    http2 on;
    server_name ${domain};
    root /var/www/gs/public/${domain}/dist;
    index index.html;
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    include /var/www/gs/setup/nginx/gen_shared.conf;

    location = /favicon.ico {
        log_not_found off;
        access_log off;
        try_files /favicon.ico =204;
    }

    location / {
        root /var/www/gs/public/${domain}/dist;
        index index.html;
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        try_files $uri $uri/ /index.html;
    }
}`;
            setConfigContent(template);
            setOriginalContent(template);
            showNotification(`📝 New config template created for ${domain}`, 'warning');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDomain) {
            loadConfig(selectedDomain);
        } else {
            setConfigContent('');
            setOriginalContent('');
            setFilePath('');
        }
    }, [selectedDomain]);

    const handleSave = async () => {
        if (!selectedDomain || !configContent) return;

        setSaving(true);
        const path = `/etc/nginx/conf.d/${selectedDomain}.conf`;

        try {
            const response = await fetch('/api/v1/local/saveFileContent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: path,
                    content: configContent
                })
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ Config saved successfully for ${selectedDomain}`, 'success');
                setOriginalContent(configContent);
            } else {
                showNotification(`❌ Failed to save: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            showNotification('❌ Error saving config', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReload = async () => {
        try {
            const response = await fetch('/api/v1/local/reloadNginx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();

            if (result.success) {
                showNotification('✅ Nginx reloaded successfully', 'success');
            } else {
                showNotification(`❌ Failed to reload Nginx: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error reloading Nginx:', error);
            showNotification('❌ Error reloading Nginx', 'error');
        }
    };

    const handleTestConfig = async () => {
        try {
            const response = await fetch('/api/v1/local/testNginxConfig', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();

            if (result.success) {
                showNotification('✅ Nginx config test passed', 'success');
            } else {
                showNotification(`❌ Config test failed: ${result.error || result.details || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error testing config:', error);
            showNotification('❌ Error testing config', 'error');
        }
    };

    const handleCancel = () => {
        setConfigContent(originalContent);
        showNotification('Changes discarded', 'warning');
    };

    // ✅ Βοηθητική συνάρτηση για ασφαλή split
    const getLineCount = (content) => {
        if (!content || typeof content !== 'string') return 0;
        return content.split('\n').length;
    };

    // ✅ Βοηθητική συνάρτηση για ασφαλές μέγεθος
    const getSize = (content) => {
        if (!content || typeof content !== 'string') return 0;
        return new Blob([content]).size;
    };

    if (!selectedDomain) {
        return (
            <div className="tab-pane">
                <div className="empty-state">
                    <span className="empty-icon">📁</span>
                    <p>Select a domain to edit its Nginx configuration</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header">
                <h2>⚙️ Nginx Configuration</h2>
                <div className="header-actions">
                    <span className="domain-badge">🌐 {selectedDomain}</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading configuration...</div>
            ) : (
                <div className="nginx-edit-mode">
                    <div className="edit-header">
                        <div className="edit-info">
                            <span className="file-path">📁 {filePath}</span>
                            <span className={`status-badge ${configContent !== originalContent ? 'modified' : ''}`}>
                                {configContent !== originalContent ? '⚠️ Modified' : '✓ Up to date'}
                            </span>
                        </div>
                        <div className="edit-actions">
                            {configContent !== originalContent && (
                                <button className="btn-cancel" onClick={handleCancel}>
                                    ↩️ Discard
                                </button>
                            )}
                            <button className="btn-test" onClick={handleTestConfig}>
                                🔍 Test
                            </button>
                            <button className="btn-reload" onClick={handleReload}>
                                🔄 Reload
                            </button>
                            <button className="btn-save" onClick={handleSave} disabled={saving || configContent === originalContent}>
                                {saving ? 'Saving...' : '💾 Save'}
                            </button>
                        </div>
                    </div>

                    <div className="edit-content">
                        <textarea
                            value={configContent || ''}
                            onChange={(e) => setConfigContent(e.target.value)}
                            className="nginx-editor"
                            rows={20}
                            spellCheck={false}
                        />
                    </div>

                    <div className="edit-footer">
                        <span className="file-info">
                            Lines: {getLineCount(configContent)} |
                            Size: {getSize(configContent)} bytes
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NginxManager;