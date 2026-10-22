// /App.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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