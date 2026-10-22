// pages/MemberFormAdmin.jsx
import React, { useState, useEffect } from 'react';
import './MemberFormAdmin.css';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const MemberFormAdmin = ({ navigateTo }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        fathername: '',
        mothername: '',
        id_card_number: '',
        email: '',
        city: '',
        address: '',
        area: '',
        postal_code: '',
        phone: '',
        education_general: '',
        education_artistic: '',
        education_other: '',
        languages: '',
        military_service: false,
        has_child_under_3: false,
        works: [
            { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' },
            { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' },
            { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' }
        ],
        additional_works: '',
        other_artistic_works: '',
        signature_name: '',
        contribution_amount: 15.00,
        contribution_paid: false,
        status: 0,
        admin_notes: ''
    });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const query = `SELECT * FROM ${publicdb}.c_unionmember ORDER BY created_at DESC`;
            const response = await fetch(`/api/v1/maria/fa?folder=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success && result.data) {
                setMembers(result.data);
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            showNotification('Failed to load members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewEdit = (member) => {
        // Parse works JSON if it's a string
        let worksData = member.works;
        if (typeof member.works === 'string') {
            try {
                worksData = JSON.parse(member.works);
                // Ensure we have 3 works entries
                while (worksData.length < 3) {
                    worksData.push({ title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' });
                }
            } catch (e) {
                worksData = [
                    { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' },
                    { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' },
                    { title: '', type: '', year: '', role: '', presentations: '', link: '', awards: '' }
                ];
            }
        }

        setFormData({
            firstname: member.firstname || '',
            lastname: member.lastname || '',
            fathername: member.fathername || '',
            mothername: member.mothername || '',
            id_card_number: member.id_card_number || '',
            email: member.email || '',
            city: member.city || '',
            address: member.address || '',
            area: member.area || '',
            postal_code: member.postal_code || '',
            phone: member.phone || '',
            education_general: member.education_general || '',
            education_artistic: member.education_artistic || '',
            education_other: member.education_other || '',
            languages: member.languages || '',
            military_service: member.military_service === 1,
            has_child_under_3: member.has_child_under_3 === 1,
            works: worksData,
            additional_works: member.additional_works || '',
            other_artistic_works: member.other_artistic_works || '',
            signature_name: member.signature_name || '',
            contribution_amount: member.contribution_amount || 15.00,
            contribution_paid: member.contribution_paid === 1,
            status: member.status || 0,
            admin_notes: member.admin_notes || ''
        });
        setEditingMember(member);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.firstname || !formData.lastname || !formData.email) {
            showNotification('First name, last name and email are required', 'error');
            return;
        }

        setSaving(true);

        try {
            const updateParams = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                fathername: formData.fathername || null,
                mothername: formData.mothername || null,
                id_card_number: formData.id_card_number || null,
                email: formData.email,
                city: formData.city || null,
                address: formData.address || null,
                area: formData.area || null,
                postal_code: formData.postal_code || null,
                phone: formData.phone || null,
                education_general: formData.education_general || null,
                education_artistic: formData.education_artistic || null,
                education_other: formData.education_other || null,
                languages: formData.languages || null,
                military_service: formData.military_service ? 1 : 0,
                has_child_under_3: formData.has_child_under_3 ? 1 : 0,
                works: JSON.stringify(formData.works.filter(w => w.title)),
                additional_works: formData.additional_works || null,
                other_artistic_works: formData.other_artistic_works || null,
                signature_name: formData.signature_name,
                contribution_amount: formData.contribution_amount,
                contribution_paid: formData.contribution_paid ? 1 : 0,
                status: formData.status,
                admin_notes: formData.admin_notes || null
            };

            // Build UPDATE query
            const setClauses = Object.entries(updateParams).map(([key, value]) => {
                if (value === null || value === undefined) {
                    return `${key} = NULL`;
                }
                if (typeof value === 'string') {
                    return `${key} = '${value.replace(/'/g, "\\'")}'`;
                }
                return `${key} = ${value}`;
            }).join(', ');

            const query = `UPDATE ${publicdb}.c_unionmember SET ${setClauses} WHERE id = ${editingMember.id}`;

            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });

            const result = await response.json();
            if (result.success) {
                showNotification('Member updated successfully', 'success');
                setShowModal(false);
                fetchMembers();
            } else {
                throw new Error(result.error || 'Update failed');
            }
        } catch (error) {
            console.error('Error saving member:', error);
            showNotification('Save failed: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const query = `UPDATE ${publicdb}.c_unionmember SET status = ${newStatus} WHERE id = ${id}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            const result = await response.json();
            if (result.success) {
                showNotification('Status updated successfully', 'success');
                fetchMembers();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Failed to update status', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}'s application?`)) return;

        try {
            const query = `DELETE FROM ${publicdb}.c_unionmember WHERE id = ${id}`;
            const response = await fetch('/api/v1/maria/q', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([query, []])
            });
            const result = await response.json();
            if (result.success) {
                showNotification('Member deleted successfully', 'success');
                fetchMembers();
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            showNotification('Delete failed', 'error');
        }
    };

    const handleWorkChange = (index, field, value) => {
        const updatedWorks = [...formData.works];
        updatedWorks[index][field] = value;
        setFormData(prev => ({ ...prev, works: updatedWorks }));
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 1: return { text: 'Approved', class: 'status-approved' };
            case 2: return { text: 'Rejected', class: 'status-rejected' };
            default: return { text: 'Pending', class: 'status-pending' };
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || member.status === parseInt(statusFilter);
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className="member-admin-loading">Loading members...</div>;
    }

    return (
        <div className="member-admin-container">
            {apiStatus.show && (
                <div className={`member-admin-notification member-admin-notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="member-admin-header">
                <h1>📋 Member Applications</h1>
            </div>

            <div className="member-admin-filters">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filter-group">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-filter">
                        <option value="all">All Status</option>
                        <option value="0">Pending</option>
                        <option value="1">Approved</option>
                        <option value="2">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="member-admin-table-container">
                <table className="member-admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Contribution</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredMembers.map(member => {
                        const statusInfo = getStatusBadge(member.status);
                        return (
                            <tr key={member.id}>
                                <td>{member.id}</td>
                                <td>
                                    <strong>{member.firstname} {member.lastname}</strong>
                                    {member.fathername && <small> (son of {member.fathername})</small>}
                                </td>
                                <td>{member.email}</td>
                                <td>{member.phone || '-'}</td>
                                <td>{new Date(member.created_at).toLocaleDateString('el-GR')}</td>
                                <td>
                                    <select
                                        className={`status-select ${statusInfo.class}`}
                                        value={member.status}
                                        onChange={(e) => handleStatusChange(member.id, parseInt(e.target.value))}
                                    >
                                        <option value={0}>Pending</option>
                                        <option value={1}>Approved</option>
                                        <option value={2}>Rejected</option>
                                    </select>
                                </td>
                                <td>
                                    {member.contribution_paid ? (
                                        <span className="contribution-paid">✓ Paid (€{member.contribution_amount})</span>
                                    ) : (
                                        <span className="contribution-pending">Pending (€{member.contribution_amount})</span>
                                    )}
                                </td>
                                <td className="actions-cell">
                                    <button className="btn-view" onClick={() => handleViewEdit(member)}>
                                        👁️ View/Edit
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDelete(member.id, member.firstname)}>
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {filteredMembers.length === 0 && (
                <div className="member-admin-empty">
                    <p>No member applications found.</p>
                </div>
            )}

            {/* Modal for View/Edit */}
            {showModal && (
                <div className="member-admin-modal">
                    <div className="member-admin-modal-content">
                        <div className="member-admin-modal-header">
                            <h2>✏️ Edit Member Application</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="member-admin-modal-body">
                            <div className="form-tabs">
                                <button className="form-tab active">Personal Info</button>
                            </div>

                            {/* Identity Section */}
                            <div className="form-section">
                                <h3>ΣΤΟΙΧΕΙΑ ΤΑΥΤΟΤΗΤΑΣ</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input type="text" value={formData.firstname} onChange={(e) => setFormData({...formData, firstname: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input type="text" value={formData.lastname} onChange={(e) => setFormData({...formData, lastname: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Father's Name</label>
                                        <input type="text" value={formData.fathername} onChange={(e) => setFormData({...formData, fathername: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Mother's Name</label>
                                        <input type="text" value={formData.mothername} onChange={(e) => setFormData({...formData, mothername: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>ID Card Number</label>
                                        <input type="text" value={formData.id_card_number} onChange={(e) => setFormData({...formData, id_card_number: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            {/* Residence Section */}
                            <div className="form-section">
                                <h3>ΣΤΟΙΧΕΙΑ ΔΙΑΜΟΝΗΣ</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Area</label>
                                        <input type="text" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input type="text" value={formData.postal_code} onChange={(e) => setFormData({...formData, postal_code: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </div>

                            {/* Education Section */}
                            <div className="form-section">
                                <h3>ΣΠΟΥΔΕΣ</h3>
                                <div className="form-group">
                                    <label>General Education</label>
                                    <textarea rows="2" value={formData.education_general} onChange={(e) => setFormData({...formData, education_general: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Artistic Education</label>
                                    <textarea rows="2" value={formData.education_artistic} onChange={(e) => setFormData({...formData, education_artistic: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Other Education</label>
                                    <textarea rows="2" value={formData.education_other} onChange={(e) => setFormData({...formData, education_other: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Languages</label>
                                    <textarea rows="2" value={formData.languages} onChange={(e) => setFormData({...formData, languages: e.target.value})} />
                                </div>
                            </div>

                            {/* Works Section */}
                            <div className="form-section">
                                <h3>ΕΡΓΟΓΡΑΦΙΑ</h3>
                                {[0, 1, 2].map((idx) => (
                                    <div key={idx} className="work-entry">
                                        <h4>Work {idx + 1}</h4>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input type="text" value={formData.works[idx]?.title || ''} onChange={(e) => handleWorkChange(idx, 'title', e.target.value)} />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Type</label>
                                                <input type="text" value={formData.works[idx]?.type || ''} onChange={(e) => handleWorkChange(idx, 'type', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Year</label>
                                                <input type="text" value={formData.works[idx]?.year || ''} onChange={(e) => handleWorkChange(idx, 'year', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Role</label>
                                            <input type="text" value={formData.works[idx]?.role || ''} onChange={(e) => handleWorkChange(idx, 'role', e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Presentations</label>
                                            <textarea rows="2" value={formData.works[idx]?.presentations || ''} onChange={(e) => handleWorkChange(idx, 'presentations', e.target.value)} />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Link</label>
                                                <input type="url" value={formData.works[idx]?.link || ''} onChange={(e) => handleWorkChange(idx, 'link', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Awards</label>
                                                <input type="text" value={formData.works[idx]?.awards || ''} onChange={(e) => handleWorkChange(idx, 'awards', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="form-group">
                                    <label>Additional Works</label>
                                    <textarea rows="4" value={formData.additional_works} onChange={(e) => setFormData({...formData, additional_works: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Other Artistic Works</label>
                                    <textarea rows="4" value={formData.other_artistic_works} onChange={(e) => setFormData({...formData, other_artistic_works: e.target.value})} />
                                </div>
                            </div>

                            {/* Admin Section */}
                            <div className="form-section">
                                <h3>ADMIN SETTINGS</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}>
                                            <option value={0}>Pending</option>
                                            <option value={1}>Approved</option>
                                            <option value={2}>Rejected</option>
                                        </select>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input type="checkbox" checked={formData.contribution_paid} onChange={(e) => setFormData({...formData, contribution_paid: e.target.checked})} />
                                            Contribution Paid (€{formData.contribution_amount})
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Admin Notes</label>
                                    <textarea rows="3" value={formData.admin_notes} onChange={(e) => setFormData({...formData, admin_notes: e.target.value})} placeholder="Internal notes..." />
                                </div>
                            </div>
                        </div>
                        <div className="member-admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberFormAdmin;