// components/superadmin/NotificationToast.jsx
import React from 'react';

export default function NotificationToast({ notification }) {
    if (!notification?.show) return null;
    return (
        <div style={{
            position: 'fixed', top: 20, right: 20,
            padding: '12px 20px', borderRadius: 8,
            background: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white', zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
            {notification.type === 'success' ? '✓ ' : '✗ '}
            {notification.message}
        </div>
    );
}