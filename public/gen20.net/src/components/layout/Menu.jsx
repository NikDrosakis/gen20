// components/Menu.jsx
import React, { useMemo, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import LanguageSelector from "../../modules/LanguageSelector";
import ThemeToggle from "../../modules/ThemeToggle";
import Whatsapp from "../Whatsapp";
import "./Menu.css";

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
                // ✅ Include id and parent fields
                const response = await fetch(`/api/v1/maria/fa?q=select id, name, parent, type, title, title_el from ${publicdb}.content where type="page" order by sort asc`);
                const data = await response.json();

                if (data.success && data.data) {
                    const items = data.data.map(page => ({
                        id: page.id,                    // ✅ Store the ID
                        key: page.name,
                        label_en: page.title || page.name,
                        label_el: page.title_el || page.name,
                        path: `/${page.name}`,
                        type: page.type,
                        parent: page.parent || 0        // ✅ parent=0 for root items
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

    // ✅ Build hierarchical menu structure using ID references
    const buildMenuHierarchy = (items) => {
        const itemMap = {};
        const rootItems = [];

        // First pass: create map of all items by ID
        items.forEach(item => {
            itemMap[item.id] = { ...item, children: [] };
        });

        // Second pass: build hierarchy based on parent ID
        items.forEach(item => {
            if (item.parent !== 0 && itemMap[item.parent]) {
                // This is a child item - add to parent's children
                itemMap[item.parent].children.push(itemMap[item.id]);
            } else if (item.parent === 0) {
                // This is a root item (parent=0)
                rootItems.push(itemMap[item.id]);
            }
        });

        return rootItems;
    };

    // ✅ Determine if a menu item or any of its children is active
    const isActiveOrChildActive = (item, activeKey) => {
        if (item.key === activeKey) return true;
        if (item.children) {
            return item.children.some(child => child.key === activeKey);
        }
        return false;
    };

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

    // ✅ Recursive function to render menu items with dropdown support
    const renderMenuItem = (item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isActive = isActiveOrChildActive(item, activeKey);
        const label = getLabel(item);

        // Handle special cases (login/logout)
        if (userid && item.key === 'login') {
            return (
                <li key={item.id} className={isActive ? 'active' : ''}>
                    <button className="bare" onClick={handleLogout}>
                        {lang === 'el' ? 'Αποσύνδεση' : 'Logout'}
                    </button>
                </li>
            );
        }

        return (
            <li key={item.id} className={isActive ? 'active' : ''}>
                <Link to={item.path} onClick={() => handleClick(item.key)}>
                    {label}
                </Link>
                {/* ✅ Render dropdown if item has children */}
                {hasChildren && (
                    <ul className="dropdown">
                        {item.children.map(child => renderMenuItem(child))}
                    </ul>
                )}
            </li>
        );
    };

    // ✅ Build the menu hierarchy
    const menuHierarchy = useMemo(() => {
        if (menuItems.length === 0) return [];
        return buildMenuHierarchy(menuItems);
    }, [menuItems]);

    // ✅ Render special items (admin, profile, language, theme, whatsapp)
    const renderSpecialItems = () => {
        const specialItems = [];

        // Admin dashboard
        if (isAdmin) {
            specialItems.push(
                <li key="admin" className={activeKey === 'admin' ? 'active' : ''}>
                    <Link to="/admin/page" onClick={() => handleClick('admin')}>
                        📊 DASHBOARD
                    </Link>
                </li>
            );
        }

        // User profile icon
        if (userid) {
            specialItems.push(
                <li key="profile">
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
            );
        }

        // Language selector
        specialItems.push(
            <li key="language"><LanguageSelector currentLang={lang} /></li>
        );

        // Theme toggle
        specialItems.push(
            <li key="theme"><ThemeToggle /></li>
        );

        // WhatsApp button
        specialItems.push(
            <li key="whatsapp"><Whatsapp /></li>
        );

        return specialItems;
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
                        {/* Render all menu items with dropdown support */}
                        {menuHierarchy.map(item => renderMenuItem(item))}

                        {/* Render special items */}
                        {renderSpecialItems()}
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Menu;