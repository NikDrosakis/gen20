// /App.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider } from "./ThemeContext";
import "./App.css";
export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <Navbar />
                <Outlet />
            </ThemeProvider>
        </ErrorBoundary>
    );
}