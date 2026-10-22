import React, { useEffect, useState } from "react";

const ThemeToggle = () => {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored) {
            setTheme(stored);
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setTheme(prefersDark ? "dark" : "light");
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bare px-4 py-2 rounded transition"
        >
            {theme === "dark" ? "🌞" : "🌙"}
        </button>
    );
};

export default ThemeToggle;
