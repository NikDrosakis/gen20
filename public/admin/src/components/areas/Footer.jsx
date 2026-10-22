/*
#name: Footer
#title: Website Footer Component
#description: Global footer component with site info, social links, quick navigation, and network links. Displays current year dynamically and version info.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: layout
#independent: true
#standalone: true
#compatible_areas: f
#dependencies: react
#methods:
#   - getCurrentYear(): Returns current year dynamically for copyright
*/
import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="gen20-footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>GEN20</h3>
                    <p>Next Generation CMS & Digital Platform</p>
                    <div className="social-links">
                        <a href="https://github.com/NikDrosakis" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-github"></i>
                        </a>
                        <a href="https://twitter.com/NikosDrosakis" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a href="https://www.facebook.com/ndrosakis" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook"></i>
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>GEN20 Network</h4>
                    <ul>
                        <li>
                            <a href="https://gen20.gr" target="_blank" rel="noopener noreferrer">
                                GEN20 Greece
                            </a>
                        </li>
                        <li>
                            <a href="https://gen20.net" target="_blank" rel="noopener noreferrer">
                                GEN20 International
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/NikDrosakis/Gaia" target="_blank" rel="noopener noreferrer">
                                GitHub Repository
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/services">Services</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Contact</h4>
                    <ul>
                        <li>
                            <i className="fas fa-envelope"></i>
                            <a href="mailto:info@gen20.net">info@gen20.net</a>
                        </li>
                        <li>
                            <i className="fas fa-globe"></i>
                            <a href="https://gen20.net" target="_blank" rel="noopener noreferrer">
                                www.gen20.net
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="copyright">
                    <p>
                        Developed by{' '}
                        <a href="https://gen20.net" target="_blank" rel="noopener noreferrer" className="gen20-link">
                            GEN20
                        </a>
                        {' '}© {currentYear}. All rights reserved.
                    </p>
                    <p className="version">Version 0.55</p>
                </div>
                <div className="footer-links">
                    <a href="https://gen20.gr" target="_blank" rel="noopener noreferrer">GEN20.gr</a>
                    <span className="separator">|</span>
                    <a href="https://gen20.net" target="_blank" rel="noopener noreferrer">GEN20.net</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;