// /FootMenu.jsx
import React, { useState, useEffect } from 'react';
import './FootMenu.css';
import { useG } from './GContext';
const FootMenu = () => {
    const { G } = useG();
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const menuItems = [
        { name: 'Επικοινωνία', path: '/contact' },
        { name: 'Ραδιοφωνικό Αρχείο', path: '/radio' },
        { name: 'Οπτικοακουστικό Αρχείο', path: '/reels' },
        { name: 'Συχνές Ερωτήσεις', path: '/faq' }
    ];

    const infoLinks = [
        { name: 'Σχετικά', path: '/about' },
        { name: 'Επικοινωνία', path: '/contact' },
        { name: 'Όροι Χρήσης', path: '/terms' },
        { name: 'Προσωπικά Δεδομένα', path: '/privacy' }
    ];

    const handleNavigation = (path) => {
        window.location.href = path;
    };

    return (
        <footer className="footmenu-container">
            <div className="footmenu-content">
                {/* Left Section - Brand */}
                <div className="footmenu-section footmenu-brand-section">
                    <div className="footmenu-brand">
                        <span className="brand-symbol">⚙️</span>
                        <span className="brand-text">{G.set.title}</span>
                    </div>
                    <p className="brand-description">
                        Επίσημη Σελίδα
                    </p>
                </div>

                {/* Center Left - Main Menu */}
                <div className="footmenu-section">
                    <h3 className="footmenu-title">Πλοήγηση</h3>
                    <ul className="footmenu-links">
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <button
                                    className="footmenu-link"
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Center Right - Info */}
                <div className="footmenu-section">
                    <h3 className="footmenu-title">Πληροφορίες</h3>
                    <ul className="footmenu-links">
                        {infoLinks.map((link, index) => (
                            <li key={index}>
                                <button
                                    className="footmenu-link"
                                    onClick={() => handleNavigation(link.path)}
                                >
                                    {link.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Section - Contact */}
                <div className="footmenu-section">
                    <h3 className="footmenu-title">Επικοινωνία</h3>
                    <ul className="footmenu-contact">
                        <li>{G.set.address}</li>
                        <li>Τηλ: {G.set.tel}</li>
                        <li>Email: {G.set.email}</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footmenu-bottom">
                <div className="footmenu-bottom-content">
                    <a href="https://gen20.net" className="copyright">
                        © {currentYear} {G.set.title}
                    </a>
                    <a href="/rss.xml" className="rss-link" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <circle cx="6.18" cy="17.82" r="2.18"/>
                            <path
                                d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
                        </svg>
                        RSS Feed
                    </a>
                    <span className="powered-by">
                        DEVELOPED-POWERED BY: GEN20
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default FootMenu;