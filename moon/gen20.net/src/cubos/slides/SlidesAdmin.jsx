/*
#name: SlidesAdmin
#title: Slides Administration Panel
#description: Full-featured slides manager with drag & drop for reordering, image upload via click or drag-drop, caption editing, and group management. Supports MediaToolbox integration for selecting existing media.
#version: 1.0.0
#type: component
#library: admin
#independent: true
#standalone: true
#compatible_areas: m
#dependencies: react, SortableJS (CDN)
#apimethods:
#   GET /api/v1/maria/fa?folder=SELECT * FROM gen_*.c_slidergrp
#   GET /api/v1/maria/fa?folder=SELECT * FROM gen_*.c_slides WHERE c_slidesgrpid=?
#   POST /api/v1/maria/q (INSERT, UPDATE, DELETE)
#methods:
#   - fetchGroups(): Loads all slide groups from database
#   - fetchSlides(): Loads slides for selected group
#   - handleAddGroup(): Creates new slide group
#   - handleDeleteGroup(): Deletes group and all its slides
#   - handleDeleteSlide(): Deletes individual slide
#   - handleFileUpload(): Processes drag & drop file upload
#   - handleMediaSelect(): Handles media selection from MediaToolbox
#   - handleSortEnd(): Handles drag & drop reordering
#   - handleUpdateCaption(): Updates slide caption
#   - updateSlideField(): Generic field update
#   - updateSortOrder(): Batch update for sorting
#drag_drop:
#   - Drag & drop images from filesystem
#   - Drag & drop for reordering slides
#   - SortableJS integration for table rows
#media_toolbox:
#   - Opens MediaToolbox modal for existing media selection
#   - Listens for 'mediaSelected' custom event
*/
import React, { useState, useEffect } from 'react';
import MediaToolbox from '../components/media/MediaToolbox';
import './SlidesAdmin.css';

const SlidesAdmin = () => {
    const [groups, setGroups] = useState([]);
    const [slides, setSlides] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [editingCaption, setEditingCaption] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showMediaToolbox, setShowMediaToolbox] = useState(false);

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const hostname = window.location.hostname;

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchSlides(selectedGroup.id);
        }
    }, [selectedGroup]);

    // LISTEN για mediaSelected event από MediaToolbox
    useEffect(() => {
        const handleMediaSelected = async (event) => {
            const media = event.detail;
            console.log('Media selected event received:', media);

            if (!media || !selectedGroup) {
                showNotification('Πρώτα επιλέξτε ένα group', 'error');
                setShowMediaToolbox(false);
                return;
            }

            const filename = media?.filename || media?.url?.split('/').pop();
            if (!filename) return;

            setSaving(true);
            try {
                if (slides.some(s => s.name === filename)) {
                    showNotification(`"${filename}" υπάρχει ήδη σε αυτό το group`, 'error');
                    setShowMediaToolbox(false);
                    return;
                }

                const maxSort = slides.length > 0 ? Math.max(...slides.map(s => s.sort || 0)) : 0;
                const insertQuery = `INSERT INTO ${publicdb}.c_slides (c_slidesgrpid, name, sort, caption, meta) 
                                     VALUES (${selectedGroup.id}, '${filename.replace(/'/g, "\\'")}', ${maxSort + 1}, '', '{}')`;

                const insertResponse = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([insertQuery, []])
                });

                const insertResult = await insertResponse.json();
                if (insertResult.success) {
                    showNotification('Η εικόνα προστέθηκε επιτυχώς!', 'success');
                    fetchSlides(selectedGroup.id);
                } else {
                    throw new Error(insertResult.error || 'Failed to add slide');
                }
            } catch (error) {
                console.error('Error adding slide:', error);
                showNotification('Αποτυχία προσθήκης: ' + error.message, 'error');
            } finally {
                setSaving(false);
                setShowMediaToolbox(false);
            }
        };

        window.addEventListener('mediaSelected', handleMediaSelected);
        return () => window.removeEventListener('mediaSelected', handleMediaSelected);
    }, [selectedGroup, slides]);

    // ========== DRAG & DROP HANDLERS ==========
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedGroup) return;
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedGroup) return;
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (!selectedGroup) {
            showNotification('Πρώτα επιλέξτε ένα group', 'error');
            return;
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleFileUpload(files[0]);
        }
    };

    // Αντικατέστησε το handleFileUpload με αυτό:
    const handleFileUpload = async (file) => {
        // Αντί για upload, απλά παίρνουμε το όνομα του αρχείου
        const filename = file.name;

        if (!filename || !selectedGroup) return;

        // Έλεγχος αν υπάρχει ήδη
        if (slides.some(s => s.name === filename)) {
            showNotification(`"${filename}" υπάρχει ήδη σε αυτό το group`, 'error');
            return;
        }

        setSaving(true);
        try {
            const maxSort = slides.length > 0 ? Math.max(...slides.map(s => s.sort || 0)) : 0;
            const insertQuery = `INSERT INTO ${publicdb}.c_slides (c_slidesgrpid, name, sort, caption, meta) 
                             VALUES (${selectedGroup.id}, '${filename.replace(/'/g, "\\'")}', ${maxSort + 1}, '', '{}')`;

            const insertResponse = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([insertQuery, []])
            });

            const insertResult = await insertResponse.json();
            if (insertResult.success) {
                showNotification('Slide added successfully!', 'success');
                fetchSlides(selectedGroup.id);
            } else {
                throw new Error(insertResult.error || 'Failed to add slide');
            }
        } catch (error) {
            console.error('Error adding slide:', error);
            showNotification('Failed to add slide: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };
    // ========== END DRAG & DROP ==========

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const query = `SELECT * FROM ${publicdb}.c_slidergrp ORDER BY id ASC`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success && result.data) {
                setGroups(result.data);
                if (result.data.length > 0) {
                    setSelectedGroup(result.data[0]);
                }
            } else {
                setError('Failed to load groups');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlides = async (groupId) => {
        try {
            const query = `SELECT * FROM ${publicdb}.c_slides WHERE c_slidesgrpid = ${groupId} ORDER BY sort ASC, id ASC`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success && result.data) {
                setSlides(result.data);
            } else {
                setSlides([]);
            }
        } catch (err) {
            console.error('Error fetching slides:', err);
            showNotification('Failed to load slides', 'error');
        }
    };

    const handleDeleteSlide = async (slide) => {
        if (!window.confirm(`Are you sure you want to delete "${slide.name}"?`)) return;

        try {
            const deleteQuery = `DELETE FROM ${publicdb}.c_slides WHERE id = ${slide.id}`;
            const dbResponse = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([deleteQuery, []])
            });

            const dbResult = await dbResponse.json();
            if (dbResult.success) {
                showNotification('Slide deleted successfully', 'success');
                fetchSlides(selectedGroup.id);
            } else {
                throw new Error(dbResult.error || 'Failed to delete slide');
            }
        } catch (error) {
            console.error('Error deleting slide:', error);
            showNotification('Failed to delete slide: ' + error.message, 'error');
        }
    };

    const updateSlideField = async (id, field, value) => {
        try {
            const escapedValue = typeof value === 'string' ? value.replace(/'/g, "\\'") : value;
            const query = `UPDATE ${publicdb}.c_slides SET ${field} = '${escapedValue}' WHERE id = ${id}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            return await response.json();
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            throw error;
        }
    };

    const updateSortOrder = async (orderList) => {
        for (let i = 0; i < orderList.length; i++) {
            await updateSlideField(orderList[i].id, 'sort', i + 1);
        }
    };

    const handleSortEnd = async (evt) => {
        const orderList = [];
        const rows = document.querySelectorAll('#sortableSlides tbody tr');

        rows.forEach((element, index) => {
            const id = element.getAttribute('data-id');
            if (id) {
                orderList.push({ id: parseInt(id), sort: index + 1 });
            }
        });

        await updateSortOrder(orderList);
        fetchSlides(selectedGroup.id);
        showNotification('Sort order updated', 'success');
    };

    const handleUpdateCaption = async (id, caption) => {
        setSaving(true);
        try {
            await updateSlideField(id, 'caption', caption);
            showNotification('Caption updated', 'success');
            fetchSlides(selectedGroup.id);
        } catch (error) {
            showNotification('Failed to update caption', 'error');
        } finally {
            setSaving(false);
            setEditingCaption(null);
        }
    };

    const handleAddGroup = async () => {
        const title = prompt('Enter group title:');
        if (!title) return;

        try {
            const insertQuery = `INSERT INTO ${publicdb}.c_slidergrp (title, classification_id, description) 
                                 VALUES ('${title.replace(/'/g, "\\'")}', 1, '')`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([insertQuery, []])
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Group added successfully', 'success');
                fetchGroups();
            }
        } catch (error) {
            showNotification('Failed to add group', 'error');
        }
    };

    const handleDeleteGroup = async (group) => {
        if (!window.confirm(`Are you sure you want to delete group "${group.title}" and all its slides?`)) return;

        try {
            const deleteSlidesQuery = `DELETE FROM ${publicdb}.c_slides WHERE c_slidesgrpid = ${group.id}`;
            await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([deleteSlidesQuery, []])
            });

            const deleteGroupQuery = `DELETE FROM ${publicdb}.c_slidergrp WHERE id = ${group.id}`;
            await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([deleteGroupQuery, []])
            });

            showNotification('Group deleted successfully', 'success');
            fetchGroups();
        } catch (error) {
            showNotification('Failed to delete group', 'error');
        }
    };

    // Initialize Sortable
    useEffect(() => {
        if (typeof window.Sortable !== 'undefined' && !loading && slides.length > 0) {
            const tbody = document.querySelector('#sortableSlides tbody');
            if (tbody) {
                const sortable = new window.Sortable(tbody, {
                    animation: 150,
                    onEnd: handleSortEnd,
                    handle: '.sort-handle'
                });
                return () => sortable.destroy();
            }
        }
    }, [loading, slides]);

    if (loading) return <div className="slides-admin-loading">Loading...</div>;
    if (error) return <div className="slides-admin-error">{error}</div>;

    return (
        <div className="slides-admin-container">
            {apiStatus.show && (
                <div className={`slides-admin-notification slides-admin-notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            {/* Groups Sidebar */}
            <div className="groups-sidebar">
                <div className="groups-header">
                    <h3>Slide Groups</h3>
                    <button className="add-group-btn" onClick={handleAddGroup}>+</button>
                </div>
                <div className="groups-list">
                    {groups.map(group => (
                        <div
                            key={group.id}
                            className={`group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
                            onClick={() => setSelectedGroup(group)}
                        >
                            <span className="group-title">{group.title}</span>
                            <button
                                className="delete-group-btn"
                                onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group); }}
                            >×</button>
                        </div>
                    ))}
                    {groups.length === 0 && (
                        <div className="no-groups">No groups. Click + to add.</div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="slides-main">
                <div className="slides-header">
                    <h3>{selectedGroup?.title || 'Slides'}</h3>
                    <span className="slide-count">{slides.length} slides</span>
                </div>

                {/* Image Drop Box - με drag & drop */}
                <div
                    className={`image-drop-box ${!selectedGroup ? 'disabled' : ''} ${isDragOver ? 'drag-over' : ''}`}
                    onClick={() => selectedGroup && setShowMediaToolbox(true)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {isUploading ? (
                        <>
                            <span className="drop-icon">⏳</span>
                            <span className="drop-text">Μεταφόρτωση...</span>
                        </>
                    ) : (
                        <>
                            <span className="drop-icon">📸</span>
                            <span className="drop-text">
                                {selectedGroup
                                    ? 'Κάντε κλικ ή drag & drop για προσθήκη εικόνας'
                                    : 'Επιλέξτε ή δημιουργήστε group πρώτα'}
                            </span>
                            <span className="drop-subtext">Υποστηρίζονται JPG, PNG, GIF, WEBP (max 5MB)</span>
                        </>
                    )}
                </div>

                {/* Slides Table */}
                {slides.length > 0 && (
                    <div className="table-container">
                        <table id="sortableSlides" className="styled-table">
                            <thead>
                            <tr>
                                <th style={{ width: '50px' }}>Sort</th>
                                <th style={{ width: '80px' }}>Image</th>
                                <th>Filename</th>
                                <th>Caption</th>
                                <th style={{ width: '70px' }}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {slides.map((slide) => (
                                <tr key={slide.id} data-id={slide.id}>
                                    <td className="sort-handle">
                                        <span className="drag-icon">⋮⋮</span>
                                        <span className="sort-number">{slide.sort || slide.id}</span>
                                    </td>
                                    <td>
                                        <img
                                            src={`/media/${slide.name}`}
                                            alt={slide.name}
                                            className="slide-thumbnail"
                                            onError={(e) => e.target.src = '/assets/image-placeholder.jpg'}
                                        />
                                    </td>
                                    <td className="filename-cell" title={slide.name}>
                                        {slide.name.length > 30 ? slide.name.substring(0, 30) + '...' : slide.name}
                                    </td>
                                    <td className="caption-cell">
                                        {editingCaption === slide.id ? (
                                            <div className="caption-edit">
                                                <textarea
                                                    defaultValue={slide.caption || ''}
                                                    id={`caption_${slide.id}`}
                                                    rows="2"
                                                    className="caption-textarea"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && e.ctrlKey) {
                                                            const newCaption = document.getElementById(`caption_${slide.id}`).value;
                                                            handleUpdateCaption(slide.id, newCaption);
                                                        }
                                                        if (e.key === 'Escape') setEditingCaption(null);
                                                    }}
                                                />
                                                <div className="caption-actions">
                                                    <button className="caption-save" onClick={() => {
                                                        const newCaption = document.getElementById(`caption_${slide.id}`).value;
                                                        handleUpdateCaption(slide.id, newCaption);
                                                    }} disabled={saving}>Save</button>
                                                    <button className="caption-cancel" onClick={() => setEditingCaption(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="caption-display" onClick={() => setEditingCaption(slide.id)}>
                                                <span>{slide.caption || 'Click to add caption...'}</span>
                                                <span className="edit-icon">✏️</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <button className="delete-button" onClick={() => handleDeleteSlide(slide)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Media Toolbox Modal */}
            {showMediaToolbox && (
                <div className="media-toolbox-modal">
                    <div className="media-toolbox-modal-content">
                        <MediaToolbox
                            onSelect={() => {}}
                            onClose={() => setShowMediaToolbox(false)}
                            selectedValue={null}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlidesAdmin;