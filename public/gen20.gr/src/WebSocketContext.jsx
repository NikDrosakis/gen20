// src/contexts/WebSocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const WebSocketContext = createContext(null);

const getWebSocketUrl = () => {
    if (import.meta.env.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL;
    }
    if (import.meta.env.PROD) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        return `${protocol}//${host}/ermis/v1/ws`;
    }
    return 'ws://localhost:3010/ws';
};

const WS_URL = getWebSocketUrl();
console.log('🔌 WebSocket URL:', WS_URL);

export const WebSocketProvider = ({ children, autoConnect = true }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const wsRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectTimeoutRef = useRef(null);
    // Message handlers map
    const messageHandlers = useRef(new Map());

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;
            ws.binaryType = 'arraybuffer';

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
                setIsConnecting(false);
                reconnectAttempts.current = 0;
                setError(null);
            };

            ws.onmessage = (event) => {
                try {
                    let data;
                    if (event.data instanceof ArrayBuffer) {
                        const text = new TextDecoder().decode(event.data);
                        let cleanText = text;
                        if (text.charCodeAt(0) === 0x4A) {
                            const len = (text.charCodeAt(1) << 24) |
                                (text.charCodeAt(2) << 16) |
                                (text.charCodeAt(3) << 8) |
                                text.charCodeAt(4);
                            cleanText = text.substring(5, 5 + len);
                        }
                        data = JSON.parse(cleanText);
                    } else if (typeof event.data === 'string') {
                        data = JSON.parse(event.data);
                    } else {
                        console.warn('Unknown data type:', typeof event.data);
                        return;
                    }

                    console.log('📨 Received:', data);
                    setMessages(prev => [...prev, data]);

                    // Trigger custom handlers
                    const handlers = messageHandlers.current.get(data.type) || [];
                    handlers.forEach(handler => {
                        try {
                            handler(data);
                        } catch (error) {
                            console.error('❌ Handler error:', error);
                        }
                    });

                    if (data.type === 'error') {
                        setError(data.message);
                    }
                } catch (error) {
                    console.error('❌ Failed to parse:', error);
                }
            };

            ws.onclose = (event) => {
                console.log(`🔴 WebSocket disconnected (code: ${event.code})`);
                setIsConnected(false);
                setIsConnecting(false);
                if (autoConnect && reconnectAttempts.current < maxReconnectAttempts) {
                    attemptReconnect();
                }
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setError(error);
            };

        } catch (error) {
            console.error('❌ Failed to create WebSocket:', error);
            setError(error);
            setIsConnecting(false);
            if (autoConnect) {
                attemptReconnect();
            }
        }
    }, [autoConnect]);

    const attemptReconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
    }, [connect]);

    const send = useCallback((type, payload = {}) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type, ...payload, timestamp: Date.now() });
            wsRef.current.send(message);
            return true;
        }
        console.warn('⚠️ WebSocket not connected');
        return false;
    }, []);

    const chat = useCallback((messages, options = {}) => {
        return send('chat', {
            messages,
            model: options.model || 'deepseek-chat',
            stream: options.stream !== false,
            temperature: options.temperature || 0.7
        });
    }, [send]);

    // ΣΩΣΤΗ onMessage - επιστρέφει function για unsubscription
    const onMessage = useCallback((type, handler) => {
        if (!messageHandlers.current.has(type)) {
            messageHandlers.current.set(type, []);
        }
        messageHandlers.current.get(type).push(handler);

        // Επιστρέφει function για να κάνεις unsubscribe
        return () => {
            const handlers = messageHandlers.current.get(type);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index !== -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }, []);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close(1000, 'Manual disconnect');
            wsRef.current = null;
        }
        setIsConnected(false);
        setIsConnecting(false);
    }, []);

    const clearMessages = useCallback(() => setMessages([]), []);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => disconnect();
    }, [autoConnect]);

    const value = {
        isConnected,
        isConnecting,
        error,
        messages,
        send,
        chat,
        onMessage,
        disconnect,
        connect,
        clearMessages,
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        console.error('❌ useWebSocket used outside WebSocketProvider');
        return {
            isConnected: false,
            isConnecting: false,
            error: null,
            messages: [],
            send: () => false,
            chat: () => false,
            onMessage: () => () => {}, // Επιστρέφει empty function
            disconnect: () => {},
            connect: () => {},
            clearMessages: () => {},
        };
    }
    return context;
};