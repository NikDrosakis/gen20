// components/layout/Navigation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navigation.css';
import { useTheme } from '../contexts/ThemeContext';

const Navigation = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [currentLang, setCurrentLang] = useState('el');
    const [showUnionMenu, setShowUnionMenu] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Check authentication status from cookies
        const genUid = Cookies.get('GENUID');
        const genName = Cookies.get('GENNAME');
        const genRole = Cookies.get('GENROLE');
        const lang = Cookies.get('lang') || 'el';

        setCurrentLang(lang);

        if (genUid && genName) {
            setIsLoggedIn(true);
            setUsername(genName);
            setIsAdmin(genRole === 'admin' || genRole === '1');
        } else {
            setIsLoggedIn(false);
            setUsername('');
            setIsAdmin(false);
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUnionMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        // Delete all GEN* cookies
        Cookies.remove('GENNAME', { path: '/' });
        Cookies.remove('GENUID', { path: '/' });
        Cookies.remove('GENROLE', { path: '/' });
        Cookies.remove('GENIMG', { path: '/' });
        Cookies.remove('GENGRP', { path: '/' });
        Cookies.remove('lang', { path: '/' });

        // Update state
        setIsLoggedIn(false);
        setUsername('');
        setIsAdmin(false);

        // Redirect to home
        navigate('/');
    };

    const handleMouseEnter = () => {
        setShowUnionMenu(true);
    };

    const handleMouseLeave = () => {
        setShowUnionMenu(false);
    };

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-tabs">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? 'nav-link active' : 'nav-link'
                        }
                        end
                    >
                        ΑΡΧΙΚΗ
                    </NavLink>

                    {/* Η ΕΝΩΣΗ με dropdown */}
                    <div
                        className="dropdown-container"
                        ref={dropdownRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <NavLink
                            to="/whois"
                            className={({ isActive }) =>
                                isActive ? 'nav-link active dropdown-toggle' : 'nav-link dropdown-toggle'
                            }
                        >
                            Η ΕΝΩΣΗ
                            <span className="dropdown-arrow">▼</span>
                        </NavLink>

                        {showUnionMenu && (
                            <div className="dropdown-menu">
                                <NavLink
                                    to="/whois"
                                    className={({ isActive }) =>
                                        isActive ? 'dropdown-item active' : 'dropdown-item'
                                    }
                                    onClick={() => setShowUnionMenu(false)}
                                >
                                    <span className="dropdown-icon">🏛️</span>
                                    Ιδρυση
                                </NavLink>
                                <NavLink
                                    to="/board"
                                    className={({ isActive }) =>
                                        isActive ? 'dropdown-item active' : 'dropdown-item'
                                    }
                                    onClick={() => setShowUnionMenu(false)}
                                >
                                    <span className="dropdown-icon">👥</span>
                                    Διοικητικό Συμβούλιο
                                </NavLink>
                            </div>
                        )}
                    </div>

                    <NavLink
                        to="/publications"
                        className={({ isActive }) =>
                            isActive ? 'nav-link active' : 'nav-link'
                        }
                    >
                        ΘΕΣΕΙΣ/ΠΑΡΕΜΒΑΣΕΙΣ
                    </NavLink>

                    <NavLink
                        to="/actions"
                        className={({ isActive }) =>
                            isActive ? 'nav-link active' : 'nav-link'
                        }
                    >
                        ΕΚΔΗΛΩΣΕΙΣ/ΔΡΑΣΕΙΣ
                    </NavLink>

                    <NavLink
                        to="/arxeio"
                        className={({ isActive }) =>
                            isActive ? 'nav-link active' : 'nav-link'
                        }
                    >
                        ΑΡΧΕΙΟ
                    </NavLink>

                    <NavLink
                        to="/join"
                        className={({ isActive }) =>
                            isActive ? 'nav-link active' : 'nav-link'
                        }
                    >
                        ΓΙΝΕ ΜΕΛΟΣ
                    </NavLink>

                    {/* Admin Dashboard - only for admin users */}
                    {isAdmin && (
                        <a href="/admin" className="admin-link">ΔΙΑΧΕΙΡΙΣΗ</a>
                    )}

                    {/* Authentication section */}
                    {isLoggedIn ? (
                        <>
                            <span className="welcome-text">
                                Καλωσήρθες {username}
                            </span>
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                ΑΠΟΣΥΝΔΕΣΗ
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login" className="nav-link">
                            ΣΥΝΔΕΣΗ
                        </NavLink>
                    )}

                    {/* Signup link - only show when not logged in */}
                    {!isLoggedIn && (
                        <NavLink to="/signup" className="nav-link">
                            ΕΓΓΡΑΦΗ
                        </NavLink>
                    )}

                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="theme-toggle-btn">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;