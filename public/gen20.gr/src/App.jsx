import React, { useState } from "react";
import './App.css';
import { Outlet } from "react-router-dom";
import Skeleton from "./contexts/Skeleton";
import Navigation from "./components/Navigation";
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
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