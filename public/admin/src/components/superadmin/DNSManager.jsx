// components/superadmin/DNSManager.jsx
import React, { useState, useEffect } from 'react';

const DNSManager = ({ selectedDomain = '' }) => {
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

    // Φόρτωση του zone file για το συγκεκριμένο domain
    const loadConfig = async (domain) => {
        if (!domain) {
            setConfigContent('');
            setFilePath('');
            return;
        }

        setLoading(true);
        const path = `/etc/bind/zones/db.${domain}`;
        setFilePath(path);

        try {
            const response = await fetch(`/api/v1/local/getFileContent?path=${encodeURIComponent(path)}`);
            const result = await response.json();

            console.log('🔍 DNS API Response:', result);

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
                // Το αρχείο μπορεί να μην υπάρχει - δημιουργία νέου zone file
                const template = `; DNS Zone file for ${domain}
$TTL 86400
@   IN  SOA ns1.${domain}. admin.${domain}. (
    2024010101  ; Serial
    3600        ; Refresh
    1800        ; Retry
    604800      ; Expire
    86400       ; Minimum TTL
)

; Name Servers
@       IN  NS  ns1.${domain}.
@       IN  NS  ns2.${domain}.

; A Records
@       IN  A   192.168.1.100
ns1     IN  A   192.168.1.100
ns2     IN  A   192.168.1.101
www     IN  A   192.168.1.100
mail    IN  A   192.168.1.102

; CNAME Records
ftp     IN  CNAME   @

; MX Records
@       IN  MX  10  mail.${domain}.

; TXT Records
@       IN  TXT "v=spf1 mx ~all"`;
                setConfigContent(template);
                setOriginalContent(template);
                showNotification(`📝 New DNS zone template created for ${domain}`, 'warning');
            }
        } catch (error) {
            console.error('Error loading DNS config:', error);
            showNotification('Error loading DNS config', 'error');
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

    // Save config
    const handleSave = async () => {
        if (!selectedDomain || !configContent) return;

        setSaving(true);
        const path = `/etc/bind/zones/db.${selectedDomain}`;

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
                showNotification(`✅ DNS zone saved successfully for ${selectedDomain}`, 'success');
                setOriginalContent(configContent);
            } else {
                showNotification(`❌ Failed to save: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error saving DNS config:', error);
            showNotification('❌ Error saving DNS config', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Reload Bind
    const handleReload = async () => {
        try {
            const response = await fetch('/api/v1/local/reloadBind', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();

            if (result.success) {
                showNotification('✅ Bind reloaded successfully', 'success');
            } else {
                showNotification(`❌ Failed to reload Bind: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error reloading Bind:', error);
            showNotification('❌ Error reloading Bind', 'error');
        }
    };

    // Test Bind config
    const handleTestConfig = async () => {
        try {
            const response = await fetch('/api/v1/local/testBindConfig', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();

            if (result.success) {
                showNotification('✅ Bind config test passed', 'success');
            } else {
                showNotification(`❌ Config test failed: ${result.error || result.details || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error testing Bind config:', error);
            showNotification('❌ Error testing Bind config', 'error');
        }
    };

    const handleCancel = () => {
        setConfigContent(originalContent);
        showNotification('Changes discarded', 'warning');
    };

    // Βοηθητικές συναρτήσεις
    const getLineCount = (content) => {
        if (!content || typeof content !== 'string') return 0;
        return content.split('\n').length;
    };

    const getSize = (content) => {
        if (!content || typeof content !== 'string') return 0;
        return new Blob([content]).size;
    };

    if (!selectedDomain) {
        return (
            <div className="tab-pane">
                <div className="empty-state">
                    <span className="empty-icon">🌍</span>
                    <p>Select a domain to edit its DNS zone configuration</p>
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
                <h2>🌍 DNS Zone Configuration</h2>
                <div className="header-actions">
                    <span className="domain-badge">🌐 {selectedDomain}</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading DNS configuration...</div>
            ) : (
                <div className="dns-edit-mode">
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
                            className="dns-editor"
                            rows={20}
                            spellCheck={false}
                        />
                    </div>

                    <div className="edit-footer">
                        <span className="file-info">
                            Lines: {getLineCount(configContent)} |
                            Size: {getSize(configContent)} bytes
                        </span>
                        <span className="file-hint">
                            💡 Zone file format: /etc/bind/zones/db.{selectedDomain}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DNSManager;