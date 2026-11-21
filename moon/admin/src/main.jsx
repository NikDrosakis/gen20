import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import { GProvider } from './GContext';
import { ManifestProvider } from './ManifestContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GProvider>
            <ManifestProvider>
                <HelmetProvider>
                    <AppRouter />
                </HelmetProvider>
            </ManifestProvider>
        </GProvider>
    </React.StrictMode>
);
