// src/components/ChatList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import './ChatList.css';

const ChatList = ({ onOpenChat, activeChat }) => {  // ← Δέχεται το onOpenChat
    const { isConnected, send, onMessage } = useWebSocket();
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    // Fetch sessions
    const fetchSessions = async () => {
        try {
            const response = await fetch('/ermis/v1/sessions');
            const data = await response.json();
            if (data.success) {
                setSessions(data.sessions || []);
            }
        } catch (err) {
            console.error('Error fetching sessions:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/ermis/v1/sessions/stats');
            const data = await response.json();
            if (data.success) {
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchSessions(), fetchStats()]);
        setLoading(false);
    };

    useEffect(() => {
        fetchAll();
        intervalRef.current = setInterval(() => {
            fetchSessions();
            fetchStats();
        }, 5000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Αυτή η function καλείται όταν κάνεις click σε χρήστη
    const handleUserClick = (session) => {
        if (onOpenChat) {
            onOpenChat({
                userId: session.userId,
                userName: session.userName || 'Anonymous',
                userImg: session.userImg,
                sessionId: session.id,
                status: session.status
            });
        } else {
            console.warn('⚠️ onOpenChat prop is missing');
        }
    };

    const getStatusColor = (session) => {
        if (session.status === 'closed') return '#ef4444';
        if (session.status === 'active') return '#22c55e';
        return '#f59e0b';
    };

    const getStatusText = (session) => {
        if (session.status === 'closed') return 'Offline';
        if (session.status === 'active') return 'Online';
        return 'Connecting';
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleTimeString('el-GR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="chatlist-loading">
                <div className="loading-spinner"></div>
                <p>Loading sessions...</p>
            </div>
        );
    }

    return (
        <div className="chatlist-container">
            <div className="chatlist-header">
                <h3>💬 Active Users</h3>
                <button className="btn-refresh" onClick={fetchAll}>
                    🔄
                </button>
            </div>

            {stats && (
                <div className="chatlist-stats">
                    <div className="stat-item">
                        <span className="stat-icon">🟢</span>
                        <span className="stat-value">{stats.active || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">👤</span>
                        <span className="stat-value">{stats.users || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-icon">💬</span>
                        <span className="stat-value">{stats.messages || 0}</span>
                    </div>
                </div>
            )}

            <div className="chatlist-sessions">
                {sessions.length === 0 ? (
                    <div className="chatlist-empty">
                        <span className="empty-icon">💭</span>
                        <p>No active users</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`chatlist-item ${activeChat?.userId === session.userId ? 'active' : ''}`}
                            onClick={() => handleUserClick(session)}
                        >
                            <div className="chatlist-item-header">
                                <div className="chatlist-user">
                                    <div className="user-avatar">
                                        {session.userImg ? (
                                            <img src={session.userImg} alt={session.userName} />
                                        ) : (
                                            <span className="avatar-placeholder">
                                                {session.userName?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">
                                            {session.userName || 'Anonymous'}
                                            {session.userId && (
                                                <span className="user-id">#{session.userId}</span>
                                            )}
                                        </div>
                                        <div className="user-status">
                                            <span
                                                className="status-dot"
                                                style={{ background: getStatusColor(session) }}
                                            />
                                            {getStatusText(session)}
                                        </div>
                                    </div>
                                </div>
                                <div className="chatlist-meta">
                                    <div className="message-count">
                                        💬 {session.messages?.length || 0}
                                    </div>
                                    <div className="session-time">
                                        {formatTime(session.lastActivity)}
                                    </div>
                                    {activeChat?.userId === session.userId && (
                                        <span className="active-indicator">●</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList;