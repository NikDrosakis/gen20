
import React, { useState } from 'react';

import MediaManager from '../components/MediaManager';
import UploadImage from '../components/UploadImage';
import ImageUploader from '../components/ImageUploader';
import GoogleDrive from '../components/GoogleDrive';
import PasteImage from '../components/PasteImage';
import GenerateMedia from '../components/GenerateMedia';

const Media = () => {
    const [activeTab, setActiveTab] = useState('media_manager');

    const tabs = [
        { id: 'media_manager', label: 'Media Manager', icon: '🖼️', component: MediaManager },
        { id: 'upload_image', label: 'Upload Image', icon: '📤', component: UploadImage },
        { id: 'url_image', label: 'Image from URL', icon: '🔗', component: ImageUploader },
        { id: 'google_drive', label: 'Google Drive', icon: '☁️', component: GoogleDrive },
        { id: 'paste_image', label: 'Paste Image', icon: '📋', component: PasteImage },
        { id: 'generate', label: 'Generate', icon: '✨', component: GenerateMedia }
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="media-page">

            <div className="page-header">
                <h3>
                    <span className="indicator red"></span>
                    <a href="/media">📁 Media Manager</a>
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

            <div className="media-tab-content">
                {ActiveComponent && <ActiveComponent />}
            </div>

        </div>
    );
};

export default Media;
