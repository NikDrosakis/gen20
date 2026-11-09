// components/MediaToolbox.jsx
import React, { useState, useMemo } from 'react';
import MediaManager from './MediaManager';
import UploadImage from './UploadImage';
import ImageUploader from './ImageUploader';
import GoogleDrive from './GoogleDrive';
import PasteImage from './PasteImage';
import GenerateMedia from './GenerateMedia';
import "./MediaToolbox.css";
const MediaToolbox = ({ onSelect, onClose, selectedValue }) => {
    const [activeTab, setActiveTab] = useState('media_manager');

    // CRITICAL: Keep components in memory, never re-create
    const components = useMemo(() => ({
        media_manager: <MediaManager onSelectMedia={onSelect} />,
        upload_image: <UploadImage onUploadComplete={() => {}} />,
        url_image: (
            <ImageUploader
                key={activeTab} // <-- 3. Αυτό αναγκάζει το component να φορτώσει από την αρχή
                initialUrl={activeTab === 'url_image' ? (localStorage.getItem('temp_content_url') || '') : ''}
                value={selectedValue}
                onChange={onSelect}
                folder="blog" // ή όποιο folder θέλεις
            />
        ),
        google_drive: <GoogleDrive onSelectMedia={onSelect} />,
        paste_image: <PasteImage onSelectMedia={onSelect} />,
        generate: <GenerateMedia onSelectMedia={onSelect} />
    }), [onSelect, selectedValue,activeTab]);

    const tabs = [
        { id: 'media_manager', label: 'Media Manager', icon: '🖼️' },
        { id: 'upload_image', label: 'Upload Image', icon: '📤' },
        { id: 'url_image', label: 'Image from URL', icon: '🔗' },
        { id: 'google_drive', label: 'Google Drive', icon: '☁️' },
        { id: 'paste_image', label: 'Paste Image', icon: '📋' },
        { id: 'generate', label: 'Generate', icon: '✨' }
    ];

    return (
        <div className="media-toolbox">
            <div className="media-toolbox-header">
                <h3>📁 Media Toolbox</h3>
                {onClose && (
                    <button className="media-toolbox-close" onClick={onClose}>
                        ✕
                    </button>
                )}
            </div>

            <ul className="media-toolbox-tabs">
                {tabs.map(tab => (
                    <li
                        key={tab.id}
                        className={`media-toolbox-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                    </li>
                ))}
            </ul>

            <div className="media-toolbox-content">
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
                <div style={{ display: activeTab === 'paste_image' ? 'block' : 'none' }}>
                    {components.paste_image}
                </div>
                <div style={{ display: activeTab === 'generate' ? 'block' : 'none' }}>
                    {components.generate}
                </div>
            </div>
        </div>
    );
};

export default MediaToolbox;