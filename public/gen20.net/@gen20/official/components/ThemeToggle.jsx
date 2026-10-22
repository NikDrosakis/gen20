import React, { useEffect, useState } from "react";

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    // 1. Detect system preference on mount
    useEffect(() => {
        const systemPrefersDark = window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        setIsDark(systemPrefersDark);
    }, []);

    // 2. Apply class + dispatch event
    useEffect(() => {
        const root = document.documentElement;

        if (isDark) {
            root.classList.add("dark");
            root.classList.remove("light");
        } else {
            root.classList.remove("dark");
            root.classList.add("light");
        }

        // 3. Dispatch custom event
        window.dispatchEvent(new CustomEvent("themeChange", {
            detail: isDark ? "dark" : "light",
        }));
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="bare px-4 py-2 rounded-lg bg-gray-800 text-white dark:bg-white dark:text-black transition"
        >
            {isDark ? "Light" : "Dark"}
        </button>
    );
};

export default ThemeToggle;
