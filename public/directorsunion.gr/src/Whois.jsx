// /Whois.jsx
import React from 'react';
import ContentOne from './ContentOne';
import { useTheme } from './ThemeContext';
import './Whois.css';

const Whois = () => {
    const { theme } = useTheme();

    return (
        <div className={`whois-page ${theme}`}>
            {/* Mission Section */}
            <section className="mission-section">
                <div className="container">
                    <div className="mission-content">
                        <div className="mission-text">
                            <h2>Η Ένωση</h2>
                            <ContentOne name="whois" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Whois;