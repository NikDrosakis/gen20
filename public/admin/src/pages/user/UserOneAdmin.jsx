// pages/UserForm.jsx (ενοποιημένο - Create & Edit με MediaToolbox)
import React, { useState, useEffect } from 'react';
import MediaToolbox from '../../components/media/MediaToolbox';
import './User.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const UserOneAdmin = ({ navigateTo, userId = null, isNew = false }) => {
    const [loading, setLoading] = useState(!isNew && !!userId);
    const [saving, setSaving] = useState(false);
    const [showMediaToolbox, setShowMediaToolbox] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        firstname: '',
        lastname: '',
        fullname: '',
        email: '',
        permission: 'user',
        status: 1,
        display: 1,
        title: '',
        bio: '',
        img: '',
        url: '',
        tel: '',
        city: 0,
        lang: 'en',
        usergrpid: 1
    });
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    const escapeSql = (str) => {
        if (str === null || str === undefined) return '';
        return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"');
    };

    // Get user ID from URL if not passed as prop
    const getUserIdFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    // Load user data for edit mode
    useEffect(() => {
        console.log('UserOneAdmin useEffect - isNew:', isNew, 'userId:', userId);
        if (!isNew) {
            const id = userId || getUserIdFromUrl();
            console.log('Fetching user with id:', id);
            if (id) {
                fetchUser(id);
            } else if (!isNew) {
                showNotification('No user ID provided', 'error');
                navigateTo('users');
            }
        } else {
            console.log('New user mode - no fetch needed');
            setLoading(false);
        }
    }, [userId, isNew]);

    const fetchUser = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/f?query=SELECT * FROM ${publicdb}.user WHERE id=${id}`);
            const result = await response.json();

            let userData = null;
            if (result.success && result.data) {
                userData = Array.isArray(result.data) ? result.data[0] : result.data;
            }

            if (userData && userData.id) {
                setFormData({
                    name: userData.name || '',
                    firstname: userData.firstname || '',
                    lastname: userData.lastname || '',
                    fullname: userData.fullname || '',
                    email: userData.email || '',
                    permission: userData.permission || 'user',
                    status: userData.status ?? 1,
                    display: userData.display ?? 1,
                    title: userData.title || '',
                    bio: userData.bio || '',
                    img: userData.img || '',
                    url: userData.url || '',
                    tel: userData.tel || '',
                    city: userData.city || 0,
                    lang: userData.lang || 'en',
                    usergrpid: userData.usergrpid || 1
                });
            } else {
                showNotification('User not found', 'error');
                navigateTo('users');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            showNotification('Failed to load user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMediaSelect = (media) => {
        const filename = media?.filename || media?.url?.split('/').pop();
        if (filename) {
            setFormData(prev => ({ ...prev, img: filename }));
            setShowMediaToolbox(false);
            showNotification('Image selected!', 'success');
        }
    };

    // Listen for media selection events
    useEffect(() => {
        const handleMediaSelected = (event) => {
            const media = event.detail;
            const filename = media?.filename || media?.url?.split('/').pop();
            if (filename) {
                setFormData(prev => ({ ...prev, img: filename }));
                setShowMediaToolbox(false);
                showNotification('Image selected!', 'success');
            }
        };
        window.addEventListener('mediaSelected', handleMediaSelected);
        return () => window.removeEventListener('mediaSelected', handleMediaSelected);
    }, []);

    const handleSave = async () => {
        if (!formData.email) {
            showNotification('Email is required', 'error');
            return;
        }

        setSaving(true);
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const fullname = formData.fullname || `${formData.firstname} ${formData.lastname}`.trim();

        try {
            if (isNew) {
                // INSERT new user
                const query = `INSERT INTO ${publicdb}.user
                    (name, firstname, lastname, fullname, email, permission, status, display, 
                     title, bio, img, url, tel, city, lang, usergrpid, created, modified, edited)
                VALUES (
                    '${escapeSql(formData.name || '')}',
                    '${escapeSql(formData.firstname || '')}',
                    '${escapeSql(formData.lastname || '')}',
                    '${escapeSql(fullname)}',
                    '${escapeSql(formData.email)}',
                    '${escapeSql(formData.permission)}',
                    ${parseInt(formData.status) || 0},
                    ${parseInt(formData.display) || 1},
                    '${escapeSql(formData.title || '')}',
                    '${escapeSql(formData.bio || '')}',
                    '${escapeSql(formData.img || '')}',
                    '${escapeSql(formData.url || '')}',
                    '${escapeSql(formData.tel || '')}',
                    ${parseInt(formData.city) || 0},
                    '${escapeSql(formData.lang || 'en')}',
                    ${parseInt(formData.usergrpid) || 1},
                    '${now}',
                    '${now}',
                    '${now}')`;

                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([query, []])
                });

                const result = await response.json();
                if (result.success === true) {
                    showNotification('User created successfully', 'success');
                    setTimeout(() => navigateTo('users'), 1500);
                } else {
                    throw new Error(result.error || 'Create failed');
                }
            } else {
                // UPDATE existing user
                const id = userId || getUserIdFromUrl();
                const query = `UPDATE ${publicdb}.user SET
                    name='${escapeSql(formData.name || '')}',
                    firstname='${escapeSql(formData.firstname || '')}',
                    lastname='${escapeSql(formData.lastname || '')}',
                    fullname='${escapeSql(fullname)}',
                    email='${escapeSql(formData.email)}',
                    permission='${escapeSql(formData.permission)}',
                    status=${parseInt(formData.status) || 0},
                    display=${parseInt(formData.display) || 1},
                    title='${escapeSql(formData.title || '')}',
                    bio='${escapeSql(formData.bio || '')}',
                    img='${escapeSql(formData.img || '')}',
                    url='${escapeSql(formData.url || '')}',
                    tel='${escapeSql(formData.tel || '')}',
                    city=${parseInt(formData.city) || 0},
                    lang='${escapeSql(formData.lang || 'en')}',
                    usergrpid=${parseInt(formData.usergrpid) || 1},
                    modified='${now}',
                    edited='${now}'
                WHERE id=${id}`;

                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([query, []])
                });

                const result = await response.json();
                if (result.success === true) {
                    showNotification('User updated successfully', 'success');
                    setTimeout(() => navigateTo('users'), 1500);
                } else {
                    throw new Error(result.error || 'Update failed');
                }
            }
        } catch (error) {
            console.error('Error saving user:', error);
            showNotification(`${isNew ? 'Create' : 'Update'} failed: ` + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-state">Loading user data...</div>;
    }

    return (
        <div className="users-container">
            {apiStatus.show && (
                <div className={`notification notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="users-header">
                <h1 className="users-title">
                    {isNew ? '📝 Create New User' : '✏️ Edit User'}
                </h1>
                <button className="btn-back" onClick={() => navigateTo('users')}>← Back to Users</button>
            </div>

            <div className="form-card">
                {/* Image Preview with Media Toolbox */}
                <div className="image-preview-group">
                    <div className="image-preview-wrapper">
                        <div className="image-preview-container">
                            {formData.img ? (
                                <img
                                    src={formData.img.startsWith('http') ? formData.img : `/media/${formData.img}`}
                                    alt="Preview"
                                    className="image-preview"
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-4-3 3-4-4-6 6"%3E%3C/path%3E%3C/svg%3E';
                                        e.target.onerror = null;
                                    }}
                                />
                            ) : (
                                <div className="image-placeholder">
                                    <span className="image-placeholder-icon">🖼️</span>
                                    <span className="image-placeholder-text">No image</span>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="btn-select-image"
                            onClick={() => setShowMediaToolbox(true)}
                        >
                            🖼️ {formData.img ? 'Change Image' : 'Select Image from Media Library'}
                        </button>
                    </div>
                    <div className="image-input-group">
                        <label className="form-label">Avatar URL</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.img}
                            onChange={(e) => setFormData({...formData, img: e.target.value})}
                            placeholder="/assets/avatars/user.jpg"
                        />
                        {formData.img && (
                            <button
                                className="clear-image-button"
                                onClick={() => setFormData({...formData, img: ''})}
                                type="button"
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Media Toolbox Modal */}
                {showMediaToolbox && (
                    <div className="media-toolbox-modal">
                        <div className="media-toolbox-modal-content">
                            <MediaToolbox
                                onSelect={handleMediaSelect}
                                onClose={() => setShowMediaToolbox(false)}
                                selectedValue={formData.img}
                            />
                        </div>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input type="text" className="form-input" value={formData.firstname}
                               onChange={(e) => setFormData({...formData, firstname: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input type="text" className="form-input" value={formData.lastname}
                               onChange={(e) => setFormData({...formData, lastname: e.target.value})} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input type="text" className="form-input" value={formData.name}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                               placeholder="username" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email <span className="required">*</span></label>
                        <input type="email" className="form-input" value={formData.email}
                               onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Permission</label>
                        <select className="form-select" value={formData.permission}
                                onChange={(e) => setFormData({...formData, permission: e.target.value})}>
                            <option value="user">User</option>
                            <option value="writer">Writer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">User Group ID</label>
                        <input type="number" className="form-input" value={formData.usergrpid}
                               onChange={(e) => setFormData({...formData, usergrpid: parseInt(e.target.value) || 1})} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={formData.status}
                                onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Display Publicly</label>
                        <select className="form-select" value={formData.display}
                                onChange={(e) => setFormData({...formData, display: parseInt(e.target.value)})}>
                            <option value={1}>Yes - Show Publicly</option>
                            <option value={0}>No - Hidden</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Language</label>
                        <select className="form-select" value={formData.lang}
                                onChange={(e) => setFormData({...formData, lang: e.target.value})}>
                            <option value="en">English</option>
                            <option value="el">Ελληνικά</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">City ID</label>
                        <input type="number" className="form-input" value={formData.city}
                               onChange={(e) => setFormData({...formData, city: parseInt(e.target.value) || 0})} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-input" value={formData.title}
                           onChange={(e) => setFormData({...formData, title: e.target.value})}
                           placeholder="e.g., Bioinformatics Researcher" />
                </div>

                <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" rows="4" value={formData.bio}
                              onChange={(e) => setFormData({...formData, bio: e.target.value})}
                              placeholder="Short biography..." />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Website</label>
                        <input type="text" className="form-input" value={formData.url}
                               onChange={(e) => setFormData({...formData, url: e.target.value})}
                               placeholder="https://..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="text" className="form-input" value={formData.tel}
                               onChange={(e) => setFormData({...formData, tel: e.target.value})} />
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn-cancel" onClick={() => navigateTo('users')}>Cancel</button>
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : (isNew ? 'Create User' : 'Save Changes')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserOneAdmin;