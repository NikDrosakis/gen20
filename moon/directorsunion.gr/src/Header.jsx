// /components/layout/Header.jsx
import { useState, useEffect } from 'react';
import Navigation from "./Navigation";
import { useTheme } from './ThemeContext';
import { FaFacebook } from 'react-icons/fa';
import './Header.css';
import { useG } from './GContext';

const Header = () => {
    const { G } = useG();
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // ✅ Safe access
    const logo = G?.set?.logo;
    const bg = G?.set?.bg;
    const facebookPageUrl = G?.set?.facebook || 'https://facebook.com';

    // ✅ Throttled scroll listener
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrolled(prev => {
                        const next = window.scrollY > 50;
                        return prev === next ? prev : next;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Profile Section */}
            <div className="profile-section">
                <div className="profile-container">
                    {/* Avatar */}
                    {logo && (
                        <div className="avatar-container">
                            <img src={`/media/${logo}`} alt="Logo" className="avatar" />
                        </div>
                    )}

                    {/* Organization Info */}
                    <div className="org-info">
                        <h1 className="org-name">
                           {G.set.title}
                        </h1>
                        {bg && (
                            <img
                                src={`/media/${bg}`}
                                className="bg-image"
                                alt="Background"
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <Navigation />
                </div>
            </div>

            {/* Sticky Header on Scroll */}
            <div className={`sticky-header ${scrolled ? 'visible' : ''}`}>
                <img src="/logo0.png" alt="Logo" className="sticky-logo" />
                <span className="sticky-title">Ένωση Σκηνοθετών Δημιουργών</span>
                <div className="social-follow">
                    <a
                        href={facebookPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sticky-follow-btn"
                        aria-label="Ακολουθήστε μας στο Facebook"
                    >
                        <FaFacebook style={{ marginRight: '5px' }} /> Ακολουθήστε
                    </a>
                </div>
            </div>
        </>
    );
};

export default Header;