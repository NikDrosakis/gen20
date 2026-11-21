// components/MediaGallery.jsx
import React, { memo } from 'react';

const MediaGallery = memo(({ files, selectedImage, mediaInfo, onImageClick, onDragStart, onDelete }) => {
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
                // Build full URL + thumb URL (copy στο thumbs/)
                let fileUrl, thumbUrl;
                if (mediaInfo.urlfolder && mediaInfo.urlfolder.startsWith('http')) {
                    fileUrl = `${mediaInfo.urlfolder}${file}`;
                    thumbUrl = `${mediaInfo.urlfolder}thumbs/${file}`;
                } else if (mediaInfo.urlfolder) {
                    fileUrl = `${window.location.origin}${mediaInfo.urlfolder}${file}`;
                    thumbUrl = `${window.location.origin}${mediaInfo.urlfolder}thumbs/${file}`;
                } else {
                    fileUrl = `/media/${file}`;
                    thumbUrl = `/media/thumbs/${file}`;
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
                        <button
                            className="media-delete-btn"
                            title="Delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onDelete) onDelete(file);
                            }}
                        >
                            ✕
                        </button>
                        {isImage ? (
                            <img
                                src={thumbUrl}
                                alt={file}
                                loading="eager"
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
