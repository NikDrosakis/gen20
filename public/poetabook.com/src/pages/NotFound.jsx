// src/pages/NotFound.jsx
/**
 * #name: NotFound
 * #title: 404 Page Not Found
 * #description: Error page for routes that don't exist
 * #version: 0.0.1
 * #author: System
 * #library: pages
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './NotFound.css';

export default function NotFound() {
    const { darkMode } = useTheme();

    return (
        <div className={`not-found-container ${darkMode ? 'dark' : 'light'}`}>
            <div className="not-found-content">
                {/* 404 Icon/Image */}
                <div className="not-found-icon">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="not-found-svg"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                {/* Error Code */}
                <h1 className="not-found-code">404</h1>

                {/* Title */}
                <h2 className="not-found-title">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="not-found-description">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Actions */}
                <div className="not-found-actions">
                    <Link to="/" className="not-found-btn primary">
                        🏠 Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="not-found-btn secondary"
                    >
                        ⬅️ Go Back
                    </button>
                </div>

                {/* Helpful links */}
                <div className="not-found-help">
                    <p>You might want to check:</p>
                    <div className="not-found-links">
                        <Link to="/">Home</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}