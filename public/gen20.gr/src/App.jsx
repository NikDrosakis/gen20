import React, { useState } from "react";
import './App.css';
import { Outlet } from "react-router-dom";
import Skeleton from "./Skeleton";
import Navigation from "./Navigation";
import { ThemeProvider } from './ThemeContext';
import { WebSocketProvider } from './WebSocketContext';
import ChatList from './ChatList';
import Chat from './Chat';
function App() {
    const [activeChat, setActiveChat] = useState(null);
    console.log('App rendering with ThemeProvider');  // ← Debug
    const handleOpenChat = (user) => {
        setActiveChat(user);
    };

    const handleCloseChat = () => {
        setActiveChat(null);
    };
    return (
        <Skeleton>
            <ThemeProvider>
                <WebSocketProvider autoConnect={true}>
                    <div className="app-container">
                        <Navigation/>
                        <main>
                            <Outlet/>
                        </main>
                        <div className="chat-wrapper">
                            <ChatList onOpenChat={handleOpenChat} activeChat={activeChat}/>
                            <Chat
                                activeChat={activeChat}
                                onCloseChat={handleCloseChat}
                            />
                        </div>
                    </div>
                </WebSocketProvider>
            </ThemeProvider>
        </Skeleton>
    );
}

export default App;