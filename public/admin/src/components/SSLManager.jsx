// components/SSLManager.jsx
import React, { useState, useEffect } from 'react';

const SSLManager = ({ onSSLAction, actionLoading }) => {
    const [sslInfo, setSslInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [localStatus, setLocalStatus] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [actionInProgress, setActionInProgress] = useState({});

    const showNotification = (message, type = 'success') => {
        setLocalStatus({ show: true, message, type });
        setTimeout(() => setLocalStatus({ show: false, message: '', type: '' }), 4000);
    };

    // ============================================================
    // Φόρτωση λίστας από /god/v1/ssl/list
    // ============================================================
    const fetchSSL = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/god/v1/ssl/list?t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('🔒 SSL list:', result);

            if (!result.success || !result.data) {
                setSslInfo({});
                showNotification('⚠️ No certificates found', 'error');
                return;
            }

            // Normalize
            const enriched = {};
            for (const [domain, info] of Object.entries(result.data)) {
                enriched[domain] = {
                    exists: !!info.exists,
                    expires: info.expires || 'Unknown',
                    days_valid: typeof info.days_valid === 'number' ? info.days_valid : null,
                    issuer: info.issuer || '—',
                    error: info.error || null,
                };
            }

            setSslInfo(enriched);

            if (Object.keys(enriched).length === 0) {
                showNotification('⚠️ No certificates found', 'error');
            }
        } catch (error) {
            console.error('❌ Error fetching SSL:', error);
            showNotification(`❌ Failed to load SSL: ${error.message}`, 'error');
            setSslInfo({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSSL();
    }, []);

    // ============================================================
    // Actions — renew / delete μέσω /god/v1/ssl/action
    // ============================================================
    const handleAction = async (action, domain) => {
        // Αν ο parent θέλει να το χειριστεί, δώσε του την ευκαιρία
        if (typeof onSSLAction === 'function') {
            return onSSLAction(action, domain);
        }

        // Επιβεβαίωση για delete
        if (action === 'delete') {
            if (!window.confirm(`Delete SSL certificate for ${domain}?`)) {
                return;
            }
        }

        setActionInProgress(prev => ({ ...prev, [domain]: action }));

        try {
            const godAction = action === 'renew' ? 'renew' : 'delete';

            const response = await fetch('/god/v1/ssl/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: godAction, domain }),
            });

            const result = await response.json();

            if (result.success) {
                showNotification(
                    `✅ ${action === 'renew' ? 'Renewed' : 'Deleted'} SSL for ${domain}`,
                    'success'
                );
            } else {
                showNotification(
                    `❌ ${action} failed: ${result.error || 'Unknown error'}`,
                    'error'
                );
            }
        } catch (error) {
            showNotification(`❌ ${action} error: ${error.message}`, 'error');
        } finally {
            setActionInProgress(prev => ({ ...prev, [domain]: null }));
            await fetchSSL();
        }
    };

    const filteredSSL = Object.entries(sslInfo).filter(([domain]) =>
        !searchTerm || domain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ============================================================
    // Render
    // ============================================================
    if (loading && Object.keys(sslInfo).length === 0) {
        return (
            <div className="tab-pane">
                <div className="loading-state">Loading SSL certificates...</div>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            {localStatus.show && (
                <div className={`notification ${localStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {localStatus.message}
                </div>
            )}

            <div className="section-header">
                <h2>🔒 SSL Certificates</h2>
                <span className="db-count" style={{ marginLeft: 8 }}>
                    {Object.keys(sslInfo).length} certificates
                </span>
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Search domain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginLeft: 12 }}
                />
                <button
                    className="btn-refresh-all"
                    onClick={fetchSSL}
                    disabled={loading}
                    style={{ marginLeft: '10px' }}
                >
                    {loading ? '⏳ Loading...' : '🔄 Refresh'}
                </button>
            </div>

            <div className="ssl-grid">
                {filteredSSL.length === 0 ? (
                    <div className="empty-state">
                        {searchTerm
                            ? `No certificates match "${searchTerm}"`
                            : 'No SSL certificates found'}
                    </div>
                ) : (
                    filteredSSL.map(([domain, info]) => {
                        const busy = !!actionInProgress[domain] || actionLoading;
                        return (
                            <div key={domain} className="ssl-card">
                                <h3>{domain}</h3>
                                <p>Expires: {info.expires || 'Unknown'}</p>
                                <p>
                                    Status:{' '}
                                    <span className={info.exists ? 'status-ok' : 'status-missing'}>
                                        {info.exists ? '✓ Active' : '✗ Missing'}
                                    </span>
                                </p>
                                {info.days_valid !== null && info.days_valid !== undefined && (
                                    <p className={info.days_valid < 30 ? 'expiring-soon' : ''}>
                                        Days valid: {info.days_valid}
                                    </p>
                                )}
                                {info.issuer && info.issuer !== '—' && (
                                    <p style={{ fontSize: 12, color: '#64748b' }}>
                                        Issuer: {info.issuer}
                                    </p>
                                )}
                                {info.error && (
                                    <p style={{ fontSize: 12, color: '#ef4444' }}>
                                        ⚠️ {info.error}
                                    </p>
                                )}
                                <div className="card-actions">
                                    <button
                                        className="btn-small"
                                        onClick={() => handleAction('renew', domain)}
                                        disabled={busy}
                                    >
                                        {actionInProgress[domain] === 'renew' ? '⏳ Renewing...' : '🔄 Renew'}
                                    </button>
                                    <button
                                        className="btn-small-danger"
                                        onClick={() => handleAction('delete', domain)}
                                        disabled={busy}
                                    >
                                        {actionInProgress[domain] === 'delete' ? '⏳ Deleting...' : '🗑️ Delete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SSLManager;