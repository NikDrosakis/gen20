// components/Navigation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';
import Cookies from 'js-cookie';

const Navigation = () => {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    console.log('Navigation render, darkMode:', darkMode);

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

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/">
                    <div className="logo">
                        <span className="logo-icon">🧬</span>
                        <span className="logo-text">Gen<span className="logo-accent">20</span></span>
                    </div>
                </Link>
                <ul className="nav-links">
                    <li><Link to="/injector">Injector</Link></li>
                    <li><Link to="/">Solutions</Link></li>
                    <li><Link to="/">Platform</Link></li>
                    <li><Link to="/">Science</Link></li>
                    <li><Link to="/">Resources</Link></li>
                    <li><Link to="/">Company</Link></li>
                    {/* Authentication section */}
                    {isLoggedIn ? (
                        <>
                            <span className="welcome-text">Welcome, {username}</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                    {/* Admin Dashboard - only for admin users */}
                    {isAdmin && (
                        <Link to="/admin" className="admin-link">Dashboard</Link>
                    )}
                </ul>
                <div className="nav-actions">
                    <button className="theme-toggle" onClick={() => {
                        console.log('Button clicked!');
                        toggleTheme();
                    }}>
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    <Link to="/contact" className="btn-outline">Contact</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;