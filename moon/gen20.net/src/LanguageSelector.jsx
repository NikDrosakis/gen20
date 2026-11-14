import React from "react";
import Cookies from "js-cookie";

const LanguageSelector = ({ currentLang }) => {
    const languages = [
        { code: "el", label: "Ελληνικά" },
        { code: "en", label: "English" },
        { code: "it", label: "Italiano" },
        { code: "es", label: "Español" },
        { code: "ar", label: "العربية" },
    ];

    const handleChange = (event) => {
        Cookies.set("lang", event.target.value, { path: "/", expires: 365 });
        window.location.reload();
    };

    return (
        <select
            className="bare"
            value={currentLang}
            onChange={handleChange}
            aria-label="Select language"
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
