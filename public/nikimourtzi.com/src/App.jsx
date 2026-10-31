// /App.jsx
import { Outlet } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/layout/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";
export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <Navigation />
                <Outlet />
                <Footer/>
            </ThemeProvider>
            </ErrorBoundary>
    );
}