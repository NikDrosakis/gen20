import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { GProvider } from './contexts/GContext';
import { ThemeProvider } from "./contexts/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
        <ThemeProvider>
        <GProvider>
            <App />
        </GProvider>
        </ThemeProvider>
    </BrowserRouter>
);
