// src/components/Navbar.jsx
/**
 * #name: Navbar
 * #title: Dynamic Navigation Component
 * #description: Auto-generates menu from pages folder - no database needed
 * #version: 0.1.0
 * #author: System
 * #library: layout
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from "../contexts/ThemeContext";
import { FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";
import Cookies from 'js-cookie';
import './Navigation.css';

// Configuration - static menu items (προαιρετικά, για όσα δεν είναι pages)
const STATIC_MENU = {
    // Brand name
    brand: 'NIKI MOURTZI',

    // Static links που θέλεις πάντα (εκτός από τα pages)
    additional: [
        { id: 'blog', path: '/post', label: { en: 'Blog', el: 'Ιστολόγιο' } },
        { id: 'contact', path: '/contact', label: { en: 'Contact', el: 'Επικοινωνία' } }
    ]
};

export default function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode, toggleDarkMode } = useTheme();

    // State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [pageMenu, setPageMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentLang, setCurrentLang] = useState('en');
    const [mobileOpen, setMobileOpen] = useState(false);

    // Auto-discover pages from the filesystem via the router
    // Χρησιμοποιούμε το router για να πάρουμε τα routes
    useEffect(() => {
        const discoverPages = async () => {
            try {
                // Διαβάζουμε τα routes από το router που δημιουργήθηκε αυτόματα
                const routerModule = await import('../router.jsx');
                const router = routerModule.default;

                // Εξάγουμε τα paths από τα routes
                const routes = router.routes?.[0]?.children || [];
                const pagePaths = routes
                    .filter(route =>
                        route.path &&
                        route.path !== '*' &&
                        route.path !== 'home' &&
                        route.path !== 'login' &&
                        route.path !== 'signup' &&
                        route.path !== 'logout' &&
                        !route.path.includes(':') // Δεν είναι dynamic
                    )
                    .map(route => {
                        // Το name είναι το path χωρίς το '/'
                        const name = route.path;
                        // Για το index (path: '/') το name είναι 'home'
                        const displayName = name || 'home';
                        return {
                            id: displayName,
                            path: `/${displayName}`,
                            name: displayName,
                            label: {
                                en: displayName.charAt(0).toUpperCase() + displayName.slice(1),
                                el: displayName.charAt(0).toUpperCase() + displayName.slice(1)
                            }
                        };
                    });

                setPageMenu(pagePaths);
            } catch (error) {
                console.error('Error discovering pages:', error);
                // Fallback: χρησιμοποιούμε τα pages από το router που ξέρουμε
                setPageMenu([
                    { id: 'onecolumn', path: '/onecolumn', name: 'onecolumn', label: { en: 'Onecolumn', el: 'Onecolumn' } },
                    { id: 'threecolumn', path: '/threecolumn', name: 'threecolumn', label: { en: 'Threecolumn', el: 'Threecolumn' } },
                    { id: 'postl', path: '/postl', name: 'postl', label: { en: 'PostL', el: 'PostL' } },
                    { id: 'postr', path: '/postr', name: 'postr', label: { en: 'PostR', el: 'PostR' } },
                    { id: 'freepost', path: '/freepost', name: 'freepost', label: { en: 'Freepost', el: 'Freepost' } }
                ]);
            } finally {
                setLoading(false);
            }
        };

        discoverPages();
    }, []);

    // Check login status
    useEffect(() => {
        const checkAuth = () => {
            const genName = Cookies.get('GENNAME');
            const genUid = Cookies.get('GENUID');
            const genRole = Cookies.get('GENROLE');

            if (genName && genUid) {
                setIsLoggedIn(true);
                setUsername(genName);
            } else {
                setIsLoggedIn(false);
                setUsername('');
            }

            setIsAdmin(genRole === 'admin');
        };

        checkAuth();
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, []);

    // Get language from cookie
    useEffect(() => {
        const lang = Cookies.get('lang') || 'en';
        setCurrentLang(lang);
    }, []);

    const handleLogout = () => {
        Cookies.remove("GENNAME", { path: '/' });
        Cookies.remove("GENUID", { path: '/' });
        Cookies.remove("GENROLE", { path: '/' });
        Cookies.remove("GENIMG", { path: '/' });
        Cookies.remove("GENGRP", { path: '/' });
        Cookies.remove("lang", { path: '/' });

        setIsLoggedIn(false);
        setUsername('');
        setIsAdmin(false);
        navigate('/');
    };

    const toggleMobile = () => setMobileOpen(!mobileOpen);

    const getLabel = (labelObj) => {
        if (typeof labelObj === 'string') return labelObj;
        return labelObj[currentLang] || labelObj.en || '';
    };

    // Close mobile menu on navigation
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Build full menu
    const buildMenu = () => {
        const items = [];

        // Home is always first
        items.push({
            id: 'home',
            path: '/',
            label: { en: 'Home', el: 'Αρχική' },
            isHome: true
        });

        // Pages from router
        pageMenu.forEach(item => {
            // Skip if it's home or special pages
            if (item.id === 'home' || item.id === 'login' || item.id === 'signup') return;
            items.push(item);
        });

        // Additional static links
        STATIC_MENU.additional.forEach(link => {
            // Check if already exists
            if (!items.find(item => item.id === link.id)) {
                items.push(link);
            }
        });

        return items;
    };

    const menuItems = buildMenu();

    return (
        <nav className={`nav ${darkMode ? 'dark' : 'light'}`}>
            <div className="nav-inner">
                {/* Brand */}
                <div className="brand">
                    <Link to="/" className="brand-text">
                        {STATIC_MENU.brand}
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={toggleMobile}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Menu Links */}
                <div className={`links ${mobileOpen ? 'open' : ''}`}>
                    {/* Menu Items */}
                    {!loading && menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                            >
                                {getLabel(item.label)}
                            </Link>
                        );
                    })}

                    {/* Admin Dashboard */}
                    {isAdmin && (
                        <a href="/admin" className="nav-link admin-link">
                            {currentLang === 'el' ? 'Πίνακας Ελέγχου' : 'Dashboard'}
                        </a>
                    )}

                    {/* Authentication */}
                    <div className="auth-section">
                        {isLoggedIn ? (
                            <>
                                <span className="welcome-text">
                                    {currentLang === 'el' ? `Καλωσήρθες, ${username}` : `Welcome, ${username}`}
                                </span>
                                <button onClick={handleLogout} className="logout-btn">
                                    {currentLang === 'el' ? 'Αποσύνδεση' : 'Logout'}
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="nav-link login-link">
                                {currentLang === 'el' ? 'Σύνδεση' : 'Login'}
                            </Link>
                        )}
                    </div>

                    {/* Language Toggle */}
                    <div className="lang-section">
                        <button
                            onClick={() => {
                                Cookies.set('lang', 'el', { path: '/' });
                                setCurrentLang('el');
                                window.location.reload();
                            }}
                            className={`lang-btn ${currentLang === 'el' ? 'active' : ''}`}
                        >
                            🇬🇷 ΕΛ
                        </button>
                        <button
                            onClick={() => {
                                Cookies.set('lang', 'en', { path: '/' });
                                setCurrentLang('en');
                                window.location.reload();
                            }}
                            className={`lang-btn ${currentLang === 'en' ? 'active' : ''}`}
                        >
                            🇬🇧 EN
                        </button>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="theme-btn"
                        aria-label="Toggle theme"
                    >
                        {darkMode ? <FaSun /> : <FaMoon />}
                        <span className="theme-label">
                            {darkMode ?
                                (currentLang === 'el' ? 'Φως' : 'Light') :
                                (currentLang === 'el' ? 'Σκοτάδι' : 'Dark')
                            }
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
}