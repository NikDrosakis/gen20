// App.js
import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Contact from './pages/Contact';
import FootMenu from './components/layout/FootMenu';
import './App.css';
export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <Header />
                <Outlet />
                <FootMenu/>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
