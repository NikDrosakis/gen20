/*
#name: AuthorDrop
#title: Author Dropdown Component
#description: Reusable dropdown component for selecting authors/users from the database. Fetches users from the public database and displays their full names.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: forms
#independent: true
#standalone: true
#compatible_areas: m
#dependencies: react
#props:
#   - selectedUserId: Currently selected user ID
#   - onChange: Callback function when selection changes
#   - publicdb: Database name to fetch users from
#   - placeholder: Placeholder text when no selection
#   - className: CSS class for styling
#   - disabled: Disable dropdown state
#   - showNotification: Callback for error notifications
#apimethods:
#   GET /api/v1/maria/fa?folder=select%20*%20from%20${publicdb}.user
#methods:
#   - fetchUsers(): Fetches all users from the database
#   - getAuthorName(): Formats user's full name from firstname/lastname
*/
import React, { useState, useEffect } from 'react';

const AuthorDrop = ({
                            selectedUserId,
                            onChange,
                            publicdb,
                            placeholder = "-- Select Author --",
                            className = "form-select",
                            disabled = false,
                            showNotification
                        }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [publicdb]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/fa?folder=select%20*%20from%20${publicdb}.user`);
            const result = await response.json();
            let usersData = [];
            if (result.success && result.data) {
                if (Array.isArray(result.data)) usersData = result.data;
            } else if (Array.isArray(result)) usersData = result;
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            if (showNotification) {
                showNotification('Failed to load authors', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const getAuthorName = (user) => {
        if (user.firstname || user.lastname) {
            return `${user.firstname || ''} ${user.lastname || ''}`.trim();
        }
        return user.username || user.name || `User ${user.id}`;
    };

    return (
        <select
            className={className}
            value={selectedUserId || ''}
            onChange={(e) => onChange(parseInt(e.target.value))}
            disabled={disabled || loading}
        >
            <option value="">{loading ? 'Loading authors...' : placeholder}</option>
            {!loading && users.map(user => (
                <option key={user.id} value={user.id}>
                    {getAuthorName(user)}
                </option>
            ))}
        </select>
    );
};

export default AuthorDrop;