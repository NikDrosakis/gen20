/*
#name: NavAdmin
#title: Admin Navigation Component
#description: Main admin navigation bar with user menu, language switcher, and dynamic menu items based on permissions. Displays public languages status.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: layout
#independent: true
#standalone: true
#compatible_areas: h
#dependencies: react, js-cookie
#apimethods:
#   GET /api/v1/maria/fa?q=select * from gen_*.language where status=2
#methods:
#   - fetchLanguages(): Fetches active public languages from database
#   - fetchUser(): Retrieves user data from cookies
#   - handleNavigation(): Navigates to selected admin page
#   - handleLanguageChange(): Changes admin language
#   - handleLogout(): Clears cookies and redirects to login
#   - getUserInitials(): Returns user initials for avatar
#   - getUserName(): Returns display name from user data
*/
import React, { useState, useEffect } from 'react';
import './NavAdmin.css';
import Cookies from 'js-cookie';

const NavAdmin = ({ currentPage, onNavigate }) => {
    const [languages, setLanguages] = useState([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [user, setUser] = useState({
        name: '',
        role: '',
        img: ''
    });
    const isGen20Net = window.location.hostname === 'gen20.net';
    const navItems = [
        { id: 'home', label: 'Home', icon: '🏠', path: '/admin' },
        { id: 'setup', label: 'Setup', icon: '🔧', path: '/admin/setup' },
        { id: 'page', label: 'Content', icon: '📝', path: '/admin/page' },
        { id: 'classification', label: 'Categories', icon: '📂', path: '/admin/classification' },
        { id: 'users', label: 'Users', icon: '👤', path: '/admin/users' },
        { id: 'members', label: 'Members', icon: '👤', path: '/admin/members' },
        { id: 'media', label: 'Media', icon: '🖼️', path: '/admin/media' },
        { id: 'links', label: 'Links', icon: '🖼️', path: '/admin/links' },
        { id: 'slides', label: 'Slides', icon: '🖼️', path: '/admin/slides' },
        { id: 'layout', label: 'Layout', icon: '🎨', path: '/admin/layout' },
        { id: 'languages', label: 'Languages', icon: '🌐', path: '/admin/languages' },
        { id: 'analytics', label: 'Analytics', icon: '📈', path: '/admin/analytics' },
        // monetize και superadmin μόνο για gen20.net
        ...(isGen20Net ? [
            { id: 'monetize', label: 'Monetize', icon: '💰', path: '/admin/monetize' },
            { id: 'superadmin', label: 'SuperAdmin', icon: '🛡️', path: '/admin/superadmin' },
        ] : []),
    ];

    // Load languages from database
    useEffect(() => {
        fetchLanguages();
        fetchUser();
    }, []);

    const fetchLanguages = async () => {
        try {
            const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
            // Σωστός πίνακας: "language" (status=2 για ενεργές γλώσσες public)
            const query = `select * from ${publicdb}.language where status=2`;
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(`/api/v1/maria/fa?q=${encodedQuery}`);
            const result = await response.json();
            if (result.success && result.data) {
                setLanguages(result.data);
                console.log('✅ Loaded public languages:', result.data);
                const languageCodes = result.data.map(lang => lang.code).join(',');
                localStorage.setItem('public_languages', languageCodes);
            }
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    };


    const fetchUser =() => {
        const userName = Cookies.get('GENNAME') || 'Admin';
        const userRole = Cookies.get('GENROLE') || 'user';
        const userImg = Cookies.get('GENIMG') || '';

        setUser({
            name: userName,
            role: userRole,
            img: userImg
        });
    };

    const handleNavigation = (item) => {
        if (item.id === 'page') {
            window.location.href = '/admin/page';
        } else {
            window.location.href = item.path;
        }
    };

    const handleLanguageChange = (langCode) => {
        setActiveLang(langCode);
        localStorage.setItem('admin_language', langCode);
        // Trigger language change event for other components
        window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: langCode } }));
    };

    const handleLogout = () => {
        // Clear cookies
        Cookies.remove('GENNAME');
        Cookies.remove('GENROLE');
        Cookies.remove('GENIMG');
        Cookies.remove('GENGRP');
        Cookies.remove('GENLIBID');

        // Redirect to login
        window.location.href = '/login';
    };

    const getUserInitials = () => {
        if (!user) return 'A';
        if (user.name) return user.name.charAt(0).toUpperCase();
        if (user.username) return user.username.charAt(0).toUpperCase();
        if (user.email) return user.email.charAt(0).toUpperCase();
        return 'A';
    };

    const getUserName = () => {
        if (!user) return 'Admin';
        if (user.name) return user.name;
        if (user.username) return user.username;
        if (user.email) return user.email.split('@')[0];
        return 'Admin';
    };

    return (
        <nav className="admin-navbar">
            <div className="admin-navbar-inner">
                <div className="admin-brand">
                    <span className="admin-brand-icon">🧬</span>
                    <span className="admin-brand-text">GEN20 Admin - {window.location.host}
                        {languages.length > 0 && (
                            <div className="admin-languages-flags" title="Public site active languages">
                                {languages.map(lang => (
                                    <span key={lang.code} className="lang-flag-item" title={lang.name}>
                                    {lang.name}
                                </span>
                                ))}
                            </div>
                        )}
                    </span>


                </div>

                <ul className="admin-nav-list">
                    {navItems.map(item => (
                        <li key={item.id} className="admin-nav-item">
                            <button
                                className={`admin-nav-link ${currentPage === item.id ? 'active' : ''}`}
                                onClick={() => handleNavigation(item)}
                            >
                                <span className="admin-nav-icon">{item.icon}</span>
                                <span className="admin-nav-label">{item.label}</span>
                            </button>
                        </li>
                    ))}

                    {/* Public Home button */}
                    <li className="admin-nav-item">
                        <button
                            className="admin-nav-link public-home"
                            onClick={() => window.location.href = '/'}
                        >
                            <span className="admin-nav-icon">🏠</span>
                            <span className="admin-nav-label">Public Home</span>
                        </button>
                    </li>
                </ul>

                {/* Right side: Languages + User Menu */}
                <div className="admin-nav-right">
                    {/* User Menu */}
                    <div className="admin-user-menu">
                        <button
                            className="admin-user-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="admin-user-avatar">
                                {getUserInitials()}
                            </div>
                            <span className="admin-user-name">{getUserName()}</span>
                            <span className="admin-user-arrow">▼</span>
                        </button>

                        {showUserMenu && (
                            <div className="admin-user-dropdown">
                                <div className="admin-user-info">
                                    <div className="user-avatar-large">
                                        {getUserInitials()}
                                    </div>
                                    <div className="user-details">
                                        <div className="user-name">{getUserName()}</div>
                                        <div className="user-email">{user?.email || 'admin@local.host'}</div>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="admin-user-item" onClick={() => window.location.href = '/admin/profile'}>
                                    <span className="item-icon">👤</span>
                                    My Profile
                                </button>
                                <button className="admin-user-item" onClick={() => window.location.href = '/admin/settings'}>
                                    <span className="item-icon">⚙️</span>
                                    Settings
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="admin-user-item logout" onClick={handleLogout}>
                                    <span className="item-icon">🚪</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavAdmin;