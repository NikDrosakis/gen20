// Media.jsx
import React, { useState, useMemo } from 'react';
import MediaManager from '../components/media/MediaManager';
import UploadImage from '../components/media/UploadImage';
import ImageUploader from '../components/media/ImageUploader';
import GoogleDrive from '../components/media/GoogleDrive';
import DigMedia from '../components/media/DigMedia';
import PasteImage from '../components/media/PasteImage';
import GenerateMedia from '../components/media/GenerateMedia';

const Media = () => {
    const [activeTab, setActiveTab] = useState('media_manager');

    // CRITICAL: Keep components in memory, never re-create
    const components = useMemo(() => ({
        media_manager: <MediaManager />,
        upload_image: <UploadImage />,
        url_image: <ImageUploader />,
        google_drive: <GoogleDrive />,
        dig: <DigMedia />,
        paste_image: <PasteImage />,
        generate: <GenerateMedia />
    }), []);

    const tabs = [
        { id: 'media_manager', label: 'Media Manager', icon: '🖼️' },
        { id: 'upload_image', label: 'Upload Image', icon: '📤' },
        { id: 'url_image', label: 'Image from URL', icon: '🔗' },
        { id: 'google_drive', label: 'Google Drive', icon: '☁️' },
        { id: 'dig', label: 'Dig', icon: '🔍' },
        { id: 'paste_image', label: 'Paste Image', icon: '📋' },
        { id: 'generate', label: 'Generate', icon: '✨' }
    ];

    return (
        <div className="media-page">
            <div className="page-header">
                <h3>
                    <span className="indicator red"></span>
                    <a href="/media/media">📁 Media Manager</a>
                </h3>
            </div>

            <ul className="tabs mediatabs">
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

            {/* All tabs rendered but only active one visible */}
            <div style={{ display: activeTab === 'media_manager' ? 'block' : 'none' }}>
                {components.media_manager}
            </div>
            <div style={{ display: activeTab === 'upload_image' ? 'block' : 'none' }}>
                {components.upload_image}
            </div>
            <div style={{ display: activeTab === 'url_image' ? 'block' : 'none' }}>
                {components.url_image}
            </div>
            <div style={{ display: activeTab === 'google_drive' ? 'block' : 'none' }}>
                {components.google_drive}
            </div>
            <div style={{ display: activeTab === 'dig' ? 'block' : 'none' }}>
                {components.dig}
            </div>
            <div style={{ display: activeTab === 'paste_image' ? 'block' : 'none' }}>
                {components.paste_image}
            </div>
            <div style={{ display: activeTab === 'generate' ? 'block' : 'none' }}>
                {components.generate}
            </div>
        </div>
    );
};

export default Media;