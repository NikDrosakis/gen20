// App.js
import { Outlet } from 'react-router-dom';
import Skeleton from './contexts/Skeleton';
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Contact from './pages/Contact';
import './App.css';
export default function App() {
    return (
        <ErrorBoundary>
        <Skeleton>
            <ThemeProvider>
                <Outlet />
               </ThemeProvider>
        </Skeleton>
        </ErrorBoundary>
    );
}
