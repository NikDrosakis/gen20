// /main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { GProvider } from './GContext';
import { ManifestProvider } from './ManifestContext';
import App from './App';

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <GProvider>
            <ManifestProvider>
                <HelmetProvider>
                    <App />
                </HelmetProvider>
            </ManifestProvider>
        </GProvider>
    </BrowserRouter>
);
