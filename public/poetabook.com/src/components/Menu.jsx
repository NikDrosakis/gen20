import React, {useMemo, useEffect, useState} from 'react';
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import LanguageSelector from "../modules/LanguageSelector";
import ThemeToggle from "../modules/ThemeToggle";
import { useG } from '../contexts/GContext';
import Whatsapp from "../components/Whatsapp";

const Menu = ({ lang }) => {
    const { G } = useG();
    const path = window.location.pathname.split('/')[1] || 'home';
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeKey, setActiveKey] = useState(path); // αρχικά το path από router ή default

    const handleClick = (key) => {
        setActiveKey(key);
    };
    const handleLogout = async () => {
        const baseURL = process.env.REACT_APP_HTTP_API;
        const username = 'nikos';
        const password = '130177';
        try {
            const res = await fetch(`${baseURL}local/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });
            const json = await res.json();

            if (json.success) {
                Cookies.del('GENUID');
                Cookies.del('GENIMG');
                Cookies.del('GENNAME');
                window.location.href = '/';
            } else {
                alert('Logout failed: ' + (json.data?.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Logout error: ' + e.message);
        }
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
    const userid = Cookies.get('GENUID');
    const myimg = Cookies.get('GENIMG') ||  '';
    const myname = Cookies.get('GENNAME') ||  '';
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
                            <li key={key} className={activeKey === key ? 'active' : ''}>
                                {userid && key === 'login' ? (
                                    <button className="bare" onClick={handleLogout}>Logout</button>
                                ) : (
                                    <Link to={linkPath} onClick={() => handleClick(key)}>{label}</Link>
                                )}
                            </li>
                        ))}

                        <li><Whatsapp/></li>
                        {userid && (
                        <li>
                            <a href={`/profile?name=${myname}`}>
                                <img className="navicon" src={`${window.location}media/${myimg}`}/>
                            </a>
                        </li>
                        )}
                        <li><LanguageSelector currentLang={lang}/></li>
                        <li><ThemeToggle/></li>

                    </ul>
                </nav>
            </div>
        </div>
    );

}

export default Menu;