// components/UploadImage.jsx
import React, { useState, useEffect } from 'react';
import "./UploadImage.css";

const UploadImage = ({ onUploadComplete, currentFolder: propCurrentFolder }) => {
    const [uploading, setUploading] = useState(false);
    const [currentFolder, setCurrentFolder] = useState('');
    const [caption, setCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const folder = propCurrentFolder || localStorage.getItem('current_media_folder') || '';
        setCurrentFolder(folder);
    }, [propCurrentFolder]);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
        } else {
            alert('Please select an image file');
            e.target.value = '';
        }
    };


// components/media/UploadImage.jsx
    const handleUpload = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        if (!currentFolder) {
            alert('No folder selected');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('upload_image', selectedFile);
            formData.append('folder', currentFolder);
            if (caption) {
                formData.append('caption', caption);
            }

            // NO Content-Type header - browser handles it
            const response = await fetch('/api/v1/local/uploadFile', {  // CHANGE THIS
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('Upload response:', result);

            if (result.success === true) {
                alert('File uploaded successfully!');
                setSelectedFile(null);
                setCaption('');
                setPreview(null);
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';

                if (onUploadComplete) {
                    onUploadComplete();
                }
                window.dispatchEvent(new CustomEvent('mediaUploaded'));
            } else {
                alert(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <form onSubmit={handleUpload}>
                <div className="form-group">
                    <label>Upload to folder:</label>
                    <div className="current-folder-badge">
                        📁 {currentFolder || 'No folder selected'}
                    </div>
                </div>

                <div className="form-group">
                    <label>Select Image:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        required
                        className="file-input"
                    />
                </div>

                {preview && (
                    <div className="image-preview">
                        <img src={preview} alt="Preview" />
                    </div>
                )}

                <div className="form-group">
                    <label>Caption (optional):</label>
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
                    disabled={uploading || !selectedFile}
                >
                    {uploading ? '📤 Uploading...' : '📤 Upload Image'}
                </button>
            </form>
        </div>
    );
};

export default UploadImage;