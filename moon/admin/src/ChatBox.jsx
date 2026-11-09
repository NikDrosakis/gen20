// src/ChatBox.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMessaging } from './MessagingContext';
import './Chat.css';

const CHAT = "chat";

export default function ChatBox({
    cid,
    meUid,
    peerUid,
    peerName = "Peer",
}) {
    const { connection, messages, send, userID } = useMessaging();

    const [text, setText] = useState("");
    const [localMsgs, setLocalMsgs] = useState([]);
    const bottomRef = useRef(null);

    const myUid = meUid ?? userID;

    // --- helpers ---
    const sendInsert = (body) => {
        if (!cid || !body) return false;
        return send({
            type: "insert",
            system: CHAT,
            c: body,
            to: peerUid,
            cid,
        });
    };

    const sendGet = () => {
        if (!cid || !peerUid) return false;
        return send({
            type: "get",
            system: CHAT,
            to: peerUid,
            cid,
        });
    };

    const getWsMsgs = () => {
        if (!cid || !Array.isArray(messages)) return [];

        return messages.filter((m) =>
            m.system === CHAT &&
            ["insert", "message"].includes(m.type) &&
            m.cid === cid
        );
    };
    const getHistory = () => {
        if (!cid || !Array.isArray(messages)) return [];

        const res = messages.filter(
            (m) => m.system === CHAT && m.type === "res" && m.cid === cid
        );

        if (!res.length) return [];

        try {
            const raw = res[res.length - 1].c
                || res[res.length - 1].verba
                || "[]";

            const parsed = typeof raw === "string"
                ? JSON.parse(raw)
                : raw;

            if (Array.isArray(parsed)) return parsed;

            // Υποστήριξη και envelope response
            if (Array.isArray(parsed?.messages)) return parsed.messages;
            if (Array.isArray(parsed?.rows)) return parsed.rows;

            console.error("[ChatBox] Invalid history response:", parsed);
            return [];
        } catch (err) {
            console.error("[ChatBox] History parse error:", err);
            return [];
        }
    };

    // 1. Ζήτα ιστορικό
    useEffect(() => {
        if (!cid || !peerUid) return;
        if (connection !== "open") return;
        sendGet();
    }, [cid, peerUid, connection]);

    // 2. WS + history
    const wsMsgs = getWsMsgs();
    const history = getHistory();

    // 3. Merge
    const msgs = useMemo(() => {
        const safeHistory = Array.isArray(history) ? history : [];
        const safeWsMsgs = Array.isArray(wsMsgs) ? wsMsgs : [];
        const safeLocalMsgs = Array.isArray(localMsgs) ? localMsgs : [];

        const all = [
            ...safeHistory,
            ...safeWsMsgs,
            ...safeLocalMsgs
        ];

        const seen = new Set();
        const out = [];

        for (const m of all) {
            if (!m?._id || seen.has(m._id)) continue;
            seen.add(m._id);
            out.push(m);
        }

        return out.sort(
            (a, b) =>
                (a.modified ?? a.t ?? 0) -
                (b.modified ?? b.t ?? 0)
        );
    }, [history, wsMsgs, localMsgs]);
    // 4. Καθάρισε localMsgs όταν έρθει από WS
    useEffect(() => {
        if (wsMsgs.length === 0) return;
        setLocalMsgs((prev) =>
            prev.filter((local) => {
                const exists = wsMsgs.some(
                    (m) =>
                        m.c === local.c &&
                        Math.abs((m.modified ?? m.t ?? 0) - (local.modified ?? local.t ?? 0)) < 10
                );
                return !exists;
            })
        );
    }, [wsMsgs]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs.length]);

    function send_() {
        const body = text.trim();
        if (!body) return;
        if (connection !== "open") return;

        const optimistic = {
            _id: `local:${Date.now()}`,
            type: "insert",
            system: CHAT,
            c: body,
            uid: myUid,
            to: peerUid,
            cid,
            modified: Math.floor(Date.now() / 1000),
        };
        setLocalMsgs((prev) => [...prev, optimistic]);

        sendInsert(body);
        setText("");
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-avatar">{peerName[0]?.toUpperCase()}</div>
                    <div className="chat-header-info">
                        <h3>{peerName}</h3>
                        <p>
                            <span className={`status-dot ${connection === "open" ? "online" : "offline"}`} />
                            {connection === "open" ? "online" : connection}
                            {cid && ` · ${cid.slice(0, 8)}`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="chat-messages">
                {msgs.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <div className="empty-title">No messages yet</div>
                        <div className="empty-sub">Say hi to start the conversation</div>
                    </div>
                )}
                {msgs.map((m) => {
                    const mine = m.uid === myUid;
                    const isLocal = m._id?.startsWith("local:");
                    return (
                        <div
                            key={m._id}
                            className={`message ${mine ? "user" : "assistant"} ${isLocal ? "local" : ""}`}
                        >
                            {!mine && <div className="message-role">{m.uid}</div>}
                            <div
                                className="message-content"
                                dangerouslySetInnerHTML={{ __html: m.c ?? m.verba }}
                            />
                            <div className="message-time">
                                {new Date((m.modified ?? m.t ?? 0) * 1000).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                                {isLocal && " · sending"}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="chat-input-area">
                <div className="chat-input-wrapper">
                    <textarea
                        rows={1}
                        value={text}
                        placeholder={connection === "open" ? "Type a message…" : "Connecting…"}
                        disabled={connection !== "open"}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send_();
                            }
                        }}
                    />
                    <div className="chat-input-actions">
                        <button
                            className="send-btn"
                            onClick={send_}
                            disabled={!text.trim() || connection !== "open"}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
