// components/ImageUploader.jsx
import { useState, useEffect } from 'react';

const ImageUploader = ({
                           value,
                           onChange,
                           identifier,      // Can be postName, userId, or any unique identifier
                           folder = 'blog', // Folder under media (blog, avatars, media, etc.)
                           basePath = '/media/', // Base URL path
                           placeholder = 'filename.jpg',
                           label = 'Image path',
                           initialUrl = '',
                           hint = 'Only filename (e.g., my-image.jpg)',
                           accept = 'image/*',
                           onUploadComplete
                       }) => {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [localPath, setLocalPath] = useState(value || '');
    const [externalUrl, setExternalUrl] = useState(initialUrl || '');
    const [previewUrl, setPreviewUrl] = useState(value || '');

    // Sync with external value changes
    useEffect(() => {
        setLocalPath(value || '');
        setPreviewUrl(value || '');
    }, [value]);

    // Build full image URL
    const getFullImageUrl = (imgPath) => {
        if (!imgPath) return '';
        if (imgPath.startsWith('http')) return imgPath;
        if (imgPath.startsWith('/')) return imgPath;
        return `${basePath}${folder}/${imgPath}`;
    };

    // Download external image API call
    const downloadExternalImage = async (url, name) => {
        console.log('📡 Downloading:', url);

        try {
            const response = await fetch('/api/v1/local/downloadExternalImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl: url,
                    postName: name || `temp_${Date.now()}`,
                    subfolder: folder
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📦 Download result:', data);
            return data;

        } catch (error) {
            console.error('❌ Fetch error:', error);
            return { success: false, error: error.message };
        }
    };

    // Perform download and update
    const performDownload = async (url) => {
        const name = identifier || `image_${Date.now()}`;

        setSaving(true);
        setMessage('Downloading image...');

        const response = await downloadExternalImage(url, name);
        const result = response?.data || response;

        if (result && result.success === true) {
            let filename = '';

            if (result.filename) {
                filename = result.filename;
            } else if (result.local_url) {
                filename = result.local_url.split('/').pop();
            }

            if (filename) {
                setLocalPath(filename);
                setPreviewUrl(getFullImageUrl(filename));
                onChange(filename);
                setMessage('✅ Image saved locally!');
                setExternalUrl('');

                if (onUploadComplete) {
                    onUploadComplete(filename);
                }
            } else {
                setMessage('❌ Failed: Could not extract filename');
            }
        } else {
            setMessage('❌ Failed: ' + (result?.error || 'Unknown error'));
        }

        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleLocalPathChange = (e) => {
        const newPath = e.target.value;
        setLocalPath(newPath);

        if (newPath && !newPath.startsWith('http') && !newPath.startsWith('/')) {
            setPreviewUrl(getFullImageUrl(newPath));
        } else {
            setPreviewUrl(newPath);
        }
        onChange(newPath);
    };

    const handleExternalUrlChange = (e) => {
        setExternalUrl(e.target.value);
    };

    const handleDownload = async () => {
        if (externalUrl && (externalUrl.startsWith('http://') || externalUrl.startsWith('https://'))) {
            await performDownload(externalUrl);
        } else {
            setMessage('⚠️ Please enter a valid http:// or https:// URL');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    return (
        <>
            <div className="image-preview-container">
                {previewUrl ? (
                    <img
                        key={previewUrl}
                        src={getFullImageUrl(previewUrl)}
                        alt="Preview"
                        className="image-preview"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-4-3 3-4-4-6 6"%3E%3C/path%3E%3C/svg%3E';
                            e.target.onerror = null;
                        }}
                    />
                ) : (
                    <div className="image-placeholder">
                        <span className="image-placeholder-icon">🖼️</span>
                        <span className="image-placeholder-text">No image</span>
                    </div>
                )}
            </div>

            {/* Local Path Input (editable) */}
            <div className="image-uploader-group">
                <label className="image-uploader-label">{label}:</label>
                <input
                    type="text"
                    className="form-input"
                    value={localPath}
                    onChange={handleLocalPathChange}
                    placeholder={placeholder}
                />
                <small className="image-uploader-hint">
                    {hint} Full path: {basePath}{folder}/
                </small>
            </div>

            {/* External URL Input with Download Button */}
            <div className="image-uploader-group">
                <label className="image-uploader-label">Or download from URL:</label>
                <div className="image-uploader-row">
                    <input
                        type="text"
                        className="form-input"
                        value={externalUrl}
                        onChange={handleExternalUrlChange}
                        placeholder="https://example.com/image.jpg"
                    />
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={saving || !externalUrl}
                        className="btn-select-image"
                    >
                        {saving ? '⏳...' : '📥 Download'}
                    </button>
                </div>
                {saving && <span className="info-message">⏳ {message}</span>}
                {!saving && message && (
                    <span className={message.includes('✅') ? 'success-message' : 'error-message'}>
                        {message}
                    </span>
                )}
            </div>
        </>
    );
};

export default ImageUploader;