// components/SuperAdminHeader.jsx
import React from 'react';

import { useMessaging } from '../MessagingContext';
function BuildButton() {
    const { send, connection } = useMessaging();
    return (
        <button
            onClick={() => send({
                type: 'terminal',
                verba: 'yarn build',
                domain: 'admin'
            })}
            disabled={connection !== 'open'}
            style={{
                padding: '6px 12px',
                background: connection === 'open' ? '#4a90e2' : '#888',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: connection === 'open' ? 'pointer' : 'not-allowed',
                fontSize: 14,
                fontWeight: 600,
            }}
            title={connection === 'open' ? 'Run yarn build' : 'WebSocket not connected'}
        >
            🔨 Build
        </button>
    );
}
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
                    <BuildButton />
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