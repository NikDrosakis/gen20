/*
#name: FooterShort
#title: Short Footer Component
#description: Compact footer component with brand, navigation links, social links, and copyright. Lightweight version for admin panels and minimal layouts.
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

const FooterShort = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>GEN<span>20</span></h3>
                    <p>Next Generation Platform</p>
                </div>

                <div className="footer-links">
                    <a href="/about">About</a>
                    <a href="/services">Services</a>
                    <a href="/contact">Contact</a>
                    <a href="/privacy">Privacy</a>
                </div>

                <div className="footer-social">
                    <a href="https://github.com/NikDrosakis" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://twitter.com/NikosDrosakis" target="_blank" rel="noopener noreferrer">Twitter</a>
                    <a href="https://gen20.net" target="_blank" rel="noopener noreferrer">GEN20</a>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {currentYear} GEN20. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default FooterShort;