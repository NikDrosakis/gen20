// components/superadmin/SuperAdminHeader.jsx
import React from 'react';

const SuperAdminHeader = ({
                              usingCache,
                              cacheTimestamp,
                              onRefresh,
                              onSync,
                              isLoading,
                          }) => {
    return (
        <div className="superadmin-header">
            <div className="superadmin-header-top">
                <h1>🛡️ SuperAdmin Dashboard</h1>
                <div className="header-actions">
                    {usingCache && (
                        <div
                            className="cache-badge"
                            title={`Cached data from ${
                                cacheTimestamp
                                    ? new Date(cacheTimestamp).toLocaleString()
                                    : 'unknown time'
                            }`}
                        >
                            📦 Cache Mode
                        </div>
                    )}
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="refresh-btn"
                    >
                        🔄 Refresh Data
                    </button>
                    <button
                        onClick={onSync}
                        disabled={isLoading}
                        className="sync-btn"
                    >
                        🔄 Sync All Domains
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminHeader;