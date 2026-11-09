// /src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { GProvider } from "./GContext";
import { ThemeProvider } from "./ThemeContext";

import App from "./App";
import ErrorBoundary from "./ErrorBoundary";

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <BrowserRouter>
        <ErrorBoundary>
            <GProvider>
                <HelmetProvider>
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </HelmetProvider>
            </GProvider>
        </ErrorBoundary>
        </BrowserRouter>
    </React.StrictMode>
);