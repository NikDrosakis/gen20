// components/MediaManager.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import FolderNavigation from './FolderNavigation';
import MediaGallery from './MediaGallery';
import ImagePreview from './ImagePreview';
import Pagination from './Pagination';

const MediaManager = () => {
    const [files, setFiles] = useState([]);
    const [subdirectories, setSubdirectories] = useState([]);
    const [currentFolder, setCurrentFolder] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 20 });
    const [mediaInfo, setMediaInfo] = useState({
        basefolder: '',
        urlfolder: '',
        parentFolder: '',
        folderName: '',
        canGoUp: false
    });

    // Refs
    const isInitialMount = useRef(true);
    const abortControllerRef = useRef(null);
    const isLoadingRef = useRef(false);
    const lastLoadedFolderRef = useRef('');
    const lastLoadedPageRef = useRef(1);
    const filesCacheRef = useRef(new Map()); // Cache for files arrays
    const MEDIA_ROOT = `/var/www/gs/media/${window.location.hostname}`;
    const SITE_URL = `https://${window.location.hostname}/`;
    const API_BASE = '/api/v1/local';

    const loadMedia = useCallback(async (folder, page = 1, limit = 20, force = false) => {

        if (!force && lastLoadedFolderRef.current === folder && lastLoadedPageRef.current === page) return;
        if (isLoadingRef.current && !force) return;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        isLoadingRef.current = true;
        setLoading(true);

        try {
            let url = `${API_BASE}/getMedia?page=${page}&limit=${limit}`;
            if (folder) {
                url += `&folder=${encodeURIComponent(folder)}`;
            }

            const response = await fetch(url, {
                signal: abortController.signal
            });
            const result = await response.json();
console.log(result);
            if (result.success && result.data) {
                lastLoadedFolderRef.current = folder;
                lastLoadedPageRef.current = page;

                const cacheKey = `${folder}_${page}_${limit}`;
                const cachedFiles = filesCacheRef.current.get(cacheKey);

                // FIX: Only update if files actually changed
                const newFiles = result.data.files || [];
                const filesChanged = !cachedFiles ||
                    cachedFiles.length !== newFiles.length ||
                    cachedFiles.some((f, i) => f !== newFiles[i]);
                // FIX: Build correct urlfolder
                const baseUrl = `https://${window.location.hostname}`;

                if (filesChanged) {
                    setFiles(newFiles);
                    filesCacheRef.current.set(cacheKey, newFiles);
                }
                let relativePath = folder.replace(MEDIA_ROOT, '');
                if (!relativePath.startsWith('/')) {
                    relativePath = '/' + relativePath;
                }
                setSubdirectories(result.data.subdirectories || []);
                const correctUrlfolder = result.data.urlfolder;
                setMediaInfo({
                    basefolder: result.data.basefolder || '',
                    urlfolder: correctUrlfolder,
                    parentFolder: result.data.parentFolder || '',
                    folderName: result.data.folderName || '',
                    canGoUp: result.data.canGoUp || false,
                    total: result.data.total || 0
                });
                setPagination({
                    currentPage: result.data.page || page,
                    totalPages: Math.ceil((result.data.total || 0) / limit),
                    total: result.data.total || 0,
                    limit: limit
                });
                setCurrentFolder(result.data.currentFolder || folder);
               ;
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error loading media:', error);
            }
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [API_BASE, SITE_URL, MEDIA_ROOT]);

    const handleFolderChange = useCallback((folderPath) => {
        setCurrentFolder(folderPath);
        localStorage.setItem('current_media_folder', folderPath);
        loadMedia(folderPath, 1, 20);
    }, [loadMedia]);

    const handleSelectMedia = useCallback((filename) => {
        const selectedMedia = {
            filename: filename,
            url: `${mediaInfo.urlfolder}${filename}`,
            folder: currentFolder,
            timestamp: Date.now()
        };
        localStorage.setItem('selected_media', JSON.stringify(selectedMedia));
        window.dispatchEvent(new CustomEvent('mediaSelected', { detail: selectedMedia }));
        console.log(`Selected: ${filename}`);
        setSelectedImage(null);
    }, [mediaInfo.urlfolder, currentFolder]);

    const handleDeleteMedia = useCallback(async (filename) => {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

        try {
            const response = await fetch('/api/v1/local/deleteMedia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: filename,
                    folder: currentFolder
                })
            });
            const result = await response.json();

            if (result.error) {
                alert(`❌ ${result.error}`);
            } else {
                // Clear cache
                const cacheKey = `${currentFolder}_${pagination.currentPage}_${pagination.limit}`;
                filesCacheRef.current.delete(cacheKey);

                // Απλά φόρτωσε ξανά τα media
                loadMedia(currentFolder, pagination.currentPage, pagination.limit,true);

                // Ενημέρωση με notification αντί για alert
                console.log('✅ File deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting media:', error);
            alert('❌ Delete failed: ' + error.message);
        }
    }, [currentFolder, loadMedia, pagination.currentPage, pagination.limit]);
    const handlePageChange = useCallback((page) => {
        loadMedia(currentFolder, page, pagination.limit);
    }, [loadMedia, currentFolder, pagination.limit]);

    // components/media/MediaManager.jsx
    const handleRefresh = useCallback(async (folder) => {
        // Clear cache for this folder
        const cacheKey = `${folder}_${pagination.currentPage}_${pagination.limit}`;
        filesCacheRef.current.delete(cacheKey);
        // Force reload
        await loadMedia(folder, pagination.currentPage, pagination.limit,true);
    }, [loadMedia, pagination.currentPage, pagination.limit]);

//refresh after upload
    useEffect(() => {
        const handler = () => handleRefresh(currentFolder);
        window.addEventListener('mediaUploaded', handler);
        return () => window.removeEventListener('mediaUploaded', handler);
    }, [currentFolder, handleRefresh]);

    // Clear cache when folder changes
    useEffect(() => {
        if (!isInitialMount.current) {
            filesCacheRef.current.clear();
        }
    }, [currentFolder]);

    // Initial load
    useEffect(() => {
        if (isInitialMount.current) {
            const savedFolder = localStorage.getItem('current_media_folder') || MEDIA_ROOT;
            setCurrentFolder(savedFolder);
            loadMedia(savedFolder, 1, 20);
            isInitialMount.current = false;
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [MEDIA_ROOT, loadMedia]);

    console.log('[MediaManager] State:', {
        files,
        filesCount: files.length,
        currentFolder,
        mediaInfo
    });
    console.log('[MediaManager] Render branch:', {
        loading,
        filesCount: files.length,
        willRenderGallery: !loading
    });
    return (
        <div className="media-manager-content">
            <FolderNavigation
                currentFolder={currentFolder}
                subdirectories={subdirectories}
                mediaInfo={mediaInfo}
                MEDIA_ROOT={MEDIA_ROOT}
                onFolderChange={handleFolderChange}
                onRefresh={handleRefresh}
            />

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading media...</p>
                </div>
            ) : (
                <>
                    <MediaGallery
                        files={files}
                        selectedImage={selectedImage}
                        mediaInfo={mediaInfo}
                        onImageClick={setSelectedImage}
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
                            onSelect={() => handleSelectMedia(selectedImage)}
                            onDelete={() => handleDeleteMedia(selectedImage)}
                        />
                    )}

                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default MediaManager;