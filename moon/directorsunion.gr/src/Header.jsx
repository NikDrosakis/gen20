
// /components/layout/Header.jsx

import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { useTheme } from './ThemeContext';
import { FaFacebook, FaSun, FaMoon } from 'react-icons/fa';
import './Header.css';
import { useG } from './GContext';

const Header = () => {
    const { G } = useG();
    const { theme, toggleTheme } = useTheme();

    const [scrolled, setScrolled] = useState(false);

    // Safe settings access
    const settings = G?.set || {};

    const logo = settings.logo || '';
    const bg = settings.bg || '';
    const title = settings.title || '';
    const facebookPageUrl = settings.facebook || 'https://facebook.com';

    // Scroll listener
    useEffect(() => {
        let ticking = false;
        let frameId = null;

        const handleScroll = () => {
            if (ticking) return;

            ticking = true;

            frameId = window.requestAnimationFrame(() => {
                setScrolled(window.scrollY > 50);
                ticking = false;
            });
        };

        // Initial state
        setScrolled(window.scrollY > 50);

        window.addEventListener('scroll', handleScroll, {
            passive: true
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, []);

    return (
        <>
            {/* Profile Header */}
            <div className="profile-section">
                <div
                    className={`profile-container ${bg ? 'has-background' : ''}`}
                    style={bg ? {
                        backgroundImage: `
                            linear-gradient(
                                rgba(20, 20, 38, 0.30),
                                rgba(20, 20, 38, 0.40)
                            ),
                            url("/media/${bg}")
                        `
                    } : undefined}
                >
                    {/* Avatar */}
                    {logo && (
                        <div className="avatar-container">
                            <img
                                src={`/media/${logo}`}
                                alt={`${title || 'Organization'} logo`}
                                className="avatar"
                            />
                        </div>
                    )}

                    {/* Organization Info */}
                    <div className="org-info">
                        {title && (
                            <h1 className="org-name">
                                {title}
                            </h1>
                        )}
                    </div>

                    <Navigation />
                </div>
            </div>

            {/* Sticky Header on Scroll */}
            <div
                className={`sticky-header ${scrolled ? 'visible' : ''}`}
            >
                {logo && (
                    <img
                        src={`/media/${logo}`}
                        alt={`${title || 'Organization'} logo`}
                        className="sticky-logo"
                    />
                )}

                {title && (
                    <span className="sticky-title">
                        {title}
                    </span>
                )}

                <div className="social-follow">
                    <a
                        href={facebookPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sticky-follow-btn"
                        aria-label="Ακολουθήστε μας στο Facebook"
                    >
                        <FaFacebook style={{ marginRight: '5px' }} />
                        Ακολουθήστε
                    </a>
                </div>

                {/* Theme Toggle */}
                <button
                    type="button"
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label={
                        theme === 'dark'
                            ? 'Switch to light theme'
                            : 'Switch to dark theme'
                    }
                    title="Change theme"
                >
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>
            </div>
        </>
    );
};

export default Header;
