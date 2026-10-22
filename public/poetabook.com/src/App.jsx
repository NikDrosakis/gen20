import React from 'react';
import './App.css';
import { Outlet } from "react-router-dom";
import Skeleton from "./contexts/Skeleton";
import Navigation from "./components/Navigation";
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
    console.log('App rendering with ThemeProvider');  // ← Debug

    return (
        <Skeleton>
            <ThemeProvider>
                <div className="app-container">
                    <Navigation/>
                    <main>
                        <Outlet />
                    </main>
                </div>
            </ThemeProvider>
        </Skeleton>
    );
}

export default App;