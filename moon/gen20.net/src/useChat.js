// src/hooks/useChat.js
import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

export const useChat = (options = {}) => {
    const {
        chat,
        messages = [],  // ← Default empty array
        isConnected,
        onMessage,
        clearMessages
    } = useWebSocket();

    const [chatMessages, setChatMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentStreamId, setCurrentStreamId] = useState(null);

    // Listen for streaming messages
    useEffect(() => {
        if (!onMessage) return;  // ← Safe check

        const unsubChunk = onMessage('chunk', (data) => {
            if (data.id === currentStreamId || !currentStreamId) {
                setIsStreaming(true);
                setChatMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.isStreaming && last.id === data.id) {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                            ...last,
                            content: last.content + data.content
                        };
                        return updated;
                    } else {
                        return [...prev, {
                            id: data.id || Date.now(),
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
            setCurrentStreamId(null);
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

        const unsubResponse = onMessage('response', (data) => {
            setChatMessages(prev => [...prev, {
                id: Date.now(),
                content: data.content,
                role: 'assistant',
                usage: data.usage,
                timestamp: Date.now()
            }]);
        });

        return () => {
            if (unsubChunk) unsubChunk();
            if (unsubDone) unsubDone();
            if (unsubResponse) unsubResponse();
        };
    }, [onMessage, currentStreamId]);

    const sendMessage = useCallback((text, systemPrompt = null) => {
        if (!text.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            content: text,
            role: 'user',
            timestamp: Date.now()
        };
        setChatMessages(prev => [...prev, userMessage]);

        // Prepare messages
        const msgList = [];
        if (systemPrompt) {
            msgList.push({ role: 'system', content: systemPrompt });
        }
        msgList.push({ role: 'user', content: text });

        // Send via WebSocket
        const streamId = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        setCurrentStreamId(streamId);

        if (chat) {
            chat(msgList, {
                stream: options.stream !== false,
                model: options.model || 'deepseek-chat',
                temperature: options.temperature || 0.7
            });
        }
    }, [chat, options]);

    return {
        messages: chatMessages,
        isStreaming,
        isConnected,
        sendMessage,
        clearMessages: () => {
            setChatMessages([]);
            if (clearMessages) clearMessages();
        }
    };
};