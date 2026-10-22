// /components/layout/Header.jsx
import { useState, useEffect } from 'react';
import Navigation from "../Navigation";
import { useTheme } from '../../contexts/ThemeContext';
import { FaFacebook } from 'react-icons/fa';
import "./Header.css";

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const facebookPageUrl = "https://web.facebook.com/p/%CE%88%CE%BD%CF%89%CF%83%CE%B7-%CE%A3%CE%BA%CE%B7%CE%BD%CE%BF%CE%B8%CE%B5%CF%84%CF%8E%CE%BD-%CE%94%CE%B7%CE%BC%CE%B9%CE%BF%CF%85%CF%81%CE%B3%CF%8E%CE%BD-100082985457661/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Profile Section */}
            <div className="profile-section">
                <div className="profile-container">
                    {/* Avatar */}
                    <div className="avatar-container">
                        <img src="/logo0.png" alt="Logo" className="avatar" />
                    </div>

                    {/* Organization Info */}
                    <div className="org-info">
                        <h1 className="org-name">
                            Ένωση Σκηνοθετών Δημιουργών Οπτικοακουστικών και Παραστατικών Τεχνών
                        </h1>
                        <img src="/media/paste-1781788910789.png" class="bg-image"/>
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