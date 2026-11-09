// src/contexts/ChatContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const [activeChat, setActiveChat] = useState(null); // { userId, userName, userImg, sessionId }
    const [chatMessages, setChatMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(true);

    const openChat = useCallback((user) => {
        setActiveChat(user);
        setChatMessages([]);
        setIsChatOpen(true);
    }, []);

    const closeChat = useCallback(() => {
        setActiveChat(null);
        setChatMessages([]);
        setIsChatOpen(false);
    }, []);

    const addMessage = useCallback((message) => {
        setChatMessages(prev => [...prev, message]);
    }, []);

    const clearMessages = useCallback(() => {
        setChatMessages([]);
    }, []);

    const value = {
        activeChat,
        chatMessages,
        isChatOpen,
        openChat,
        closeChat,
        addMessage,
        clearMessages,
        setChatMessages,
        setIsChatOpen
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};