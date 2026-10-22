// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import './Chat.css';

const Chat = () => {
    const { isConnected, chat, messages, send, onMessage } = useWebSocket();
    const [input, setInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Listen for streaming
    useEffect(() => {
        const unsubChunk = onMessage('chunk', (data) => {
            setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.isStreaming) {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...last,
                        content: last.content + data.content
                    };
                    return updated;
                } else {
                    return [...prev, {
                        id: Date.now(),
                        content: data.content,
                        isStreaming: true,
                        role: 'assistant'
                    }];
                }
            });
        });

        const unsubDone = onMessage('done', () => {
            setIsStreaming(false);
            setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.isStreaming) {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...last,
                        isStreaming: false,
                        done: true
                    };
                    return updated;
                }
                return prev;
            });
        });

        return () => {
            unsubChunk();
            unsubDone();
        };
    }, [onMessage]);

    const handleSend = () => {
        if (!input.trim() || !isConnected) return;

        // Add user message
        setChatMessages(prev => [...prev, {
            id: Date.now(),
            content: input,
            role: 'user',
            timestamp: Date.now()
        }]);

        // Send via WebSocket
        chat([
            { role: 'system', content: 'You are a helpful assistant for the GEN20 platform.' },
            { role: 'user', content: input }
        ]);

        setInput('');
        setIsStreaming(true);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const statusDotClass = isConnected ? 'online' : isConnecting ? 'connecting' : 'offline';

    return (
        <div className="chat-container">
            <div className="chat-status">
                <div>
                    <span className={`status-dot ${statusDotClass}`}></span>
                    Status: {isConnected ? 'Online' : isConnecting ? 'Connecting...' : 'Offline'}
                </div>
                <span className="clients">👥 {messages?.length || 0} messages</span>
            </div>

            <div className="chat-messages">
                {chatMessages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <div className="empty-title">Start a conversation</div>
                        <div className="empty-sub">Send a message to begin chatting with AI</div>
                    </div>
                ) : (
                    chatMessages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role}`}>
                            <div className="message-role">{msg.role}</div>
                            <div className="message-content">
                                {msg.content}
                                {msg.isStreaming && <span className="cursor"></span>}
                            </div>
                        </div>
                    ))
                )}
                {isStreaming && (
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={!isConnected}
                />
                <button onClick={handleSend} disabled={!isConnected || !input.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;