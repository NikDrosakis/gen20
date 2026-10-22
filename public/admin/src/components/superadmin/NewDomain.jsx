// components/superadmin/NewDomain.jsx
import React, { useState } from 'react';

const NewDomain = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        domain: '',
        type: 'public', // 'public', 'tor', 'internal'
        createFilesystem: true,
        createDatabase: true,
        createNginx: true,
        createDNS: true,
        createSSL: false,
        template: 'default',
        torPort: 80,
        torHiddenService: '',
    });
    const [loading, setLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [step, setStep] = useState(1); // 1: Basic, 2: Advanced

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateDomain = (domain) => {
        // Έλεγχος για .onion domain
        if (formData.type === 'tor') {
            // Tor domain: 16-56 χαρακτήρες .onion
            const onionRegex = /^[a-z2-7]{16,56}\.onion$/;
            if (!onionRegex.test(domain)) {
                return 'Invalid Tor (.onion) domain format. Must be 16-56 characters of a-z2-7 followed by .onion';
            }
            return null;
        }

        // Regular domain validation
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
        if (!domainRegex.test(domain)) {
            return 'Invalid domain format. Example: example.com';
        }
        return null;
    };

    const generateOnionAddress = () => {
        // Δημιουργία τυχαίου onion address (προσομοίωση)
        const chars = 'abcdefghijklmnopqrstuvwxyz234567';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result + '.onion';
    };

    const handleTorGenerate = () => {
        const onion = generateOnionAddress();
        setFormData(prev => ({
            ...prev,
            domain: onion,
            torHiddenService: onion
        }));
        showNotification('🔒 Tor .onion address generated!', 'success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const domainError = validateDomain(formData.domain);
        if (domainError) {
            showNotification(domainError, 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/v1/local/createDomain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: formData.domain,
                    type: formData.type,
                    options: {
                        filesystem: formData.createFilesystem,
                        database: formData.createDatabase,
                        nginx: formData.createNginx,
                        dns: formData.createDNS,
                        ssl: formData.createSSL,
                        template: formData.template,
                        tor: formData.type === 'tor' ? {
                            port: formData.torPort,
                            hiddenService: formData.torHiddenService || formData.domain
                        } : null
                    }
                })
            });

            const result = await response.json();
            console.log(result);
            if (result.success) {
                showNotification(`✅ Domain "${formData.domain}" created successfully!`, 'success');
                setTimeout(() => {
                    if (onSuccess) onSuccess(result.data);
                    if (onClose) onClose();
                }, 1500);
            } else {
                showNotification(`❌ Failed to create domain: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error creating domain:', error);
            showNotification('❌ Error creating domain: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-domain-overlay" onClick={onClose}>
            <div className="new-domain-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🌐 Create New Domain</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {apiStatus.show && (
                    <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                        {apiStatus.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="new-domain-form">
                    <div className="form-tabs">
                        <button
                            type="button"
                            className={`step-btn ${step === 1 ? 'active' : ''}`}
                            onClick={() => setStep(1)}
                        >
                            📝 Basic
                        </button>
                        <button
                            type="button"
                            className={`step-btn ${step === 2 ? 'active' : ''}`}
                            onClick={() => setStep(2)}
                        >
                            ⚙️ Advanced
                        </button>
                    </div>

                    {/* Step 1: Basic */}
                    {step === 1 && (
                        <div className="form-step">
                            <div className="form-group">
                                <label>Domain Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="public">🌐 Public (regular)</option>
                                    <option value="tor">🔒 Tor (.onion)</option>
                                    <option value="internal">🏠 Internal (local)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    {formData.type === 'tor' ? '🔒 .onion Address' : '🌐 Domain Name'}
                                    <span className="required">*</span>
                                </label>
                                <div className="domain-input-group">
                                    <input
                                        type="text"
                                        name="domain"
                                        value={formData.domain}
                                        onChange={handleChange}
                                        placeholder={formData.type === 'tor' ? 'example.onion' : 'example.com'}
                                        className="form-input"
                                        required
                                    />
                                    {formData.type === 'tor' && (
                                        <button
                                            type="button"
                                            onClick={handleTorGenerate}
                                            className="btn-generate"
                                        >
                                            🔄 Generate
                                        </button>
                                    )}
                                </div>
                                <small className="form-hint">
                                    {formData.type === 'tor'
                                        ? '16-56 characters (a-z, 2-7) followed by .onion'
                                        : 'Enter your domain name (e.g., example.com)'
                                    }
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Template</label>
                                <select
                                    name="template"
                                    value={formData.template}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="default">📄 Default (React + API)</option>
                                    <option value="static">📄 Static Website</option>
                                    <option value="api">📄 API Only</option>
                                    <option value="minimal">📄 Minimal</option>
                                </select>
                            </div>

                            {formData.type === 'tor' && (
                                <div className="form-group tor-info">
                                    <div className="tor-badge">🔒 Tor Hidden Service</div>
                                    <p className="tor-description">
                                        This domain will be accessible via the Tor network.
                                        The .onion address will be generated automatically.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Advanced */}
                    {step === 2 && (
                        <div className="form-step">
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="createFilesystem"
                                        checked={formData.createFilesystem}
                                        onChange={handleChange}
                                    />
                                    📁 Create Filesystem
                                </label>
                                <small className="form-hint">/var/www/gs/public/{formData.domain || 'domain'}</small>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="createDatabase"
                                        checked={formData.createDatabase}
                                        onChange={handleChange}
                                    />
                                    🗄️ Create Database
                                </label>
                                <small className="form-hint">gen_{formData.domain ? formData.domain.replace(/\./g, '') : 'domain'}</small>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="createNginx"
                                        checked={formData.createNginx}
                                        onChange={handleChange}
                                    />
                                    ⚙️ Configure Nginx
                                </label>
                                <small className="form-hint">/etc/nginx/conf.d/{formData.domain || 'domain'}.conf</small>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="createDNS"
                                        checked={formData.createDNS}
                                        onChange={handleChange}
                                    />
                                    🌍 Configure DNS
                                </label>
                                <small className="form-hint">/etc/bind/zones/db.{formData.domain || 'domain'}</small>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="createSSL"
                                        checked={formData.createSSL}
                                        onChange={handleChange}
                                    />
                                    🔒 Install SSL Certificate
                                </label>
                                <small className="form-hint">Let's Encrypt (requires valid domain)</small>
                            </div>

                            {formData.type === 'tor' && (
                                <div className="form-group tor-advanced">
                                    <label>Tor Port</label>
                                    <input
                                        type="number"
                                        name="torPort"
                                        value={formData.torPort}
                                        onChange={handleChange}
                                        className="form-input"
                                        min="1"
                                        max="65535"
                                    />
                                    <small className="form-hint">Port for the Tor hidden service</small>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? '⏳ Creating...' : '🚀 Create Domain'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewDomain;