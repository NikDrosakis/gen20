// components/ImagePreview.jsx
import React from 'react';
import "./ImagePreview.css";
const ImagePreview = ({ filename, mediaInfo, onClose, onSelect, onDelete }) => {
    const imageUrl = `${mediaInfo.urlfolder}${filename}`;
    const folder = mediaInfo.currentFolder || mediaInfo.folderName || 'media';

    return (
        <div className="image-preview-modal" onClick={onClose}>
            <div className="preview-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>

                <img
                    alt={filename}
                    className="preview-image"
                    src={imageUrl}
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />

                <div className="preview-info">
                    <p><strong>Filename:</strong> {filename}</p>
                    <p><strong>Folder:</strong> {folder}</p>
                    <p>
                        <strong>URL:</strong>
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer"> Open</a>
                    </p>
                </div>

                <div className="preview-actions">
                    <button className="btn-primary" onClick={() => onSelect(filename)}>
                        ✓ Select This Image
                    </button>
                    <button className="btn-danger" onClick={() => onDelete(filename)}>
                        🗑 Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImagePreview;