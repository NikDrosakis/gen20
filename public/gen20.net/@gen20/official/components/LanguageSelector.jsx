import React, {useState} from "react";

const LanguageSelector = ({ currentLang, onChange }) => {
    const [lang, setLang] = useState(localStorage.getItem("lang") || "el");
    const languages = [
        { code: "el", label: "Ελληνικά" },
        { code: "it", label: "Italiano" },
        { code: "es", label: "Español" },
        { code: "en", label: "English" },
    ];

    const handleChange = (e) => {
        const langCode = e.target.value;
        localStorage.setItem("lang", langCode);
        onChange(langCode); // ενημερώνει το state στο App.jsx
    };


    return (
        <select className="bare" value={currentLang} onChange={handleChange} style={{
            color:"white",
            padding: "6px 15px",
            marginLeft:14,
            background: "black"
        }}>
            {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                    {lang.label}
                </option>
            ))}
        </select>
    );
};

export default LanguageSelector;
