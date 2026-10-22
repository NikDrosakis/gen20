import React, {useMemo, useEffect, useState} from 'react';
import { Link } from "react-router-dom";
import LanguageSelector from "../modules/LanguageSelector";
import ThemeToggle from "../modules/ThemeToggle";
import { useG } from '../contexts/GContext';

const Menu = () => {
    const { G } = useG();
    const path = window.location.pathname.split('/')[1] || 'home';
    const [lang, setLang] = useState(localStorage.getItem("lang") || "el");
    const [menuOpen, setMenuOpen] = useState(false);
    const handleLangChange = (newLang) => {
        localStorage.setItem("lang", newLang); // αυτό ήδη το κάνει το LanguageSelector αλλά εδώ για σιγουριά
        setLang(newLang);
        document.body.style.opacity = 0;
        setTimeout(() => window.location.reload(), 300);
    };
    const menuItems = useMemo(() => {
        if (!G?.menupages) return [];

        return Object.entries(G.menupages)
            .filter(([key, name]) => typeof name === "string" && name.trim() !== "")
            .map(([key, name]) => ({
                key,
                label: name,
                path: `/${key === 'home' ? '' : key}`,
            }));
    }, [G]);
    return (
        <div className="col-lg-10">
            <div className="header__nav__option">
                <button
                    id="mobileMenuToggle"
                    className="mobile-menu-toggle"
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label="Toggle Menu"
                >
                    &#9776;
                </button>
                <nav className={`header__nav__menu ${menuOpen ? 'active' : ''}`}>
                    <ul>
                        {menuItems.map(({key, label, path: linkPath}) => (
                            <li key={key} className={path === key ? 'active' : ''}>
                                <Link to={linkPath}>{label}</Link>
                            </li>
                        ))}
                    </ul>
                    <LanguageSelector currentLang={lang} onChange={handleLangChange}/>
                    <ThemeToggle/>
                </nav>
            </div>
        </div>

    );
}

export default Menu;