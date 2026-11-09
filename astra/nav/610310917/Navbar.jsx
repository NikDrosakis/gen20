// #name: Navbar
// #title: a typical navigation
// #description: official horizontal navbar
// #version: 0.0.2
// #author: Nicolas
// #library: layout
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from "../contexts/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import Cookies from 'js-cookie';
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const { darkMode, toggleDarkMode } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    // Fetch menu items from database
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch(`/api/v1/maria/fa?query=SELECT id,name,title FROM ${publicdb}.content WHERE type='page' ORDER BY sort ASC`);
                const result = await response.json();

                if (result.success && result.data) {
                    setMenuItems(result.data);
                }
            } catch (error) {
                console.error('Error fetching menu items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    // Check login status on mount and when cookies change
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

        // Optional: Poll for cookie changes every second
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        // Delete all GEN* cookies
        Cookies.remove("GENNAME", { path: '/' });
        Cookies.remove("GENUID", { path: '/' });
        Cookies.remove("GENROLE", { path: '/' });
        Cookies.remove("GENIMG", { path: '/' });
        Cookies.remove("GENGRP", { path: '/' });
        Cookies.remove("lang", { path: '/' });

        // Update state
        setIsLoggedIn(false);
        setUsername('');
        setIsAdmin(false);

        // Redirect to home
        navigate('/');
    };

    // Get the current language from cookie or URL
    const [currentLang, setCurrentLang] = useState('en');

    useEffect(() => {
        const lang = Cookies.get('lang') || 'en';
        setCurrentLang(lang);
    }, []);

    // Get display title based on current language
    const getDisplayTitle = (item) => {
        if (currentLang === 'el' && item.title_el) {
            return item.title_el;
        }
        return item.title || item.name;
    };

    return (
        <nav className="nav">
            <div className="nav-inner">
                <div className="brand">
                    <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>
                        ANTICULTURA.COM
                    </Link>
                </div>
                <label style={{fontFamily: "monospace", fontSize: "x-large"}}>Culture without borders. Ideas without
                    noise. A multilingual journal.</label>
                <div className="links">
                    {/* Home link always first */}
                    <Link to="/">{currentLang === 'el' ? 'Αρχική' : 'Home'}</Link>

                    {/* Dynamic menu items from database */}
                    {!loading && menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={`/${item.name === 'home' ? '' : item.name}`}
                        >
                            {getDisplayTitle(item)}
                        </Link>
                    ))}

                    {/* Blog link (if not already in menu items) */}
                    {!menuItems.find(item => item.name === 'blog') && (
                        <Link to="/post">Blog</Link>
                    )}

                    {/* Contact link (if not already in menu items) */}
                    {!menuItems.find(item => item.name === 'contact') && (
                        <Link to="/contact">Contact</Link>
                    )}

                    {/* Admin Dashboard - only for admin users */}
                    {isAdmin && (
                        <a href="/admin">Dashboard</a>
                    )}

                    {/* Authentication section */}
                    {isLoggedIn ? (
                        <>
                            <span className="welcome-text">Welcome, {username}</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login">{currentLang === 'el' ? 'Σύνδεση' : 'Login'}</Link>
                    )}

                    {/* Language Toggle Button */}
                    <button
                        onClick={() => {
                            const newLang = currentLang === 'en' ? 'el' : 'en';
                            Cookies.set('lang', newLang, {path: '/'});
                            setCurrentLang(newLang);
                            window.location.reload(); // Reload to update content
                        }}
                        className="lang-toggle"
                        aria-label="Toggle language"
                    >
                        {currentLang === 'en' ? 'ΕΛ' : 'EN'}
                    </button>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleDarkMode}
                        className="theme-toggle"
                        aria-label="Toggle dark/light mode"
                    >
                        {darkMode ? <FaSun/> : <FaMoon/>}
                        <span className="toggle-text">
                            {darkMode ? 'Light' : 'Dark'}
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
}