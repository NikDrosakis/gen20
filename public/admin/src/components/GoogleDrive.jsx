// components/GoogleDrive.jsx - modified
import React, { useState, useEffect } from 'react';
import "./GoogleDrive.css";
const GoogleDrive = ({ onSelectMedia }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [currentFolder, setCurrentFolder] = useState('');
    const CLIENT_ID = '390020636315-u0mpt8dp97jcfb9pbqv87fj4odifrl23.apps.googleusercontent.com';
    const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

    useEffect(() => {
        const folder = localStorage.getItem('current_media_folder') || '';
        setCurrentFolder(folder);
    }, []);
    // Restore token from sessionStorage on mount
    useEffect(() => {
        const savedToken = sessionStorage.getItem('google_drive_token');
        const savedExpiry = sessionStorage.getItem('google_drive_token_expiry');

        if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry)) {
            setAccessToken(savedToken);
            setIsAuthenticated(true);
            listFiles(savedToken);
        } else {
            // Clear expired tokens
            sessionStorage.removeItem('google_drive_token');
            sessionStorage.removeItem('google_drive_token_expiry');
            loadGoogleScript();
        }
    }, []);

    const loadGoogleScript = () => {
        const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (script) script.remove();

        const newScript = document.createElement('script');
        newScript.src = 'https://accounts.google.com/gsi/client';
        newScript.async = true;
        newScript.defer = true;
        document.body.appendChild(newScript);
    };

    const handleAuthClick = () => {
        const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
                if (tokenResponse.access_token) {
                    // Save token with expiry (1 hour)
                    const expiry = Date.now() + 3600000;
                    sessionStorage.setItem('google_drive_token', tokenResponse.access_token);
                    sessionStorage.setItem('google_drive_token_expiry', expiry.toString());

                    setAccessToken(tokenResponse.access_token);
                    setIsAuthenticated(true);
                    listFiles(tokenResponse.access_token);
                }
            },
        });
        tokenClient.requestAccessToken();
    };

    const handleSignoutClick = () => {
        sessionStorage.removeItem('google_drive_token');
        sessionStorage.removeItem('google_drive_token_expiry');
        setAccessToken(null);
        setIsAuthenticated(false);
        setFiles([]);
    };

    // Rest of the component remains the same...
    const listFiles = async (token, pageToken = null) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                pageSize: '20',
                fields: 'nextPageToken, files(id, name, mimeType, size, webContentLink, thumbnailLink, modifiedTime, iconLink)',
                orderBy: 'modifiedTime desc',
                q: searchQuery ? `name contains '${searchQuery}' and (mimeType contains 'image/' or mimeType contains 'video/')` : "mimeType contains 'image/' or mimeType contains 'video/'"
            });
            if (pageToken) {
                params.append('pageToken', pageToken);
            }

            const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.error) {
                console.error('API Error:', data.error);
                if (data.error.code === 401) {
                    // Token expired, clear session
                    sessionStorage.removeItem('google_drive_token');
                    sessionStorage.removeItem('google_drive_token_expiry');
                    setIsAuthenticated(false);
                    setAccessToken(null);
                }
                return;
            }

            const files_data = (data.files || []).map(file => ({
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: file.size,
                webContentLink: file.webContentLink,
                thumbnailLink: file.thumbnailLink || file.iconLink,
                modifiedTime: file.modifiedTime
            }));

            if (pageToken) {
                setFiles(prev => [...prev, ...files_data]);
            } else {
                setFiles(files_data);
            }
            setNextPageToken(data.nextPageToken);
        } catch (error) {
            console.error('Error listing files:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (nextPageToken && accessToken) {
            listFiles(accessToken, nextPageToken);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (accessToken) {
            listFiles(accessToken);
        }
    };

    const downloadAndImport = async (file) => {
        if (!accessToken) return;
        const targetFolder = currentFolder || localStorage.getItem('current_media_folder');

        if (!targetFolder) {
            alert('⚠️ Δεν έχει επιλεγεί φάκελος. Πήγαινε στο Media Manager και διάλεξε φάκελο πρώτα.');
            return;
        }

        setDownloading(true);
        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const blob = await response.blob();

            const formData = new FormData();
            formData.append('upload_image', blob, file.name);
            formData.append('folder', targetFolder);
            formData.append('caption', `Imported from Google Drive: ${file.name}`);

            const uploadResponse = await fetch(`${window.location.origin}/api/v1/local/uploadFile`, {
                method: 'POST',
                body: formData
            });

            const result = await uploadResponse.json();
            console.log('[GoogleDrive Import] Upload result:', result);
            console.log('[GoogleDrive Import] Folder:', targetFolder);

            if (result.success === true) {
                alert(`Successfully imported: ${file.name}`);
                if (onSelectMedia) {
                    onSelectMedia(result.data);
                }
                window.dispatchEvent(new CustomEvent('mediaUploaded'));
            } else {
                alert('Failed to import: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error importing file:', error);
            alert('Error importing file: ' + error.message);
        } finally {
            setDownloading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="google-drive-container">
                <div className="google-drive-auth">
                    <div className="integration-icon">☁️</div>
                    <h3>Google Drive Integration</h3>
                    <p>Connect your Google Drive to import images and videos</p>
                    <button className="btn-google" onClick={handleAuthClick}>
                        <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>
                    <p className="auth-note">You need to configure Google Drive API first. <a href="https://developers.google.com/drive/api/quickstart/js" target="_blank">Learn how</a></p>
                </div>
            </div>
        );
    }

    return (
        <div className="google-drive-container">
            <div className="google-drive-header">
                <div className="drive-info">
                    <span className="drive-icon">☁️</span>
                    <h3>Google Drive</h3>
                </div>
                <button className="btn-signout" onClick={handleSignoutClick}>
                    Sign Out
                </button>
            </div>

            <div className="drive-search">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn-search">Search</button>
                </form>
            </div>

            {downloading && (
                <div className="downloading-overlay">
                    <div className="downloading-modal">
                        <div className="spinner"></div>
                        <p>Downloading and importing...</p>
                    </div>
                </div>
            )}

            <div className="drive-files">
                {loading && files.length === 0 && (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading files from Google Drive...</p>
                    </div>
                )}

                <div className="files-grid">
                    {files.map(file => (
                        <div key={file.id} className="drive-file-card">
                            <div className="file-thumbnail">
                                {file.thumbnailLink ? (
                                    <img src={file.thumbnailLink} alt={file.name} />
                                ) : (
                                    <div className="file-placeholder">
                                        <span className="file-icon">🖼️</span>
                                    </div>
                                )}
                            </div>
                            <div className="file-info">
                                <div className="file-name" title={file.name}>
                                    {file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name}
                                </div>
                                <div className="file-meta">
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                    <span className="file-date">{formatDate(file.modifiedTime)}</span>
                                </div>
                                <button
                                    className="btn-import"
                                    onClick={() => downloadAndImport(file)}
                                    disabled={downloading}
                                >
                                    📥 Import
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {nextPageToken && (
                    <div className="load-more">
                        <button onClick={loadMore} className="btn-load-more" disabled={loading}>
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}

                {!loading && files.length === 0 && (
                    <div className="empty-state">
                        <p>📂 No images found in your Google Drive</p>
                        <p className="hint">Upload some images to Google Drive first</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleDrive;