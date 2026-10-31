// components/superadmin/SSLManager.jsx
import React, { useState, useEffect } from 'react';

const SSLManager = ({ sslInfo: sslInfoProp, onSSLAction, actionLoading }) => {
    const [sslInfo, setSslInfo] = useState(sslInfoProp || {});
    const [loading, setLoading] = useState(true);
    const [localStatus, setLocalStatus] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [actionInProgress, setActionInProgress] = useState({});

    const showNotification = (message, type = 'success') => {
        setLocalStatus({ show: true, message, type });
        setTimeout(() => setLocalStatus({ show: false, message: '', type: '' }), 4000);
    };

    // ✅ Robust parsing
    const parseSSLResponse = (result) => {
        if (!result) return {};

        // Error case
        if (result.error && !result.data && typeof result.error === 'string') {
            throw new Error(result.error);
        }

        let sslData = null;

        // 1. { success: true, data: {...} }
        if (result.success && result.data !== undefined) {
            sslData = result.data;
        }
        // 2. { data: {...} } ή { data: { data: {...} } }
        else if (result.data !== undefined) {
            sslData = result.data;
            if (sslData?.data && typeof sslData.data === 'object') {
                sslData = sslData.data;
            }
        }
        // 3. Raw object (π.χ. { 'domain.com': {...} })
        else if (typeof result === 'object') {
            sslData = result;
        }

        if (!sslData || typeof sslData !== 'object') return {};

        // Array → object
        if (Array.isArray(sslData)) {
            const asObj = {};
            sslData.forEach((item, idx) => {
                if (item && typeof item === 'object') {
                    const key = item.domain || item.name || item.host || `cert_${idx}`;
                    asObj[key] = item;
                }
            });
            return asObj;
        }

        return sslData;
    };

    const fetchSSL = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/local/getSSLs?t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('🔒 SSL raw response:', result);

            const sslData = parseSSLResponse(result);
            console.log('🔒 Parsed SSL:', sslData);

            // Enrichment: υπολογισμός days_valid αν λείπει, normalize exists
            const enriched = {};
            for (const [domain, info] of Object.entries(sslData)) {
                if (!info || typeof info !== 'object') {
                    enriched[domain] = { exists: false, error: 'Invalid data' };
                    continue;
                }

                let daysValid = info.days_valid;
                if (daysValid === undefined || daysValid === null) {
                    // Υπολόγισε από expires
                    const expires = info.expires || info.valid_to;
                    if (expires) {
                        const ts = new Date(expires).getTime();
                        if (!isNaN(ts)) {
                            daysValid = Math.floor((ts - Date.now()) / 86400000);
                        }
                    }
                }

                enriched[domain] = {
                    ...info,
                    exists: info.exists !== undefined
                        ? !!info.exists
                        : (info.fullchain_exists && info.privkey_exists),
                    expires: info.expires || info.valid_to || 'Unknown',
                    days_valid: daysValid,
                    issuer: info.issuer || info.key_type || '—',
                };
            }

            setSslInfo(enriched);

            if (Object.keys(enriched).length === 0) {
                showNotification('⚠️ No certificates found', 'error');
            }
        } catch (error) {
            console.error('❌ Error fetching SSL:', error);
            showNotification(`❌ Failed to load SSL: ${error.message}`, 'error');
            if (sslInfoProp && Object.keys(sslInfoProp).length > 0) {
                setSslInfo(sslInfoProp);
            } else {
                setSslInfo({});
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSSL();
    }, []);

    // Actions
    const handleAction = async (action, domain) => {
        if (typeof onSSLAction === 'function') {
            return onSSLAction(action, domain);
        }

        setActionInProgress(prev => ({ ...prev, [domain]: action }));

        try {
            const endpoint = action === 'renew'
                ? '/api/v1/local/renewSSL'
                : '/api/v1/local/delSSL';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: domain, domain }),
            });

            const result = await response.json();

            const ok = result?.success || result?.status === 'success';
            if (ok) {
                showNotification(`✅ ${action === 'renew' ? 'Renewed' : 'Deleted'} SSL for ${domain}`, 'success');
            } else {
                showNotification(`❌ ${action} failed: ${result?.error || result?.message || 'Unknown error'}`, 'error');
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
                                        onClick={() => handleAction('del', domain)}
                                        disabled={busy}
                                    >
                                        {actionInProgress[domain] === 'del' ? '⏳ Deleting...' : '🗑️ Delete'}
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