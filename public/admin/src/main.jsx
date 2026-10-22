// main.jsx - Minimal entry point
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import './styles/admin.css';

// Mount React app
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <HelmetProvider>
            <AppRouter />
        </HelmetProvider>
    </React.StrictMode>
);