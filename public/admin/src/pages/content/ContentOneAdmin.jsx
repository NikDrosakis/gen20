// pages/ContentEdit.jsx (χωρίς _en _el - διορθωμένο datetime)
import React, { useState, useEffect } from 'react';
import RichTextEditor from "../../components/RichTextEditor";
import AuthorDropdown from "../../components/content/AuthorDrop";
import ClassificationDrop from "../../components/content/ClassificationDrop";
import MediaToolbox from '../../components/media/MediaToolbox';
import ContentNavigation from '../../components/content/ContentNavigation';
import "./Content.css";

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const ContentOneAdmin = ({ navigateTo, contentId: propContentId, isNew = false }) => {

    const [jsonData, setJsonData] = useState({});
    const [showMediaToolbox, setShowMediaToolbox] = useState(false);
    const [customCss, setCustomCss] = useState('');
    const [loading, setLoading] = useState(!isNew && !!propContentId);
    const [saving, setSaving] = useState(false);
    const [contentId, setContentId] = useState(propContentId || null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        excerpt: '',
        classificationid: 1,
        userid: 1,
        img: '',
        type: 'post',
        name: '',
        published: '',
        sort: 0,
        status: 1,
        lang: 'el'
    });
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    console.log('contentId',contentId);
    const handleNavigate = (newId) => {
        window.location.href = `/admin/page?id=${newId}`;
    };

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 3000);
    };

    const createSlug = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const encodeEmoji = (text) => {
        if (!text) return null;
        return text.replace(/[\u{10000}-\u{10FFFF}]/gu, (match) => {
            const code = match.codePointAt(0);
            return `&#${code};`;
        });
    };

    const escapeSql = (str) => {
        if (str === null || str === undefined) return '';
        return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"');
    };

    const getContentIdFromUrl = () => {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get('id');
    };

    // Load content for edit mode
    useEffect(() => {
        if (!isNew) {
            const id = propContentId || getContentIdFromUrl();
            if (id) {
                setContentId(id);
                fetchContent(id);
            } else {
                showNotification('No content ID provided', 'error');
                navigateTo('page-archive');
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchContent = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/maria/f?query=select%20*%20from%20${publicdb}.content%20where%20id=${id}`);
            const result = await response.json();
            let contentData = null;
            if (result.success && result.data) {
                contentData = Array.isArray(result.data) ? result.data[0] : result.data;
            }
            if (contentData && contentData.id) {
                setFormData({
                    title: contentData.title || '',
                    description: contentData.description || '',
                    excerpt: contentData.excerpt || '',
                    name: contentData.name || '',
                    classificationid: contentData.classificationid || 1,
                    userid: contentData.userid || 1,
                    img: contentData.img || '',
                    type: contentData.type || 'post',
                    sort: contentData.sort || 0,
                    status: contentData.status ?? 1,
                    published: contentData.published || contentData.created || '',
                    lang: contentData.lang || 'el'
                });

                try {
                    const parsedJson = JSON.parse(contentData.json || '{}');
                    setJsonData(parsedJson);
                } catch (e) {
                    setJsonData({});
                }
                setCustomCss(contentData.css || '');
            } else {
                showNotification('Content not found', 'error');
                navigateTo('page-archive');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            showNotification('Failed to load content', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description) {
            showNotification('Please fill in Title and Description (default language)', 'error');
            return;
        }

        if (!isNew && !contentId) {
            showNotification('No content ID found', 'error');
            return;
        }

        // Validate JSON
        let validJson = {};
        let jsonString = '{}';
        try {
            if (jsonData && typeof jsonData === 'object') {
                jsonString = JSON.stringify(jsonData);
                validJson = jsonData;
            } else if (typeof jsonData === 'string') {
                validJson = JSON.parse(jsonData);
                jsonString = JSON.stringify(validJson);
            }
        } catch (error) {
            showNotification('Invalid JSON data: ' + error.message, 'error');
            return;
        }

        // Validate CSS
        let validCss = customCss || '';
        if (validCss && validCss.trim()) {
            let openBraces = (validCss.match(/{/g) || []).length;
            let closeBraces = (validCss.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
                showNotification('Invalid CSS: Unmatched braces ({}).', 'error');
                return;
            }
        }

        setSaving(true);
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // ✅ ΑΥΤΟΜΑΤΗ ΔΗΜΙΟΥΡΓΙΑ SLUG ΑΠΟ ΤΟΝ ΤΙΤΛΟ
// Δημιουργία slug από ελληνικό κείμενο
        const createSlug = (text) => {
            if (!text) return 'untitled';

            // 1. Μετατροπή ελληνικών σε λατινικούς
            const greekToLatin = {
                'α': 'a', 'ά': 'a', 'Α': 'a', 'Ά': 'a',
                'β': 'v', 'Β': 'v',
                'γ': 'g', 'Γ': 'g',
                'δ': 'd', 'Δ': 'd',
                'ε': 'e', 'έ': 'e', 'Ε': 'e', 'Έ': 'e',
                'ζ': 'z', 'Ζ': 'z',
                'η': 'i', 'ή': 'i', 'Η': 'i', 'Ή': 'i',
                'θ': 'th', 'Θ': 'th',
                'ι': 'i', 'ί': 'i', 'ϊ': 'i', 'ΐ': 'i', 'Ι': 'i', 'Ί': 'i',
                'κ': 'k', 'Κ': 'k',
                'λ': 'l', 'Λ': 'l',
                'μ': 'm', 'Μ': 'm',
                'ν': 'n', 'Ν': 'n',
                'ξ': 'x', 'Ξ': 'x',
                'ο': 'o', 'ό': 'o', 'Ο': 'o', 'Ό': 'o',
                'π': 'p', 'Π': 'p',
                'ρ': 'r', 'Ρ': 'r',
                'σ': 's', 'ς': 's', 'Σ': 's',
                'τ': 't', 'Τ': 't',
                'υ': 'u', 'ύ': 'u', 'ϋ': 'u', 'ΰ': 'u', 'Υ': 'Y', 'Ύ': 'Y',
                'φ': 'f', 'Φ': 'f',
                'χ': 'ch', 'Χ': 'ch',
                'ψ': 'ps', 'Ψ': 'ps',
                'ω': 'o', 'ώ': 'o', 'Ω': 'o', 'Ώ': 'o'
            };

            // 2. Μετατροπή κάθε χαρακτήρα
            let result = '';
            for (let char of text) {
                result += greekToLatin[char] || char;
            }

            // 3. Καθαρισμός: μόνο πεζά, αριθμοί και παύλες
            result = result
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')  // Αντικατάσταση ειδικών χαρακτήρων με παύλα
                .replace(/^-|-$/g, '');        // Αφαίρεση παύλων από αρχή και τέλος

            // 4. Αν το αποτέλεσμα είναι κενό, βάλε 'untitled'
            return result || 'untitled';
        };

        // ✅ Αν το name είναι άδειο, δημιούργησε από τον τίτλο
        let slug = formData.name && formData.name.trim() !== ''
            ? formData.name
            : createSlug(formData.title);

        // ✅ Αν το slug είναι άδειο (π.χ. μόνο ειδικοί χαρακτήρες), βάλε 'untitled'
        if (!slug || slug === '') {
            slug = 'untitled';
        }

        // ✅ Έλεγχος για duplicate name (αν υπάρχει ήδη)
        if (isNew) {
            try {
                const checkQuery = `SELECT id FROM ${publicdb}.content WHERE name='${escapeSql(slug)}'`;
                const checkResponse = await fetch(`/api/v1/maria/fa?query=${encodeURIComponent(checkQuery)}`);
                const checkResult = await checkResponse.json();

                if (checkResult.success && checkResult.data && checkResult.data.length > 0) {
                    // Αν υπάρχει ήδη, πρόσθεσε τυχαίο αριθμό
                    slug = `${slug}-${Date.now().toString().slice(-6)}`;
                }
            } catch (err) {
                console.error('Error checking duplicate name:', err);
            }
        }

        const safeTitle = encodeEmoji(formData.title);
        const safeDescription = encodeEmoji(formData.description);
        const safeExcerpt = encodeEmoji(formData.excerpt);
        const safeName = encodeEmoji(slug);
        const safeJsonData = encodeEmoji(jsonString);
        const safeCss = encodeEmoji(validCss);

        // 🔧 ΔΙΟΡΘΩΜΕΝΟ: Σωστό datetime format
        const formatDateTimeForDB = (datetime) => {
            if (!datetime) return null;
            if (datetime.includes('T')) {
                return datetime.replace('T', ' ') + ':00';
            }
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) {
                return datetime;
            }
            try {
                const d = new Date(datetime);
                if (!isNaN(d)) {
                    return d.toISOString().slice(0, 19).replace('T', ' ');
                }
            } catch (e) {}
            return null;
        };

        try {
            if (isNew) {
                // INSERT new content
                const insertParams = {
                    classificationid: parseInt(formData.classificationid) || 1,
                    type: formData.type || 'post',
                    userid: parseInt(formData.userid) || 1,
                    status: parseInt(formData.status) || 1,
                    sort: parseInt(formData.sort) || 0,
                    name: safeName,
                    title: safeTitle || null,
                    description: safeDescription,
                    excerpt: safeExcerpt || null,
                    img: formData.img || null,
                    json: safeJsonData,
                    css: safeCss,
                    lang: formData.lang || 'el',
                    created: now,
                    updated: now,
                    published: formatDateTimeForDB(formData.published || now),
                    view_count: 0
                };

                const response = await fetch('/api/v1/maria/insert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: `${publicdb}.content`,
                        params: insertParams
                    })
                });

                const result = await response.json();

                if (result.success === true) {
                    showNotification('Content created successfully', 'success');
                    setTimeout(() => navigateTo('page-archive'), 1500);
                } else {
                    throw new Error(result.error || 'Create failed');
                }
            } else {
                // UPDATE existing content
                const query = `UPDATE ${publicdb}.content SET
                                                              title='${escapeSql(safeTitle)}',
                                                              description='${escapeSql(safeDescription)}',
                                                              excerpt='${escapeSql(safeExcerpt)}',
                                                              name='${escapeSql(safeName)}',
                                                              classificationid=${parseInt(formData.classificationid) || 1},
                                                              userid=${parseInt(formData.userid) || 1},
                                                              img='${escapeSql(formData.img || '')}',
                                                              status=${parseInt(formData.status) || 1},
                                                              sort=${parseInt(formData.sort) || 0},
                                                              lang='${escapeSql(formData.lang || 'el')}',
                                                              json='${escapeSql(safeJsonData)}',
                                                              css='${escapeSql(safeCss)}',
                                                              updated='${now}',
                                                              published='${formatDateTimeForDB(formData.published) || now}'
                               WHERE id=${contentId}`;

                const response = await fetch('/api/v1/maria/q', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([query, []])
                });

                const result = await response.json();

                if (result.success === true) {
                    showNotification('Content updated successfully', 'success');
                    setTimeout(() => navigateTo('page-archive'), 1500);
                } else {
                    throw new Error(result.error || 'Update failed');
                }
            }
        } catch (error) {
            console.error('Error saving content:', error);
            showNotification('Save failed: ' + error.message, 'error');
        } finally {
            setSaving(false);
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

    // 🔧 ΔΙΟΡΘΩΜΕΝΟ: format για το input datetime-local
    const getFormattedPublished = () => {
        if (!formData.published) return '';
        const val = formData.published;
        if (val.includes('T')) return val.slice(0, 16);
        if (val.includes(' ')) {
            const parts = val.split(' ');
            if (parts.length === 2) {
                return `${parts[0]}T${parts[1].slice(0, 5)}`;
            }
        }
        return val;
    };

    if (loading) {
        return <div className="loading-state">Loading content data...</div>;
    }

    return (
        <div className="content-container">
            {apiStatus.show && (
                <div className={`notification notification-${apiStatus.type}`}>
                    {apiStatus.type === 'success' ? '✓ ' : '✗ '}{apiStatus.message}
                </div>
            )}

            <div className="content-header">
                <h1 className="content-title">
                    {isNew ? '📝 Create New Content' : `✏️ Edit Content #${contentId}`}
                </h1>
                <button className="btn-back" onClick={() => navigateTo('page-archive')}>
                    ← Back to List
                </button>
            </div>

            <div className="form-card">
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                            className="form-select"
                            value={formData.type || 'post'}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="post">Post</option>
                            <option value="page">Page</option>
                            <option value="component">Component</option>
                            <option value="block">Block</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                        >
                            <option value={0}>Draft (0)</option>
                            <option value={1}>Published (1)</option>
                            <option value={2}>Archived (2)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Language</label>
                        <select
                            className="form-select"
                            value={formData.lang || 'el'}
                            onChange={(e) => setFormData({...formData, lang: e.target.value})}
                        >
                            <option value="el">Ελληνικά</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Name (Content URI)<span className="required">*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Content Name"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Sort</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.sort}
                            onChange={(e) => setFormData({...formData, sort: parseInt(e.target.value) || 0})}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Title <span className="required">*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Title"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Published Date & Time</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={getFormattedPublished()}
                            onChange={(e) => setFormData({...formData, published: e.target.value})}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <ClassificationDrop
                            classificationid={formData.classificationid}
                            onChange={(value) => setFormData({...formData, classificationid: value})}
                            publicdb={publicdb}
                            placeholder="-- Select Category --"
                            className="form-select"
                            showNotification={showNotification}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Author</label>
                        <AuthorDropdown
                            selectedUserId={formData.userid}
                            onChange={(value) => setFormData({...formData, userid: value})}
                            publicdb={publicdb}
                            placeholder="-- Select Author --"
                            className="form-select"
                            showNotification={showNotification}
                        />
                    </div>
                </div>

                {/* Image Selection */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Feature Image</label>
                        <div className="image-selection-area">
                            {formData.img && (
                                <div className="image-preview-container">
                                    <img
                                        alt="Current"
                                        className="image-preview"
                                        src={`/media/${formData.img}`}
                                        onError={(e) => {
                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='2.5'%3E%3C/circle%3E%3Cpath d='M21 15l-5-4-3 3-4-4-6 6'%3E%3C/path%3E%3C/svg%3E";
                                            e.target.onerror = null;
                                        }}
                                    />
                                </div>
                            )}
                            <button
                                type="button"
                                className="btn-select-image"
                                onClick={() => setShowMediaToolbox(true)}
                            >
                                🖼️ {formData.img ? 'Change Image' : 'Select Image from Media Library'}
                            </button>
                        </div>
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

                <div className="form-group">
                    <label className="form-label">Excerpt</label>
                    <textarea
                        className="form-textarea"
                        rows="3"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        placeholder="Short summary..."
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description <span className="required">*</span></label>
                    <RichTextEditor
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        language={formData.lang || 'el'}
                        dataSource={jsonData}
                        customCss={customCss}
                        onCssChange={setCustomCss}
                    />
                </div>

                <div className="button-group">
                    <button className="btn-back" onClick={() => navigateTo('page-archive')}>Cancel</button>
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : (isNew ? '📝 Create Content' : '💾 Save Changes')}
                    </button>
                </div>
            </div>
            <ContentNavigation contentId={contentId} onNavigate={handleNavigate} />
        </div>

    );
};

export default ContentOneAdmin;