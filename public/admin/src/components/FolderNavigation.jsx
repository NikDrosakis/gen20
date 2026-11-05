/*
#name: FolderNavigation
*/
import React, { useState } from 'react';
import "./FolderNavigation.css";

const FolderNavigation = ({ currentFolder, subdirectories, mediaInfo, MEDIA_ROOT, onFolderChange, onRefresh }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            alert('Please enter a folder name');
            return;
        }

        // Sanitize folder name - remove invalid characters
        const sanitizedName = newFolderName.trim().replace(/[<>:"/\\|?*]/g, '');
        if (sanitizedName !== newFolderName.trim()) {
            alert('Folder name contains invalid characters. Please use only letters, numbers, spaces, and underscores.');
            return;
        }

        setIsCreating(true);
        try {
            // Direct API call to create folder
            const response = await fetch('/api/v1/local/createFolder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    parentPath: currentFolder,
                    folderName: sanitizedName
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(`Folder "${sanitizedName}" created successfully!`);
                setShowCreateModal(false);
                setNewFolderName('');

                // CRITICAL: Force refresh the current folder to show new subdirectory
                if (onRefresh) {
                    await onRefresh(currentFolder);
                } else {
                    // Fallback: reload same folder
                    onFolderChange(currentFolder);
                }
            } else {
                alert(result.error || 'Failed to create folder');
            }
        } catch (error) {
            console.error('Error creating folder:', error);
            alert('Error creating folder: ' + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <div className="media-toolbar">
                <div className="folder-selector">
                    <label>Current Folder: </label>
                    <select
                        value={currentFolder}
                        onChange={(e) => onFolderChange(e.target.value)}
                        className="folder-select"
                        style={{ minWidth: '250px' }}
                    >
                        <option value={MEDIA_ROOT}>📁 Root ({mediaInfo.basefolder || 'media'})</option>
                        {subdirectories && subdirectories.length > 0 ? (
                            subdirectories.map((subfolder, index) => (
                                <option key={`${subfolder.path}_${index}`} value={subfolder.path}>
                                    📁 {subfolder.name} ({subfolder.file_count || 0} files)
                                </option>
                            ))
                        ) : null}
                    </select>

                    <button
                        className="btn-primary btn-small"
                        onClick={() => setShowCreateModal(true)}
                        style={{ marginLeft: '10px' }}
                        title="Create new folder"
                    >
                        📁+ New Folder
                    </button>

                    {mediaInfo.canGoUp && (
                        <button
                            className="btn-secondary btn-small"
                            onClick={() => onFolderChange(mediaInfo.parentFolder)}
                            title="Go up to parent folder"
                            style={{ marginLeft: '5px' }}
                        >
                            ⬆ Up
                        </button>
                    )}

                    {/* ADD REFRESH BUTTON */}
                    <button
                        className="btn-secondary btn-small"
                        onClick={() => onRefresh && onRefresh(currentFolder)}
                        title="Refresh folder list"
                        style={{ marginLeft: '5px' }}
                    >
                        🔄 Refresh
                    </button>
                </div>
                <div className="media-stats">
                    <span>📁 {subdirectories?.length || 0} folder(s)</span>
                    <span>📄 {mediaInfo.total || 0} file(s)</span>
                </div>
            </div>

            {/* Create Folder Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => !isCreating && setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Folder</h3>
                        <div className="modal-body">
                            <p>Location: <strong>{currentFolder}</strong></p>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Enter folder name"
                                autoFocus
                                disabled={isCreating}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                disabled={isCreating}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                disabled={isCreating}
                                className="btn-primary"
                            >
                                {isCreating ? 'Creating...' : 'Create Folder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FolderNavigation;