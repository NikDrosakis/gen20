import { useTheme } from "./ThemeContext";
import Cookies from "js-cookie";
import "./LanguageSelector.css";

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
            className="bare language-select"
            value={currentLang}
            onChange={handleChange}
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
