// pages/Monetize.jsx
import React, { useState, useMemo } from 'react';
import AdSenseManager from '../components/monetize/AdSenseManager';
import AffiliateManager from '../components/monetize/AffiliateManager';

const Monetize = () => {
    const [activeTab, setActiveTab] = useState('adsense');

    // Keep components in memory
    const components = useMemo(() => ({
        adsense: <AdSenseManager />,
        affiliate: <AffiliateManager />
    }), []);

    const tabs = [
        { id: 'adsense', label: 'Google AdSense', icon: '💰' },
        { id: 'affiliate', label: 'Affiliate Links', icon: '🔗' },
    ];

    return (
        <div className="monetize-page">
            <div className="page-header">
                <h3>
                    <span className="indicator red"></span>
                    <a href="/admin/monetize">💰 Monetize & Revenue</a>
                </h3>
            </div>

            <ul className="tabs monetize-tabs">
                {tabs.map(tab => (
                    <li
                        key={tab.id}
                        className={`tab-link ${activeTab === tab.id ? 'current' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                    </li>
                ))}
            </ul>

            <div style={{ display: activeTab === 'adsense' ? 'block' : 'none' }}>
                {components.adsense}
            </div>
            <div style={{ display: activeTab === 'affiliate' ? 'block' : 'none' }}>
                {components.affiliate}
            </div>
        </div>
    );
};

export default Monetize;