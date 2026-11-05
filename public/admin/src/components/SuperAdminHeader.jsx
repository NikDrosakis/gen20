// components/SuperAdminHeader.jsx
import React from 'react';

const SuperAdminHeader = ({
                              onRefresh,
                              onSync,
                              isLoading,
                          }) => {
    return (
        <div className="superadmin-header">
            <div className="superadmin-header-top">
                <h1>🛡️ SuperAdmin</h1>
                <div className="header-actions">
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