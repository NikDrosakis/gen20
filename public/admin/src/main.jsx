
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import './admin.css';
import { GProvider } from './GContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GProvider>
            <HelmetProvider>
                <AppRouter />
            </HelmetProvider>
        </GProvider>
    </React.StrictMode>
);
