// components/superadmin/FilesystemManager.jsx
import React, { useState } from 'react';

const FilesystemManager = ({ filesystem }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Transform the object into an array for easier filtering
    const filesystemArray = filesystem && typeof filesystem === 'object' && !Array.isArray(filesystem)
        ? Object.entries(filesystem).map(([name, path]) => ({ name, path }))
        : Array.isArray(filesystem)
            ? filesystem
            : [];

    const filteredFilesystem = filesystemArray.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.path?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="tab-pane">
            <div className="section-header">
                <h2>Filesystem Structure</h2>
                <input
                    type="text"
                    placeholder="Search files or domains..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <div className="stats-badge">
                Total directories: {filesystemArray.length}
            </div>
            <div className="filesystem-grid">
                {filteredFilesystem.length === 0 ? (
                    <div className="empty-state">
                        {searchTerm ? 'No matching filesystem entries found' : 'No filesystem entries found'}
                    </div>
                ) : (
                    filteredFilesystem.map((dir, idx) => (
                        <div key={idx} className="fs-card">
                            <div className="fs-icon">📁</div>
                            <div className="fs-info">
                                <strong>{dir.name}</strong>
                                <span className="fs-path">{dir.path}</span>
                            </div>
                            <div className="fs-actions">
                                <button
                                    className="btn-small"
                                    onClick={() => navigator.clipboard.writeText(dir.path)}
                                    title="Copy path"
                                >
                                    📋 Copy
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FilesystemManager;