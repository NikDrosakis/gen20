// components/layout/Hero.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './Hero.css';

const Hero = ({
                  title = "Ένωση Σκηνοθετών Δημιουργών",
                  subtitle = "Διεκδικούμε τα δικαιώματά μας. Υπερασπιζόμαστε την τέχνη. Χτίζουμε συλλογικά το μέλλον.",
                  ctaText = null,
                  ctaLink = null,
                  secondaryCtaText = null,
                  secondaryCtaLink = null,
                  compact = false,
                  bgImage = null,
                  overlay = true
              }) => {
    const { theme } = useTheme();

    const handleCtaClick = (link) => {
        if (link) window.location.href = link;
    };

    return (
        <section className={`hero-section ${compact ? 'hero-compact' : ''} ${theme}`}>
            {bgImage && (
                <div className="hero-bg">
                    <img src={bgImage} alt="" className="hero-bg-image" />
                    {overlay && <div className="hero-overlay"></div>}
                </div>
            )}

            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">{title}</h1>
                    <p className="hero-subtitle">{subtitle}</p>

                    {(ctaText || secondaryCtaText) && (
                        <div className="hero-buttons">
                            {ctaText && ctaLink && (
                                <button
                                    className="hero-btn hero-btn-primary"
                                    onClick={() => handleCtaClick(ctaLink)}
                                >
                                    {ctaText}
                                </button>
                            )}
                            {secondaryCtaText && secondaryCtaLink && (
                                <button
                                    className="hero-btn hero-btn-secondary"
                                    onClick={() => handleCtaClick(secondaryCtaLink)}
                                >
                                    {secondaryCtaText}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;