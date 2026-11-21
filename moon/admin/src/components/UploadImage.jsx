// components/UploadImage.jsx
import React, { useState, useEffect } from 'react';
import "./UploadImage.css";

const UploadImage = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (selectedFiles.length === 0) {
            setPreviews([]);
            return;
        }
        const urls = selectedFiles.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [selectedFiles]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const images = files.filter((f) => f.type.startsWith('image/'));
        if (images.length === 0) {
            alert('Please select image files');
            e.target.value = '';
            return;
        }
        setSelectedFiles(images);
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (selectedFiles.length === 0) {
            alert('Please select files');
            return;
        }

        setUploading(true);

        let successCount = 0;
        const errors = [];

        for (const file of selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('upload_image', file);
                if (caption) {
                    formData.append('caption', caption);
                }

                // NO Content-Type header - browser handles it
                const response = await fetch('/api/v1/local/uploadFile', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log('Upload response:', file.name, result);

                if (result.success === true) {
                    successCount++;
                } else {
                    errors.push(`${file.name}: ${result.error || 'failed'}`);
                }
            } catch (error) {
                console.error('Error uploading file:', file.name, error);
                errors.push(`${file.name}: ${error.message}`);
            }
        }

        if (successCount > 0) {
            alert(`${successCount} file(s) uploaded successfully${errors.length ? `, ${errors.length} failed` : ''}`);
            setSelectedFiles([]);
            setCaption('');
            setPreviews([]);
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            if (onUploadComplete) {
                onUploadComplete();
            }
            window.dispatchEvent(new CustomEvent('mediaUploaded'));
        } else {
            alert('Upload failed: ' + errors.join('; '));
        }

        setUploading(false);
    };

    return (
        <div className="upload-container">
            <form onSubmit={handleUpload}>
                <div className="form-group">
                    <label>Select Images (multiple):</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="file-input"
                    />
                    {selectedFiles.length > 0 && (
                        <small className="image-uploader-hint">
                            {selectedFiles.length} file(s) selected
                        </small>
                    )}
                </div>

                {previews.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {previews.map((url, i) => (
                            <div key={i} style={{ width: 80, height: 80, overflow: 'hidden', borderRadius: 6, border: '1px solid #ddd' }}>
                                <img src={url} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="form-group">
                    <label>Caption (optional, applies to all):</label>
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Enter caption"
                        className="caption-input"
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={uploading || selectedFiles.length === 0}
                >
                    {uploading
                        ? '📤 Uploading...'
                        : `📤 Upload ${selectedFiles.length > 0 ? selectedFiles.length + ' ' : ''}Image${selectedFiles.length === 1 ? '' : 's'}`}
                </button>
            </form>
        </div>
    );
};

export default UploadImage;
