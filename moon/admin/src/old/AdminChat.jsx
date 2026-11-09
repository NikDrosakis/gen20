// src/AdminChat.jsx
// Wrapper για ChatBox — χρησιμοποιεί MessagingContext (god), όχι ermis

import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatBox from './ChatBox';

export default function AdminChat({ meUid }) {
    const [activeChat, setActiveChat] = useState(null);

    const handleOpenChat = (session) => {
        setActiveChat(session);
    };

    return (
        <div className="admin-chat">
            <ChatList
                onOpenChat={handleOpenChat}
                activeChat={activeChat}
                meUid={meUid}
            />
            {activeChat && (
                <ChatBox
                    cid={activeChat.cid}
                    meUid={meUid}
                    peerUid={activeChat.userId}
                    peerName={activeChat.userName}
                />
            )}
        </div>
    );
}
