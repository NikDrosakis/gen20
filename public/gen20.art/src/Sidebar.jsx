// components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ position = 'left', items = [] }) => {
    const location = useLocation();

    const defaultItems = [
        { label: 'Αρχική', path: '/', icon: '🏠' },
        { label: 'Ανακοινώσεις', path: '/publications', icon: '📢' },
        { label: 'Δράσεις', path: '/actions', icon: '🎬' },
        { label: 'Αρχείο', path: '/arxeio', icon: '📚' },
        { label: 'Η Ένωση', path: '/whois', icon: '👥' },
        { label: 'Επικοινωνία', path: '/contact', icon: '✉️' },
    ];

    const sidebarItems = items.length > 0 ? items : [];
    const id = position === 'left' ? 'sl' : 'sr';

    return (
        <aside id={id} className={`sidebar sidebar-${position}`}>
            <div className="sidebar-inner">
                <nav className="sidebar-nav">
                    {sidebarItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;