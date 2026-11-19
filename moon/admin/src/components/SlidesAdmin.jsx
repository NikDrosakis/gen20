
/*
#name: SlidesAdmin
*/

import React, { useState, useEffect, useCallback } from 'react';
import MediaToolbox from '../components/MediaToolbox';
import { useDragDrop } from '../useDragDrop';
import './SlidesAdmin.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const SlidesAdmin = () => {
    const [groups, setGroups] = useState([]);
    const [slides, setSlides] = useState([]);

    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [apiStatus, setApiStatus] = useState({
        show: false,
        message: '',
        type: ''
    });

    const [editingCaption, setEditingCaption] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showMediaToolbox, setShowMediaToolbox] = useState(false);

    // --------------------------------------------------
    // NOTIFICATIONS
    // --------------------------------------------------

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });

        setTimeout(() => {
            setApiStatus({
                show: false,
                message: '',
                type: ''
            });
        }, 3000);
    };

    // --------------------------------------------------
    // INITIALIZATION
    // --------------------------------------------------

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchSlides(selectedGroup.id);
        } else {
            setSlides([]);
        }
    }, [selectedGroup]);

    // --------------------------------------------------
    // FETCH GROUPS
    // --------------------------------------------------

    const fetchGroups = async () => {
        setLoading(true);
        setError(null);

        try {
            const query = `
                SELECT *
                FROM ${publicdb}.c_slidergrp
                ORDER BY id ASC
            `;

            const response = await fetch(
                `/api/v1/maria/fa?folder=${encodeURIComponent(query)}`
            );

            const result = await response.json();

            if (result.success && result.data) {
                setGroups(result.data);

                if (result.data.length > 0) {
                    setSelectedGroup(result.data[0]);
                } else {
                    setSelectedGroup(null);
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

    // --------------------------------------------------
    // FETCH SLIDES
    // --------------------------------------------------

    const fetchSlides = async (groupId) => {
        try {
            const query = `
                SELECT *
                FROM ${publicdb}.c_slides
                WHERE c_slidesgrpid = ${Number(groupId)}
                ORDER BY sort ASC, id ASC
            `;

            const response = await fetch(
                `/api/v1/maria/fa?folder=${encodeURIComponent(query)}`
            );

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

    // --------------------------------------------------
    // UPDATE SLIDE FIELD
    // --------------------------------------------------

    const updateSlideField = async (id, field, value) => {
        const allowedFields = ['sort', 'caption'];

        if (!allowedFields.includes(field)) {
            throw new Error('Invalid slide field');
        }

        const safeValue = field === 'sort'
            ? Number(value)
            : `'${String(value ?? '').replace(/'/g, "\\'")}'`;

        const query = `
            UPDATE ${publicdb}.c_slides
            SET ${field} = ${safeValue}
            WHERE id = ${Number(id)}
              AND c_slidesgrpid = ${Number(selectedGroup?.id)}
        `;

        const response = await fetch('/api/v1/maria/q', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([query, []])
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error || `Failed to update ${field}`
            );
        }

        return result;
    };

    // --------------------------------------------------
    // NATIVE DRAG & DROP - SLIDE SORTING
    // --------------------------------------------------

    const handleSlideDrop = useCallback(async (payload, target) => {
        if (!selectedGroup || !payload?.id || !target?.id) {
            return;
        }

        if (Number(payload.id) === Number(target.id)) {
            return;
        }

        const fromIndex = slides.findIndex(
            slide => Number(slide.id) === Number(payload.id)
        );

        const toIndex = slides.findIndex(
            slide => Number(slide.id) === Number(target.id)
        );

        if (fromIndex < 0 || toIndex < 0) {
            return;
        }

        // Reorder
        const reordered = [...slides];

        const [moved] = reordered.splice(fromIndex, 1);

        reordered.splice(toIndex, 0, moved);

        // Recalculate sort
        const updated = reordered.map((slide, index) => ({
            ...slide,
            sort: index + 1
        }));

        // Optimistic UI update
        setSlides(updated);

        try {
            const requests = updated.map(async (slide) => {
                const query = `
                    UPDATE ${publicdb}.c_slides
                    SET sort = ${Number(slide.sort)}
                    WHERE id = ${Number(slide.id)}
                      AND c_slidesgrpid = ${Number(selectedGroup.id)}
                `;

                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([query, []])
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.error || 'Sort update failed'
                    );
                }

                return result;
            });

            await Promise.all(requests);

            showNotification('Sort order updated', 'success');

        } catch (error) {
            console.error('Slide sorting error:', error);

            showNotification(
                'Failed to save sort order',
                'error'
            );

            fetchSlides(selectedGroup.id);
        }

    }, [slides, selectedGroup]);

    const {
        dragging,
        makeDragProps,
        makeDropProps
    } = useDragDrop({
        onDrop: handleSlideDrop
    });

    // --------------------------------------------------
    // MEDIA TOOLBOX EVENT
    // --------------------------------------------------

    useEffect(() => {
        const handleMediaSelected = async (event) => {
            const media = event.detail;

            console.log('Media selected event received:', media);

            if (!media || !selectedGroup) {
                showNotification(
                    'Πρώτα επιλέξτε ένα group',
                    'error'
                );

                setShowMediaToolbox(false);
                return;
            }

            const filename =
                media?.filename ||
                media?.url?.split('/').pop();

            if (!filename) return;

            setSaving(true);

            try {
                if (slides.some(slide => slide.name === filename)) {
                    showNotification(
                        `"${filename}" υπάρχει ήδη σε αυτό το group`,
                        'error'
                    );

                    setShowMediaToolbox(false);
                    return;
                }

                const maxSort = slides.length > 0
                    ? Math.max(...slides.map(slide => Number(slide.sort) || 0))
                    : 0;

                const insertQuery = `
                    INSERT INTO ${publicdb}.c_slides
                        (c_slidesgrpid, name, sort, caption, meta)
                    VALUES (
                        ${Number(selectedGroup.id)},
                        '${filename.replace(/'/g, "\\'")}',
                        ${maxSort + 1},
                        '',
                        '{}'
                    )
                `;

                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([insertQuery, []])
                });

                const result = await response.json();

                if (result.success) {
                    showNotification(
                        'Η εικόνα προστέθηκε επιτυχώς!',
                        'success'
                    );

                    fetchSlides(selectedGroup.id);

                } else {
                    throw new Error(
                        result.error || 'Failed to add slide'
                    );
                }

            } catch (error) {
                console.error('Error adding slide:', error);

                showNotification(
                    'Αποτυχία προσθήκης: ' + error.message,
                    'error'
                );

            } finally {
                setSaving(false);
                setShowMediaToolbox(false);
            }
        };

        window.addEventListener(
            'mediaSelected',
            handleMediaSelected
        );

        return () => {
            window.removeEventListener(
                'mediaSelected',
                handleMediaSelected
            );
        };

    }, [selectedGroup, slides]);

    // --------------------------------------------------
    // IMAGE DROP BOX - FILE DRAG & DROP
    // --------------------------------------------------

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedGroup) return;

        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
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
            showNotification(
                'Πρώτα επιλέξτε ένα group',
                'error'
            );
            return;
        }

        const files = e.dataTransfer.files;

        if (files.length > 0) {
            await handleFileUpload(files[0]);
        }
    };

    // --------------------------------------------------
    // ADD SLIDE FROM FILE
    // --------------------------------------------------

    const handleFileUpload = async (file) => {
        const filename = file.name;

        if (!filename || !selectedGroup) return;

        if (slides.some(slide => slide.name === filename)) {
            showNotification(
                `"${filename}" υπάρχει ήδη σε αυτό το group`,
                'error'
            );
            return;
        }

        setSaving(true);
        setIsUploading(true);

        try {
            const maxSort = slides.length > 0
                ? Math.max(...slides.map(slide => Number(slide.sort) || 0))
                : 0;

            const insertQuery = `
                INSERT INTO ${publicdb}.c_slides
                    (c_slidesgrpid, name, sort, caption, meta)
                VALUES (
                    ${Number(selectedGroup.id)},
                    '${filename.replace(/'/g, "\\'")}',
                    ${maxSort + 1},
                    '',
                    '{}'
                )
            `;

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([insertQuery, []])
            });

            const result = await response.json();

            if (result.success) {
                showNotification(
                    'Slide added successfully!',
                    'success'
                );

                fetchSlides(selectedGroup.id);

            } else {
                throw new Error(
                    result.error || 'Failed to add slide'
                );
            }

        } catch (error) {
            console.error('Error adding slide:', error);

            showNotification(
                'Failed to add slide: ' + error.message,
                'error'
            );

        } finally {
            setSaving(false);
            setIsUploading(false);
        }
    };

    // --------------------------------------------------
    // DELETE SLIDE
    // --------------------------------------------------

    const handleDeleteSlide = async (slide) => {
        if (!window.confirm(
            `Are you sure you want to delete "${slide.name}"?`
        )) {
            return;
        }

        try {
            const query = `
                DELETE FROM ${publicdb}.c_slides
                WHERE id = ${Number(slide.id)}
                  AND c_slidesgrpid = ${Number(selectedGroup?.id)}
            `;

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([query, []])
            });

            const result = await response.json();

            if (result.success) {
                showNotification(
                    'Slide deleted successfully',
                    'success'
                );

                fetchSlides(selectedGroup.id);

            } else {
                throw new Error(
                    result.error || 'Failed to delete slide'
                );
            }

        } catch (error) {
            console.error('Error deleting slide:', error);

            showNotification(
                'Failed to delete slide: ' + error.message,
                'error'
            );
        }
    };

    // --------------------------------------------------
    // UPDATE CAPTION
    // --------------------------------------------------

    const handleUpdateCaption = async (id, caption) => {
        setSaving(true);

        try {
            await updateSlideField(id, 'caption', caption);

            showNotification(
                'Caption updated',
                'success'
            );

            fetchSlides(selectedGroup.id);

        } catch (error) {
            showNotification(
                'Failed to update caption',
                'error'
            );

        } finally {
            setSaving(false);
            setEditingCaption(null);
        }
    };

    // --------------------------------------------------
    // ADD GROUP
    // --------------------------------------------------

    const handleAddGroup = async () => {
        const title = prompt('Enter group title:');

        if (!title) return;

        try {
            const insertQuery = `
                INSERT INTO ${publicdb}.c_slidergrp
                    (title, classification_id, description)
                VALUES (
                    '${title.replace(/'/g, "\\'")}',
                    1,
                    ''
                )
            `;

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([insertQuery, []])
            });

            const result = await response.json();

            if (result.success) {
                showNotification(
                    'Group added successfully',
                    'success'
                );

                await fetchGroups();
            }

        } catch (error) {
            console.error('Error adding group:', error);

            showNotification(
                'Failed to add group',
                'error'
            );
        }
    };

    // --------------------------------------------------
    // DELETE GROUP
    // --------------------------------------------------

    const handleDeleteGroup = async (group) => {
        if (!window.confirm(
            `Are you sure you want to delete group "${group.title}" and all its slides?`
        )) {
            return;
        }

        try {
            const deleteSlidesQuery = `
                DELETE FROM ${publicdb}.c_slides
                WHERE c_slidesgrpid = ${Number(group.id)}
            `;

            const slidesResponse = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([deleteSlidesQuery, []])
            });

            const slidesResult = await slidesResponse.json();

            if (!slidesResult.success) {
                throw new Error(
                    slidesResult.error || 'Failed to delete slides'
                );
            }

            const deleteGroupQuery = `
                DELETE FROM ${publicdb}.c_slidergrp
                WHERE id = ${Number(group.id)}
            `;

            const groupResponse = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([deleteGroupQuery, []])
            });

            const groupResult = await groupResponse.json();

            if (!groupResult.success) {
                throw new Error(
                    groupResult.error || 'Failed to delete group'
                );
            }

            showNotification(
                'Group deleted successfully',
                'success'
            );

            await fetchGroups();

        } catch (error) {
            console.error('Error deleting group:', error);

            showNotification(
                'Failed to delete group: ' + error.message,
                'error'
            );
        }
    };

    // --------------------------------------------------
    // LOADING / ERROR
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="slides-admin-loading">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="slides-admin-error">
                {error}
            </div>
        );
    }

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="slides-admin-container">

            {apiStatus.show && (
                <div className={`slides-admin-notification slides-admin-notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}
                    {apiStatus.message}
                </div>
            )}

            {/* GROUPS SIDEBAR */}

            <div className="groups-sidebar">

                <div className="groups-header">
                    <h3>Slide Groups</h3>

                    <button
                        className="add-group-btn"
                        onClick={handleAddGroup}
                    >
                        +
                    </button>
                </div>

                <div className="groups-list">

                    {groups.map(group => (
                        <div
                            key={group.id}
                            className={`group-item ${Number(selectedGroup?.id) === Number(group.id) ? 'active' : ''}`}
                            onClick={() => setSelectedGroup(group)}
                        >
                            <span className="group-title">
                                {group.title}
                            </span>

                            <button
                                className="delete-group-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteGroup(group);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {groups.length === 0 && (
                        <div className="no-groups">
                            No groups. Click + to add.
                        </div>
                    )}

                </div>
            </div>

            {/* MAIN CONTENT */}

            <div className="slides-main">

                <div className="slides-header">
                    <h3>
                        {selectedGroup?.title || 'Slides'}
                    </h3>

                    <span className="slide-count">
                        {slides.length} slides
                    </span>
                </div>

                {/* IMAGE DROP BOX */}

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
                            <span className="drop-text">
                                Προσθήκη εικόνας...
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="drop-icon">📸</span>

                            <span className="drop-text">
                                {selectedGroup
                                    ? 'Κάντε κλικ ή drag & drop για προσθήκη εικόνας'
                                    : 'Επιλέξτε ή δημιουργήστε group πρώτα'}
                            </span>

                            <span className="drop-subtext">
                                Υποστηρίζονται JPG, PNG, GIF, WEBP (max 5MB)
                            </span>
                        </>
                    )}

                </div>

                {/* SLIDES TABLE */}

                {slides.length > 0 && (
                    <div className="table-container">

                        <table
                            id="sortableSlides"
                            className="styled-table"
                        >

                            <thead>
                            <tr>
                                <th style={{ width: '50px' }}>
                                    Sort
                                </th>

                                <th style={{ width: '80px' }}>
                                    Image
                                </th>

                                <th>Filename</th>

                                <th>Caption</th>

                                <th style={{ width: '70px' }}>
                                    Action
                                </th>
                            </tr>
                            </thead>

                            <tbody>

                            {slides.map(slide => (
                                <tr
                                    key={slide.id}
                                    data-id={slide.id}
                                    {...makeDropProps({
                                        id: slide.id
                                    })}
                                    className={
                                        Number(dragging?.id) === Number(slide.id)
                                            ? 'dragging'
                                            : ''
                                    }
                                >

                                    {/* SORT HANDLE */}

                                    <td
                                        className="sort-handle"
                                        {...makeDragProps({
                                            id: slide.id
                                        })}
                                    >
                                            <span className="drag-icon">
                                                ⋮⋮
                                            </span>

                                        <span className="sort-number">
                                                {slide.sort || slide.id}
                                            </span>
                                    </td>

                                    {/* IMAGE */}

                                    <td>
                                        <img
                                            src={`/media/${slide.name}`}
                                            alt={slide.name}
                                            className="slide-thumbnail"
                                            onError={e => {
                                                e.target.src = '/assets/image-placeholder.jpg';
                                            }}
                                        />
                                    </td>

                                    {/* FILENAME */}

                                    <td
                                        className="filename-cell"
                                        title={slide.name}
                                    >
                                        {slide.name.length > 30
                                            ? slide.name.substring(0, 30) + '...'
                                            : slide.name}
                                    </td>

                                    {/* CAPTION */}

                                    <td className="caption-cell">

                                        {editingCaption === slide.id ? (

                                            <div className="caption-edit">

                                                    <textarea
                                                        defaultValue={slide.caption || ''}
                                                        id={`caption_${slide.id}`}
                                                        rows="2"
                                                        className="caption-textarea"
                                                        autoFocus
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && e.ctrlKey) {
                                                                handleUpdateCaption(
                                                                    slide.id,
                                                                    e.currentTarget.value
                                                                );
                                                            }

                                                            if (e.key === 'Escape') {
                                                                setEditingCaption(null);
                                                            }
                                                        }}
                                                    />

                                                <div className="caption-actions">

                                                    <button
                                                        className="caption-save"
                                                        onClick={() => {
                                                            const textarea = document.getElementById(
                                                                `caption_${slide.id}`
                                                            );

                                                            handleUpdateCaption(
                                                                slide.id,
                                                                textarea.value
                                                            );
                                                        }}
                                                        disabled={saving}
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        className="caption-cancel"
                                                        onClick={() => setEditingCaption(null)}
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>
                                            </div>

                                        ) : (

                                            <div
                                                className="caption-display"
                                                onClick={() => setEditingCaption(slide.id)}
                                            >
                                                    <span>
                                                        {slide.caption || 'Click to add caption...'}
                                                    </span>

                                                <span className="edit-icon">
                                                        ✏️
                                                    </span>
                                            </div>

                                        )}

                                    </td>

                                    {/* ACTION */}

                                    <td>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteSlide(slide)}
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>
                            ))}

                            </tbody>
                        </table>

                    </div>
                )}

            </div>

            {/* MEDIA TOOLBOX MODAL */}

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
