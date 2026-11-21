// components/MediaManager.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MediaGallery from './MediaGallery';
import ImagePreview from './ImagePreview';
import Pagination from './Pagination';

const MediaManager = ({ onSelectMedia }) => {
    const [files, setFiles] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 40 });
    const [mediaInfo, setMediaInfo] = useState({
        basefolder: '',
        urlfolder: '',
    });

    // Refs
    const abortControllerRef = useRef(null);
    const isLoadingRef = useRef(false);
    const lastLoadedPageRef = useRef(0);
    const filesCacheRef = useRef(new Map());
    const API_BASE = '/api/v1/local';

    const loadMedia = useCallback(async (page = 1, limit = 40, force = false) => {
        if (!force && lastLoadedPageRef.current === page) return;
        if (isLoadingRef.current && !force) return;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        isLoadingRef.current = true;
        setLoading(true);

        try {
            const url = `${API_BASE}/getMedia?page=${page}&limit=${limit}`;
            const response = await fetch(url, { signal: abortController.signal });
            const result = await response.json();

            if (result.success && result.data) {
                lastLoadedPageRef.current = page;

                const cacheKey = `${page}_${limit}`;

                const newFiles = result.data.files || [];
                setFiles(newFiles);
                filesCacheRef.current.set(cacheKey, newFiles);

                setMediaInfo({
                    basefolder: result.data.basefolder || '',
                    urlfolder: result.data.urlfolder,
                });
                setPagination({
                    currentPage: result.data.page || page,
                    totalPages: Math.ceil((result.data.total || 0) / limit),
                    total: result.data.total || 0,
                    limit: limit
                });
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error loading media:', error);
            }
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [API_BASE]);

    const handleSelectMedia = useCallback((filename) => {
        const selectedMedia = {
            filename: filename,
            url: `${mediaInfo.urlfolder}${filename}`,
            timestamp: Date.now()
        };
        localStorage.setItem('selected_media', JSON.stringify(selectedMedia));
        window.dispatchEvent(new CustomEvent('mediaSelected', { detail: selectedMedia }));
        if (onSelectMedia) onSelectMedia(selectedMedia);
        console.log(`Selected: ${filename}`);
        setSelectedImage(null);
    }, [mediaInfo.urlfolder, onSelectMedia]);

    const handleDeleteMedia = useCallback(async (filename) => {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

        try {
            const response = await fetch('/api/v1/local/deleteMedia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: filename
                })
            });
            const result = await response.json();

            if (result.error) {
                alert(`❌ ${result.error}`);
            } else {
                const cacheKey = `${pagination.currentPage}_${pagination.limit}`;
                filesCacheRef.current.delete(cacheKey);
                loadMedia(pagination.currentPage, pagination.limit, true);
                console.log('✅ File deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('❌ Delete failed: ' + error.message);
        }
    }, [loadMedia, pagination.currentPage, pagination.limit]);

    const handlePageChange = useCallback((page) => {
        loadMedia(page, pagination.limit);
    }, [loadMedia, pagination.limit]);

    const handleRefresh = useCallback(async () => {
        const cacheKey = `${pagination.currentPage}_${pagination.limit}`;
        filesCacheRef.current.delete(cacheKey);
        await loadMedia(pagination.currentPage, pagination.limit, true);
    }, [loadMedia, pagination.currentPage, pagination.limit]);

    // refresh after upload
    useEffect(() => {
        const handler = () => handleRefresh();
        window.addEventListener('mediaUploaded', handler);
        return () => window.removeEventListener('mediaUploaded', handler);
    }, [handleRefresh]);

    // Initial load
    useEffect(() => {
        loadMedia(1, 40);
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [loadMedia]);

    return (
        <div className="media-manager-content">
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading media...</p>
                </div>
            ) : (
                <>
                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}

                    <MediaGallery
                        files={files}
                        selectedImage={selectedImage}
                        mediaInfo={mediaInfo}
                        onImageClick={setSelectedImage}
                        onDelete={handleDeleteMedia}
                        onDragStart={(e, filename, url) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify({
                                filename: filename,
                                url: url,
                                type: 'image'
                            }));
                        }}
                    />

                    {selectedImage && (
                        <ImagePreview
                            filename={selectedImage}
                            mediaInfo={mediaInfo}
                            onClose={() => setSelectedImage(null)}
                            onSelect={onSelectMedia ? () => handleSelectMedia(selectedImage) : null}
                            onDelete={() => handleDeleteMedia(selectedImage)}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default MediaManager;
