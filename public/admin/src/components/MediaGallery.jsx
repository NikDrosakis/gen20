// components/MediaGallery.jsx
import React, { memo } from 'react';

const MediaGallery = memo(({ files, selectedImage, mediaInfo, onImageClick, onDragStart }) => {
    if (files.length === 0) {
        return (
            <div className="empty-state">
                <p>📂 No files found in this folder</p>
                <p className="hint">Upload some images to get started</p>
            </div>
        );
    }

    return (
        <div className="media-gallery">
            {files.map((file) => {
                // FIX: Build URL correctly
                let fileUrl;
                if (mediaInfo.urlfolder && mediaInfo.urlfolder.startsWith('http')) {
                    // If urlfolder is full URL, append filename
                    fileUrl = `${mediaInfo.urlfolder}${file}`;
                } else if (mediaInfo.urlfolder) {
                    // If urlfolder is relative path
                    fileUrl = `${window.location.origin}${mediaInfo.urlfolder}${file}`;
                } else {
                    // Fallback
                    fileUrl = `/media/${file}`;
                }

                const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(file);

                return (
                    <div
                        key={file}
                        className={`media-item ${selectedImage === file ? 'selected' : ''}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, file, fileUrl)}
                        onClick={() => onImageClick(file)}
                    >
                        {isImage ? (
                            <img
                                src={fileUrl}
                                alt={file}
                                loading="eager"
                                onError={(e) => {
                                    e.target.src = '/icons.svg';
                                }}
                            />
                        ) : (
                            <div className="file-icon">
                                📄
                            </div>
                        )}
                        <span className="media-name" title={file}>
                            {file.length > 30 ? file.substring(0, 27) + '...' : file}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}, (prevProps, nextProps) => {
    // Deep comparison for files array
    if (prevProps.files.length !== nextProps.files.length) return false;
    for (let i = 0; i < prevProps.files.length; i++) {
        if (prevProps.files[i] !== nextProps.files[i]) return false;
    }
    return prevProps.selectedImage === nextProps.selectedImage &&
        prevProps.mediaInfo.urlfolder === nextProps.mediaInfo.urlfolder;
});

export default MediaGallery;