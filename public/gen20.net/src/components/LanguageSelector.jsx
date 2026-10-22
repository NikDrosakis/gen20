import React, {useState} from "react";
import Cookies from 'js-cookie';
const LanguageSelector = ({ currentLang }) => {
    const languages = [
        { code: "el", label: "Ελληνικά" },
        { code: "it", label: "Italiano" },
        { code: "es", label: "Español" },
        { code: "en", label: "English" },
    ];

    const handleChangeLanguage = (e) => {
       console.log(e.target)
        const langCode = e.target.value;
       Cookies.set('lang', langCode,  { path: '/', expires: 365 }); // optional: secure, sameSite
    };

    return (
        <select className="bare" value={currentLang} onChange={handleChangeLanguage} style={{
            color:"white",
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
