// pages/UserArchive.jsx
import React, { useState, useEffect } from 'react';
import './User.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const UserArchiveAdmin = ({ navigateTo }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/fa?query=SELECT * FROM ${publicdb}.user ORDER BY id DESC`);
            const result = await response.json();

            let usersData = [];
            if (result.success && result.data) {
                usersData = Array.isArray(result.data) ? result.data : [];
            } else if (Array.isArray(result)) {
                usersData = result;
            }
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            showNotification('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete user "${name}"? This action cannot be undone.`)) return;

        try {
            const query = `DELETE FROM ${publicdb}.user WHERE id=${id}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });

            const result = await response.json();
            if (result.success === true) {
                showNotification('User deleted successfully', 'success');
                fetchUsers();
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showNotification('Delete failed', 'error');
        }
    };

    const handleNavigate = (page, id = null) => {
        if (typeof navigateTo === 'function') {
            navigateTo(page, id);
        } else {
            // Fallback navigation
            if (page === 'user-edit' && id) {
                window.location.href = `/admin#user-edit?id=${id}`;
            } else if (page === 'user-new') {
                window.location.href = '/admin#user-new';
            } else if (page === 'users') {
                window.location.href = '/admin#users';
            }
        }
    };

    const getPermissionClass = (permission) => {
        const classes = {
            admin: 'permission-admin',
            editor: 'permission-editor',
            writer: 'permission-writer',
            user: 'permission-user'
        };
        return classes[permission?.toLowerCase()] || 'permission-user';
    };

    if (loading) {
        return <div className="loading-state">Loading users...</div>;
    }

    return (
        <div className="users-container">
            {apiStatus.show && (
                <div className={`notification notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="users-header">
                <h1 className="users-title">👥 User Management</h1>
                <button className="btn-add" onClick={() => handleNavigate('user-new')}>
                    + New User
                </button>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Permission</th>
                        <th>Status</th>
                        <th>Display</th>
                        <th>Language</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>
                                {user.img ? (
                                    <img src={`/media/${user.img}`} alt="" className="user-avatar"/>
                                ) : (
                                    <div className="user-avatar-placeholder">👤</div>
                                )}
                            </td>
                            <td>
                            <strong>{user.firstname} {user.lastname}</strong>
                                {user.name && <div className="user-username">@{user.name}</div>}
                            </td>
                            <td>{user.email || '-'}</td>
                            <td>
                                    <span className={`permission-badge ${getPermissionClass(user.permission)}`}>
                                        {user.permission || 'user'}
                                    </span>
                            </td>
                            <td>
                                    <span className={`status-badge ${user.status === 1 ? 'status-active' : 'status-inactive'}`}>
                                        {user.status === 1 ? 'Active' : 'Inactive'}
                                    </span>
                            </td>
                            <td>
                                    <span className={`display-badge ${user.display === 1 ? 'display-public' : 'display-hidden'}`}>
                                        {user.display === 1 ? '✓ Public' : '✗ Hidden'}
                                    </span>
                            </td>
                            <td>{user.lang || 'en'}</td>
                            <td className="actions-cell">
                                <button className="btn-edit" onClick={() => handleNavigate('user-edit', user.id)}>Edit</button>
                                <button className="btn-delete" onClick={() => handleDelete(user.id, user.firstname || user.name)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div className="no-data">No users found. Click "New User" to create one.</div>
            )}
        </div>
    );
};

export default UserArchiveAdmin;