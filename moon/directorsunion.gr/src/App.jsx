// App.js
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { ThemeProvider } from "./ThemeContext";
import ErrorBoundary from "./ErrorBoundary";
import Contact from './Contact';
import FootMenu from './FootMenu';
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
