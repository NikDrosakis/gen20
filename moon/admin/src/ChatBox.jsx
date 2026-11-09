// src/ChatBox.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMessaging } from './MessagingContext';
import { seedConversation } from './fakeMessages';
import './Chat.css';

export default function ChatBox({
                                    cid,
                                    meUid,
                                    peerUid,
                                    peerName = "Peer",
                                }) {
    const { sendChat, getChatMessages } = useMessaging();
    const [text, setText] = useState("");
    const [fakeMsgs, setFakeMsgs] = useState([]);
    const bottomRef = useRef(null);

    const myUid = meUid ?? "1";

    // Seed fake μηνύματα μία φορά ανά cid
    useEffect(() => {
        if (!cid) return;
        setFakeMsgs(seedConversation({ cid, meUid: myUid, peerUid, n: 6 }));
    }, [cid, myUid, peerUid]);

    // Real από WS
    const wsMsgs = getChatMessages(cid);

    // Merge: real + fake, dedupe by _id
    const msgs = useMemo(() => {
        if (wsMsgs.length === 0) return fakeMsgs;
        const seen = new Set(wsMsgs.map(m => m._id));
        const onlyFake = fakeMsgs.filter(m => !seen.has(m._id));
        return [...onlyFake, ...wsMsgs].sort((a, b) => a.t - b.t);
    }, [wsMsgs, fakeMsgs]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs.length]);

    function send() {
        const body = text.trim();
        if (!body) return;

        if (typeof sendChat === "function") {
            sendChat(peerUid, body, cid);
        }

        setFakeMsgs(prev => [
            ...prev,
            {
                _id: `local:${Date.now()}`,
                type: "message",
                uid: myUid,
                c: body,
                t: Math.floor(Date.now() / 1000),
                to: peerUid,
                cid,
                system: "chat",
                cast: "one",
                domaffect: "*",
            },
        ]);

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
                            <span className="status-dot online" />
                            {cid?.slice(0, 8)}
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
                    return (
                        <div key={m._id} className={`message ${mine ? "user" : "assistant"}`}>
                            {!mine && <div className="message-role">{m.uid}</div>}
                            <div className="message-content">{m.c ?? m.verba}</div>
                            <div className="message-time">
                                {new Date((m.t ?? 0) * 1000).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
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
              placeholder="Type a message…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                  }
              }}
          />
                    <div className="chat-input-actions">
                        <button className="send-btn" onClick={send} disabled={!text.trim()}>
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}