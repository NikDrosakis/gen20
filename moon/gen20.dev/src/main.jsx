// /src/main.jsx
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GProvider } from "./GContext";
import { ThemeProvider } from "./ThemeContext";
import { ManifestProvider } from "./ManifestContext";
import ErrorBoundary from "./ErrorBoundary";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <ErrorBoundary>
                <GProvider>
                    <ManifestProvider>
                        <HelmetProvider>
                            <ThemeProvider>
                                <App />
                            </ThemeProvider>
                        </HelmetProvider>
                    </ManifestProvider>
                </GProvider>
            </ErrorBoundary>
        </BrowserRouter>
    </StrictMode>
);