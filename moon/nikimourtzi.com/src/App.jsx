// /App.jsx
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider } from "./ThemeContext";
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