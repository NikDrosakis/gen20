import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import Cookies from "js-cookie";
const LanguageSelector = ({ currentLang }) => {
    const languages = [
        { code: "el", label: "Ελληνικά" },
        { code: "it", label: "Italiano" },
        { code: "es", label: "Español" },
        { code: "en", label: "English" },
    ];

    const handleChange = (e) => {
        const langCode = e.target.value;
        Cookies.set('lang', langCode); // 1 year
        window.location.reload();
    };

    return (
        <select
            className="bare"
            value={currentLang}
            onChange={handleChange}
            style={{
                padding: "6px 15px",
                marginLeft: 14,
            }}
        >
            {languages.map(({ code, label }) => (
                <option key={code} value={code}>
                    {label}
                </option>
            ))}
        </select>
    );
};

export default LanguageSelector;
