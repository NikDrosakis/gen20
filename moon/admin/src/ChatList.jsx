// src/ChatList.jsx
import React, { useEffect, useMemo } from 'react';
import { useMessaging } from './MessagingContext';
import './Chat.css';

const CHAT = "chat";

export default function ChatList({ onOpenChat, activeChat, meUid }) {
    const { connection, messages, send, userID } = useMessaging();
    const myUid = meUid ?? userID;

    // 1. Ζήτα online users
    useEffect(() => {
        if (!myUid || connection !== "open") return;
        send({
            type: "getlist",
            system: CHAT,
            to: myUid,
        });
    }, [myUid, connection, send]);

    // 2. Online users από reslist
    const onlineUsers = useMemo(() => {
        const res = messages.filter(
            (m) => m.type === "reslist" && m.system === CHAT
        );
        if (res.length === 0) return [];
        try {
            return JSON.parse(res[res.length - 1].c || res[res.length - 1].verba || "[]");
        } catch {
            return [];
        }
    }, [messages]);

    // 3. Sessions
    const sessions = useMemo(() => {
        const map = new Map();

        for (const peer of onlineUsers) {
            if (!peer || peer === myUid) continue;
            const cid = [myUid, peer].sort().join("-");
            map.set(cid, {
                cid,
                userId: peer,
                userName: peer,
                status: "active",
                lastMessage: "",
                lastActivity: 0,
                messages: [],
            });
        }

        for (const m of messages) {
            if (m.system !== CHAT) continue;
            if (m.type !== "insert" && m.type !== "message") continue;

            const isMine = m.userid === myUid;
            const peer = isMine ? m.to : m.userid;
            if (!peer || peer === myUid) continue;

            const cid = [myUid, peer].sort().join("-");

            if (!map.has(cid)) {
                map.set(cid, {
                    cid,
                    userId: peer,
                    userName: peer,
                    status: "offline",
                    lastMessage: "",
                    lastActivity: 0,
                    messages: [],
                });
            }
            const s = map.get(cid);
            if (m.c || m.verba) {
                s.lastMessage = m.c ?? m.verba;
                s.lastActivity = m.modified ?? m.t ?? 0;
            }
            s.messages.push(m);
        }

        return Array.from(map.values()).sort((a, b) => {
            if (a.status !== b.status) return a.status === "active" ? -1 : 1;
            return (b.lastActivity ?? 0) - (a.lastActivity ?? 0);
        });
    }, [onlineUsers, messages, myUid]);

    const stats = useMemo(() => ({
        active: sessions.filter(s => s.status === "active").length,
        users: sessions.length,
        messages: sessions.reduce((sum, s) => sum + s.messages.length, 0),
    }), [sessions]);

    const handleUserClick = (session) => {
        if (!onOpenChat) return;
        onOpenChat({
            cid: session.cid,
            userId: session.userId,
            userName: session.userName,
            status: session.status,
        });
    };

    const getStatusColor = (s) => {
        if (connection !== "open") return "#9ca3af";
        return s.status === "active" ? "#22c55e" : "#ef4444";
    };

    const formatTime = (t) => !t ? "" : new Date(t * 1000).toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="chatlist-container">
            <div className="chatlist-header">
                <h3>💬 Users</h3>
                <span className={`status-dot ${connection === "open" ? "online" : "offline"}`} />
            </div>

            <div className="chatlist-stats">
                <div className="stat-item"><span className="stat-icon">🟢</span> <span className="stat-value">{stats.active}</span></div>
                <div className="stat-item"><span className="stat-icon">👤</span> <span className="stat-value">{stats.users}</span></div>
                <div className="stat-item"><span className="stat-icon">💬</span> <span className="stat-value">{stats.messages}</span></div>
            </div>

            <div className="chatlist-sessions">
                {sessions.length === 0 ? (
                    <div className="chatlist-empty">
                        <span className="empty-icon">💭</span>
                        <p>No users online</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.cid}
                            className={`chatlist-item ${activeChat?.cid === session.cid ? "active" : ""}`}
                            onClick={() => handleUserClick(session)}
                        >
                            <div className="chatlist-item-header">
                                <div className="chatlist-user">
                                    <div className="user-avatar">
                                        <span className="avatar-placeholder">
                                            {session.userName?.charAt(0)?.toUpperCase() || "U"}
                                        </span>
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">
                                            {session.userName}
                                            <span className="user-id">#{session.userId}</span>
                                        </div>
                                        <div className="user-status">
                                            <span className="status-dot" style={{ background: getStatusColor(session) }} />
                                            {session.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="chatlist-meta">
                                    <div className="message-count">💬 {session.messages.length}</div>
                                    <div className="session-time">{formatTime(session.lastActivity)}</div>
                                </div>
                            </div>
                            {session.lastMessage && (
                                <div className="chatlist-preview">
                                    {session.lastMessage.slice(0, 40)}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
