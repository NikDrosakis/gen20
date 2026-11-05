// components/ImageFromUrl.jsx
import React, { useState } from 'react';

const ImageFromUrl = (ζ) => {
    const [urlImage, setUrlImage] = useState({ url: '', caption: '' });
    const [uploading, setUploading] = useState(false);
    const currentFolder = localStorage.getItem('current_media_folder') || '';

    const handleUrlUpload = async () => {
        if (!urlImage.url) {
            alert('Please enter a URL');
            return;
        }

        setUploading(true);
        try {
            const response = await fetch('/api.php?resource=media&action=uploadUrl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: urlImage.url,
                    caption: urlImage.caption,
                    folder: currentFolder
                })
            });
            const result = await response.json();

            if (result.success) {
                alert('Image added successfully!');
                setUrlImage({ url: '', caption: '' });
                window.dispatchEvent(new CustomEvent('mediaUploaded'));
            } else {
                alert(result.error || 'Failed to add image from URL');
            }
        } catch (error) {
            console.error('Error uploading from URL:', error);
            alert('Failed to add image from URL');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="tab-content">
            <div className="form-group">
                <label>Image URL:</label>
                <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={urlImage.url}
                    onChange={(e) => setUrlImage({ ...urlImage, url: e.target.value })}
                    className="url-input"
                />
            </div>
            <div className="form-group">
                <label>Caption (optional):</label>
                <input
                    type="text"
                    placeholder="Enter caption"
                    value={urlImage.caption}
                    onChange={(e) => setUrlImage({ ...urlImage, caption: e.target.value })}
                />
            </div>
            <button className="btn-primary" onClick={handleUrlUpload} disabled={uploading}>
                {uploading ? '⏳ Adding...' : '🔗 Add from URL'}
            </button>
            {urlImage.url && (
                <div className="url-preview">
                    <p>Preview:</p>
                    <img src={urlImage.url} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} onError={(e) => e.target.style.display = 'none'} />
                </div>
            )}
        </div>
    );
};

export default ImageFromUrl;