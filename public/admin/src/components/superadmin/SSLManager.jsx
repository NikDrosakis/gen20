// components/superadmin/SSLManager.jsx
import React from 'react';

const SSLManager = ({ sslInfo, onSSLAction, actionLoading }) => {
    return (
        <div className="tab-pane">
            <h2>SSL Certificates</h2>
            <div className="ssl-grid">
                {Object.keys(sslInfo).length === 0 ? (
                    <div className="empty-state">No SSL certificates found</div>
                ) : (
                    Object.entries(sslInfo).map(([domain, info]) => (
                        <div key={domain} className="ssl-card">
                            <h3>{domain}</h3>
                            <p>Expires: {info.expires || 'Unknown'}</p>
                            <p>Status: {info.exists ? 'Active' : 'Missing'}</p>
                            {info.days_valid && (
                                <p className={info.days_valid < 30 ? 'expiring-soon' : ''}>
                                    Days valid: {info.days_valid}
                                </p>
                            )}
                            <div className="card-actions">
                                <button
                                    className="btn-small"
                                    onClick={() => onSSLAction('renew', domain)}
                                    disabled={actionLoading}
                                >
                                    🔄 Renew
                                </button>
                                <button
                                    className="btn-small-danger"
                                    onClick={() => onSSLAction('del', domain)}
                                    disabled={actionLoading}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SSLManager;