/*
#name: DigMedia
*/
import React, { useState } from 'react';
import "./DigMedia.css";
const DigMedia = ({ onSelectMedia, currentFolder }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [digging, setDigging] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');

    // Google Custom Search API credentials
    const API_KEY = 'AIzaSyCn7uv7782yUTY-CugR9YxeDW3c-57EKSE';
    const CX = '000897981024708010815:fkz9bsrweqm';

    const handleDig = async () => {
        if (!searchQuery.trim()) {
            setError('Please enter a search term');
            return;
        }

        setDigging(true);
        setError('');
        setImages([]);
        setSelectedImage(null);

        try {
            const query = encodeURIComponent(searchQuery);
            const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${CX}&key=${API_KEY}&searchType=image`;
console.log(url);
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'API Error');
            }

            if (data.items && data.items.length > 0) {
                const imageResults = data.items.map((item, index) => ({
                    id: index,
                    url: item.link,
                    title: item.title,
                    snippet: item.snippet,
                    width: item.image?.width || 0,
                    height: item.image?.height || 0,
                    thumbnail: item.image?.thumbnailLink || item.link
                }));
                setImages(imageResults);

                // Auto-select the highest resolution image
                const highestResIndex = imageResults.reduce((maxIdx, img, idx) => {
                    const currentRes = img.width * img.height;
                    const maxRes = imageResults[maxIdx]?.width * imageResults[maxIdx]?.height || 0;
                    return currentRes > maxRes ? idx : maxIdx;
                }, 0);
                setSelectedImage(imageResults[highestResIndex]);
            } else {
                setError('No images found for your search');
            }
        } catch (error) {
            console.error('Error searching images:', error);
            setError(error.message || 'Failed to search images');
        } finally {
            setDigging(false);
        }
    };

    const handleSelectImage = (image) => {
        setSelectedImage(image);
    };

    const handleImport = async () => {
        if (!selectedImage) {
            setError('Please select an image first');
            return;
        }

        setImporting(true);
        setError('');

        try {
            // Generate a clean filename from the title
            const cleanName = selectedImage.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 50);

            const filename = `${cleanName}_${Date.now()}.jpg`;

            // Download and save the image
            const response = await fetch('/api/v1/local/downloadExternalImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: selectedImage.url,
                    postName: filename,
                    subfolder: 'dig'
                })
            });

            const result = await response.json();
            const data = result?.data || result;

            if (data.success) {
                alert(`Successfully imported: ${selectedImage.title}`);
                if (onSelectMedia) {
                    onSelectMedia(data);
                }
                window.dispatchEvent(new CustomEvent('mediaUploaded'));
            } else {
                throw new Error(data.error || 'Import failed');
            }
        } catch (error) {
            console.error('Import error:', error);
            setError(error.message || 'Failed to import image');
        } finally {
            setImporting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="digmedia-container">
            <div className="digmedia-header">
                <h3>🔍 Google Image Search</h3>
                <p>Search for images using Google Custom Search API and import them directly</p>
            </div>

            <div className="digmedia-search">
                <input
                    type="text"
                    className="digmedia-input"
                    placeholder="Search for images (e.g., sunset, mountain, technology)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDig()}
                />
                <button
                    className="btn-dig"
                    onClick={handleDig}
                    disabled={digging || !searchQuery.trim()}
                >
                    {digging ? '🔍 Searching...' : '🔍 Search Images'}
                </button>
            </div>

            {error && (
                <div className="digmedia-error">
                    ⚠️ {error}
                </div>
            )}

            {digging && (
                <div className="digmedia-loading">
                    <div className="spinner"></div>
                    <p>Searching Google Images...</p>
                </div>
            )}

            {images.length > 0 && !digging && (
                <>
                    <div className="digmedia-toolbar">
                        <div className="selection-info">
                            {selectedImage ? '1 image selected' : 'No image selected'}
                        </div>
                        <button
                            className="btn-import-selected"
                            onClick={handleImport}
                            disabled={importing || !selectedImage}
                        >
                            {importing ? '📥 Importing...' : '📥 Import Selected Image'}
                        </button>
                    </div>

                    <div className="digmedia-gallery">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className={`digmedia-card ${selectedImage?.id === image.id ? 'selected' : ''}`}
                                onClick={() => handleSelectImage(image)}
                            >
                                <div className="digmedia-thumbnail">
                                    <img
                                        src={image.thumbnail}
                                        alt={image.title}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-4-3 3-4-4-6 6"%3E%3C/path%3E%3C/svg%3E';
                                        }}
                                    />
                                </div>
                                <div className="digmedia-info">
                                    <div className="digmedia-title" title={image.title}>
                                        {image.title.substring(0, 50)}
                                        {image.title.length > 50 ? '...' : ''}
                                    </div>
                                    <div className="digmedia-snippet">
                                        {image.snippet.substring(0, 60)}
                                        {image.snippet.length > 60 ? '...' : ''}
                                    </div>
                                    <div className="digmedia-resolution">
                                        📐 {image.width} x {image.height}
                                    </div>
                                </div>
                                {selectedImage?.id === image.id && (
                                    <div className="digmedia-checkmark">✓</div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default DigMedia;