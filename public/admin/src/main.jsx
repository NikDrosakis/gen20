
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import './styles/admin.css';
import { GProvider } from './contexts/GContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GProvider>
            <HelmetProvider>
                <AppRouter />
            </HelmetProvider>
        </GProvider>
    </React.StrictMode>
);
