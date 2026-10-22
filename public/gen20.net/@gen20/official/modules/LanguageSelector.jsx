import React from "react";
import Gen from "../contexts/Gen";
import { useTheme } from "../contexts/ThemeContext";
const LanguageSelector = ({ currentLang, onChange }) => {
    const { theme } = useTheme();
    const languages = [
        { code: "el", label: "Ελληνικά" },
        { code: "it", label: "Italiano" },
        { code: "es", label: "Español" },
        { code: "en", label: "English" },
    ];

    const handleChange = (e) => {
        const langCode = e.target.value;
        Gen.coo('lang', langCode, 3600);
        onChange(langCode); // ενημερώνει το state στο App.jsx
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
