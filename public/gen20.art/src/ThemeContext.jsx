import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");

    // Load από localStorage/system
    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored) {
            setTheme(stored);
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setTheme(prefersDark ? "dark" : "light");
        }
    }, []);

    // ✅ Εφαρμογή theme στο <body> (class), ΟΧΙ στο <html> (attribute)
    useEffect(() => {
        if (!theme) return;

        const body = document.body;

        // Αφαίρεσε προηγούμενα classes
        body.classList.remove("light", "dark");

        // Πρόσθεσε το νέο
        body.classList.add(theme);

        // Αποθήκευσε
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () =>
        setTheme(prev => (prev === "dark" ? "light" : "dark"));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);