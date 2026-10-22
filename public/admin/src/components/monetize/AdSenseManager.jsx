// components/monetize/AdSenseManager.jsx
import React, { useState, useEffect } from 'react';
import "./AdSenseManager.css";
const AdSenseManager = () => {
    const [adsenseCode, setAdsenseCode] = useState('');
    const [adUnits, setAdUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadAdSenseSettings();
    }, []);

    const loadAdSenseSettings = async () => {
        try {
            const response = await fetch('/api/v1/maria/f?folder=select val from gen_nikimourtzicom.setup where name="ADSENSE_CODE"');
            const data = await response.json();
            if (data.success && data.data) {
                setAdsenseCode(data.data[0]?.val || '');
            }
        } catch (error) {
            console.error('Error loading AdSense settings:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([`UPDATE gen_nikimourtzicom.setup SET val='${adsenseCode}' WHERE name='ADSENSE_CODE'`, []])
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving AdSense:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="adsense-container">
            <div className="section-header">
                <h3>💰 Google AdSense Integration</h3>
                <p>Manage your ad codes and ad placements</p>
            </div>

            <div className="form-card">
                <div className="form-group">
                    <label className="form-label">AdSense Publisher Code</label>
                    <textarea
                        className="form-textarea"
                        rows={4}
                        value={adsenseCode}
                        onChange={(e) => setAdsenseCode(e.target.value)}
                        placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXX' crossorigin='anonymous'></script>"
                    />
                    <small className="form-hint">
                        Paste your Google AdSense publisher code here. It will be added to the &lt;head&gt; section of your site.
                    </small>
                </div>

                <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : '💾 Save AdSense Code'}
                </button>
                {saved && <div className="success-message">✅ AdSense code saved successfully!</div>}
            </div>

            <div className="ad-placements">
                <h4>📌 Ad Placements</h4>
                <div className="placements-grid">
                    <div className="placement-card">
                        <div className="placement-header">📱 In-Article Ads</div>
                        <p>Ads displayed between article paragraphs</p>
                        <button className="btn-secondary">Configure</button>
                    </div>
                    <div className="placement-card">
                        <div className="placement-header">📊 Sidebar Ads</div>
                        <p>Ads in right/left sidebar</p>
                        <button className="btn-secondary">Configure</button>
                    </div>
                    <div className="placement-card">
                        <div className="placement-header">🎯 In-Feed Ads</div>
                        <p>Native ads in blog feed</p>
                        <button className="btn-secondary">Configure</button>
                    </div>
                    <div className="placement-card">
                        <div className="placement-header">📝 Anchor Ads</div>
                        <p>Sticky ads at bottom of screen</p>
                        <button className="btn-secondary">Configure</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdSenseManager;