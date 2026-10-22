import React, {useMemo, useEffect, useState} from 'react';
import { Link } from "react-router-dom";
import LanguageSelector from "../modules/LanguageSelector";
import ThemeToggle from "../modules/ThemeToggle";
import { useG } from '../contexts/GContext';
import Whatsapp from "../components/Whatsapp";
import Gen from '../contexts/Gen';
const Menu = () => {
    const { G } = useG();
    const path = window.location.pathname.split('/')[1] || 'home';
    const [lang, setLang] = useState(Gen.coo("LANG") || "el");
    const [menuOpen, setMenuOpen] = useState(false);
    const handleLangChange = (newLang) => {
        localStorage.setItem("lang", newLang); // αυτό ήδη το κάνει το LanguageSelector αλλά εδώ για σιγουριά
        setLang(newLang);
        document.body.style.opacity = 0;
        setTimeout(() => window.location.reload(), 300);
    };

    const handleLogout = async () => {
        const baseURL = import.meta.env.VITE_HTTP_API;
        const username = 'nikos';
        const password = '130177';
        try {
            const res = await fetch(`${baseURL}local/logout`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            const json = await res.json();

            if (json.success) {
                window.location.href = '/';
            } else {
                alert('Logout failed: ' + (json.data?.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Logout error: ' + e.message);
        }
    };

    console.log("Cookie LANG =", Gen.coo("LANG"));
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
    const loggedIn = Boolean(Gen.coo('uid'));
    console.log('loggedIn',loggedIn)
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
                        {menuItems.map(({ key, label, path: linkPath }) => (
                            <li key={key} className={path === key ? 'active' : ''}>
                                {loggedIn && key === 'login' ? (
                                    <button className="bare" onClick={handleLogout}>Logout</button>
                                ) : (
                                    <Link to={linkPath}>{label}</Link>
                                )}
                            </li>
                        ))}

                        <li><Whatsapp/></li>
                        <li><LanguageSelector currentLang={lang} onChange={handleLangChange}/></li>
                        <li><ThemeToggle /></li>

                    </ul>
                </nav>
            </div>
        </div>
    );

}

export default Menu;