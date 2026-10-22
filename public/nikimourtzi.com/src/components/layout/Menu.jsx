// components/Menu.jsx
import React, { useMemo, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import LanguageSelector from "../modules/LanguageSelector";
import ThemeToggle from "../modules/ThemeToggle";
import Whatsapp from "../components/Whatsapp";

// ✅ No static menu items - all from database
const Menu = ({ lang }) => {
    const path = window.location.pathname.split('/')[1] || 'home';
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeKey, setActiveKey] = useState(path);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const userid = Cookies.get('GENUID');
    const myimg = Cookies.get('GENIMG');
    const myname = Cookies.get('GENNAME');
    const myrole = Cookies.get('GENROLE');

    // Check if user is admin (FIXED: role can be 'admin' or '1')
    const isAdmin = (myrole === 'admin' || myrole === '1') && !!userid;

    // ✅ Fetch ALL menu items from database (pages with status=1)
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(`/api/v1/maria/fa?q=select name, type, title, title_el from ${publicdb}.content where type="page" order by sort asc`);
                const data = await response.json();

                if (data.success && data.data) {
                    const items = data.data.map(page => ({
                        key: page.name,
                        label_en: page.title || page.name,
                        label_el: page.title_el || page.name,
                        path: `/${page.name}`,
                        type: page.type
                    }));
                    setMenuItems(items);
                }
            } catch (error) {
                console.error('Error fetching menu items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, [publicdb]);

    useEffect(() => {
        const handleScroll = () => {
            if (menuOpen) {
                setMenuOpen(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [menuOpen]);

    const handleClick = (key) => {
        setActiveKey(key);
        // Close mobile menu on click
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            const res = await fetch(`/api/v1/local/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const json = await res.json();

            if (json.success) {
                Cookies.del('GENUID');
                Cookies.del('GENIMG');
                Cookies.del('GENNAME');
                Cookies.del('GENROLE');
                window.location.href = '/';
            } else {
                alert('Logout failed: ' + (json.data?.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Logout error: ' + e.message);
        }
    };

    // Get label based on current language
    const getLabel = (item) => {
        return lang === 'el' ? (item.label_el || item.label_en) : (item.label_en || item.label_el);
    };

    if (loading) {
        return <div className="menu-loading">Loading menu...</div>;
    }

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
                        {/* Dashboard button for admin users - FIXED: moved BEFORE other menu items */}
                        {isAdmin && (
                            <li className={activeKey === 'admin' ? 'active' : ''}>
                                <Link to="/admin/page" onClick={() => handleClick('admin')}>
                                    📊 DASHBOARD
                                </Link>
                            </li>
                        )}

                        {/* All menu items from database */}
                        {menuItems.map((item) => (
                            <li key={item.key} className={activeKey === item.key ? 'active' : ''}>
                                {userid && item.key === 'login' ? (
                                    <button className="bare" onClick={handleLogout}>
                                        {lang === 'el' ? 'Αποσύνδεση' : 'Logout'}
                                    </button>
                                ) : (
                                    <Link to={item.path} onClick={() => handleClick(item.key)}>
                                        {getLabel(item)}
                                    </Link>
                                )}
                            </li>
                        ))}

                        {/* User profile icon */}
                        {userid && (
                            <li>
                                <a href={`/profile?name=${myname}`}>
                                    <img
                                        className="navicon"
                                        src={`${window.location.origin}/media/${myimg}`}
                                        alt="Profile"
                                        onError={(e) => {
                                            e.target.src = '/assets/default-avatar.png';
                                        }}
                                    />
                                </a>
                            </li>
                        )}

                        {/* Language selector */}
                        <li><LanguageSelector currentLang={lang} /></li>

                        {/* Theme toggle */}
                        <li><ThemeToggle /></li>

                        {/* WhatsApp button */}
                        <Whatsapp />
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Menu;