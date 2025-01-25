// AppContext.js
import React, { createContext, useState, useEffect } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const loadDarkMode = () => {
            try {
                const value = localStorage.getItem('display');
                if (value !== null) {
                    setDarkMode(value === 'dark');
                } else {
                    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setDarkMode(prefersDarkScheme);
                }
            } catch (e) {
                console.error('Failed to load dark mode state', e);
            }
        };
        loadDarkMode();
    }, []);

    const toggleDarkMode = () => {
        try {
            const newValue = !darkMode;
            setDarkMode(newValue);
            localStorage.setItem('display', newValue ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save dark mode state', e);
        }
    };

    return (
        <AppContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };

