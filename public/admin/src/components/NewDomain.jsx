// components/NewDomain.jsx
import React, { useState } from 'react';

const NewDomain = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        domain: '',
        type: 'public',
    });
    const [loading, setLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 6000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateDomain = (domain) => {
        if (formData.type === 'tor') {
            const onionRegex = /^[a-z2-7]{16,56}\.onion$/;
            if (!onionRegex.test(domain)) {
                return 'Invalid Tor (.onion) domain format (16-56 chars of a-z2-7 + .onion)';
            }
            return null;
        }
        if (formData.type === 'internal') {
            if (!domain || domain.length > 253) {
                return 'Invalid internal domain';
            }
            return null;
        }
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
        if (!domainRegex.test(domain)) {
            return 'Invalid domain format. Example: example.com';
        }
        return null;
    };

    const generateOnionAddress = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz234567';
        let result = '';
        for (let i = 0; i < 16; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result + '.onion';
    };

    const handleTorGenerate = () => {
        const onion = generateOnionAddress();
        setFormData(prev => ({ ...prev, domain: onion }));
        showNotification('🔒 Tor .onion address generated', 'success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const domainError = validateDomain(formData.domain);
        if (domainError) {
            showNotification(domainError, 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/god/v1/setup/domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: formData.domain,
                    type: formData.type,
                }),
            });

            const result = await response.json();

            if (result.success) {
                const actual = result.actual_domain || result.domain;
                showNotification(`✅ Domain "${actual}" created successfully`, 'success');
                setFormData({ domain: '', type: 'public' });
                if (onSuccess) onSuccess(result);
            } else {
                showNotification(`❌ ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            showNotification(`❌ ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-domain-page">
            <div className="section-header">
                <h2>🌐 Create New Domain</h2>
                <p className="section-subtitle">
                    The domain will be fully provisioned: filesystem, database, nginx, DNS and optional SSL.
                </p>
            </div>

            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="new-domain-form-page">
                <div className="form-group">
                    <label className="form-label">Domain Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="form-select"
                        disabled={loading}
                    >
                        <option value="public">🌐 Public</option>
                        <option value="tor">🔒 Tor (.onion)</option>
                        <option value="internal">🏠 Internal</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        {formData.type === 'tor' ? '🔒 .onion Address' : '🌐 Domain Name'}
                        <span className="required">*</span>
                    </label>
                    <div className="domain-input-group">
                        <input
                            type="text"
                            name="domain"
                            value={formData.domain}
                            onChange={handleChange}
                            placeholder={formData.type === 'tor' ? 'xxxxx.onion' : 'example.com'}
                            className="form-input"
                            disabled={loading}
                            required
                        />
                        {formData.type === 'tor' && (
                            <button
                                type="button"
                                onClick={handleTorGenerate}
                                className="btn-generate"
                                disabled={loading}
                            >
                                🔄 Generate
                            </button>
                        )}
                    </div>
                    <small className="form-hint">
                        {formData.type === 'tor'
                            ? '16-56 characters (a-z, 2-7) followed by .onion'
                            : formData.type === 'internal'
                                ? 'Internal domain (no external DNS)'
                                : 'Enter the domain name (e.g., example.com)'}
                    </small>
                </div>

                {formData.type === 'tor' && (
                    <div className="tor-info">
                        <div className="tor-badge">🔒 Tor Hidden Service</div>
                        <p className="tor-description">
                            Accessible only via the Tor network. The .onion address is configured automatically.
                            SSL is not supported for .onion domains.
                        </p>
                    </div>
                )}

                <div className="form-summary">
                    <h4>Will be provisioned automatically:</h4>
                    <ul>
                        <li>📁 Filesystem: <code>/var/www/gs/public/{formData.domain || 'domain'}</code></li>
                        <li>🗄️ Database: <code>gen_{formData.domain ? formData.domain.replace(/\./g, '') : 'domain'}</code></li>
                        <li>⚙️ Nginx: <code>/etc/nginx/conf.d/{formData.domain || 'domain'}.conf</code></li>
                        {formData.type !== 'tor' && (
                            <li>🌍 DNS: <code>/etc/bind/zones/db.{formData.domain || 'domain'}</code></li>
                        )}
                        {formData.type === 'tor' && (
                            <li>🔒 Tor hidden service: auto-configured</li>
                        )}
                    </ul>
                    <p className="form-hint" style={{ marginTop: 12 }}>
                        ⏱️ This may take 3–5 minutes (yarn create + install + build).
                    </p>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading || !formData.domain.trim()}
                    >
                        {loading ? '⏳ Creating… (please wait)' : '🚀 Create Domain'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewDomain;