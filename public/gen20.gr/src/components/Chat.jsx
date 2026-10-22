// src/components/Chat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import Cookies from 'js-cookie';
import './Chat.css';

const Chat = ({
                  activeChat,
                  onCloseChat,
                  systemPrompt = 'You are a helpful assistant for the GEN20 platform.'
              }) => {
    const { isConnected, isConnecting, chat, messages, onMessage, send } = useWebSocket();
    const [input, setInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [chatType, setChatType] = useState('ai');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const [user, setUser] = useState({
        name: 'Guest',
        role: 'user',
        uid: null,
        img: null,
        grp: null
    });

    useEffect(() => {
        const name = Cookies.get('GENNAME') || 'Guest';
        const role = Cookies.get('GENROLE') || 'user';
        const uid = Cookies.get('GENUID') || null;
        const img = Cookies.get('GENIMG') || null;
        const grp = Cookies.get('grp') || null;
        setUser({ name, role, uid, img, grp });
    }, []);

    // Determine chat type
    useEffect(() => {
        setChatType(activeChat ? 'peer' : 'ai');
        if (activeChat) {
            setChatMessages([]);
        }
    }, [activeChat]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [activeChat]);

    // Listen for peer messages
    useEffect(() => {
        if (!onMessage || !activeChat) return;

        const unsubPeer = onMessage('peer_message', (data) => {
            if (data.from === activeChat.userId) {
                setChatMessages(prev => [...prev, {
                    id: Date.now(),
                    content: data.content,
                    sender: 'other',
                    timestamp: Date.now()
                }]);
            }
        });

        return () => {
            if (unsubPeer) unsubPeer();
        };
    }, [onMessage, activeChat]);

    // Listen for AI streaming
    useEffect(() => {
        if (!onMessage) return;

        const unsubChunk = onMessage('chunk', (data) => {
            if (chatType === 'ai') {
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
            }
        });

        const unsubDone = onMessage('done', () => {
            setIsStreaming(false);
            if (chatType === 'ai') {
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
            }
        });

        return () => {
            if (unsubChunk) unsubChunk();
            if (unsubDone) unsubDone();
        };
    }, [onMessage, chatType]);

    const handleSend = () => {
        if (!input.trim() || !isConnected) return;

        if (chatType === 'ai') {
            setChatMessages(prev => [...prev, {
                id: Date.now(),
                content: input,
                role: 'user',
                timestamp: Date.now(),
                user: { name: user.name, img: user.img }
            }]);

            chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: input }
            ], {
                stream: true,
                temperature: 0.7,
                user_id: user.uid,
                user_name: user.name
            });

            setInput('');
            setIsStreaming(true);
        } else if (chatType === 'peer' && activeChat) {
            setChatMessages(prev => [...prev, {
                id: Date.now(),
                content: input,
                sender: 'me',
                timestamp: Date.now()
            }]);

            send('peer', {
                to: activeChat.userId,
                content: input
            });

            setInput('');
        }

        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearAIChat = () => {
        setChatMessages([]);
    };

    const statusText = isConnected ? 'Online' : isConnecting ? 'Connecting...' : 'Offline';
    const statusClass = isConnected ? 'online' : isConnecting ? 'connecting' : 'offline';

    const getChatTitle = () => {
        if (chatType === 'peer' && activeChat) {
            return activeChat.userName || 'User';
        }
        return 'AI Assistant';
    };

    const getChatSubtitle = () => {
        if (chatType === 'peer' && activeChat) {
            return activeChat.status === 'active' ? '🟢 Online' : '🔴 Offline';
        }
        return '🤖 Powered by Deepseek';
    };

    const displayMessages = chatType === 'peer' ? chatMessages : chatMessages;

    return (
        <div className={`chat-container ${!activeChat && chatType === 'ai' ? 'chat-ai' : 'chat-open'}`}>
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-avatar">
                        <span>{getChatTitle().charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="chat-header-info">
                        <h3 className="chat-title">
                            {getChatTitle()}
                            {chatType === 'peer' && activeChat?.userId && (
                                <span className="user-id">#{activeChat.userId}</span>
                            )}
                        </h3>
                        <p>
                            <span className={`status-dot ${statusClass}`}></span>
                            {getChatSubtitle()}
                        </p>
                    </div>
                </div>
                <div className="chat-header-right">
                    {chatType === 'peer' && activeChat && (
                        <button className="chat-close-btn" onClick={onCloseChat} title="Close chat">
                            ×
                        </button>
                    )}
                    {chatType === 'ai' && (
                        <button className="chat-clear-btn" onClick={clearAIChat} title="Clear chat">
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {displayMessages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            {chatType === 'peer' ? '💬' : '🤖'}
                        </div>
                        <div className="empty-title">
                            {chatType === 'peer'
                                ? `Chat with ${getChatTitle()}`
                                : 'Start a conversation with AI'}
                        </div>
                        <div className="empty-sub">
                            {chatType === 'peer'
                                ? 'Send a message to start chatting'
                                : 'Ask me anything about GEN20'}
                        </div>
                    </div>
                ) : (
                    displayMessages.map((msg, idx) => {
                        const isUser = chatType === 'peer'
                            ? msg.sender === 'me'
                            : msg.role === 'user';
                        return (
                            <div key={idx} className={`message ${isUser ? 'sent' : 'received'}`}>
                                <div className="message-bubble">{msg.content}</div>
                                {msg.timestamp && (
                                    <div className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                {isStreaming && chatType === 'ai' && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
                <div className="chat-input-wrapper">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={
                            !isConnected ? "Connecting..." :
                                chatType === 'peer'
                                    ? `Message ${getChatTitle()}...`
                                    : "Ask AI anything..."
                        }
                        disabled={!isConnected || (chatType === 'peer' && !activeChat)}
                        rows={1}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!isConnected || !input.trim() || (chatType === 'peer' && !activeChat)}
                    >
                        ➤
                    </button>
                </div>
                {!isConnected && (
                    <div className="reconnecting-message">⚡ Reconnecting...</div>
                )}
                {chatType === 'peer' && activeChat && (
                    <div className="chat-mode-indicator peer-mode">
                        💬 Peer chat with {activeChat.userName}
                    </div>
                )}
                {chatType === 'ai' && (
                    <div className="chat-mode-indicator ai-mode">
                        🤖 AI Assistant
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;