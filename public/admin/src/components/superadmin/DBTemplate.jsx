// components/superadmin/DBTemplate.jsx
import React, { useState, useEffect } from 'react';

const DBTemplate = ({ selectedDomain = '' }) => {
    const [loading, setLoading] = useState(false);
    const [configContent, setConfigContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [filePath, setFilePath] = useState('');

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    // Φόρτωση του template.sql
    const loadConfig = async () => {
        const path = '/var/www/gs/setup/maria/schema/template.sql';
        setFilePath(path);

        setLoading(true);
        try {
            const response = await fetch(`/api/v1/local/getFileContent?path=${encodeURIComponent(path)}`);
            const result = await response.json();

            console.log('🔍 Template API Response:', result);

            if (result.success && result.data) {
                let content = null;

                if (typeof result.data === 'string') {
                    content = result.data;
                } else if (result.data.data) {
                    content = result.data.data;
                } else if (result.data.content) {
                    content = result.data.content;
                }

                if (content) {
                    setConfigContent(content);
                    setOriginalContent(content);
                } else {
                    throw new Error('No content found in response');
                }
            } else {
                // Default template if file doesn't exist
                const template = `-- =====================================================
-- gen_template.sql - Πρότυπο για νέες βάσεις gen_*
-- =====================================================

-- 1. Πίνακας γλωσσών
CREATE TABLE language (
  id int(11) NOT NULL AUTO_INCREMENT,
  sort int(10) UNSIGNED NOT NULL DEFAULT 0,
  code varchar(10) DEFAULT NULL,
  name varchar(150) DEFAULT NULL,
  status ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
  created datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Πίνακας χρηστών
CREATE TABLE user (
  id int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  permission enum('user','writer','editor','admin') NOT NULL DEFAULT 'user',
  img varchar(500) DEFAULT NULL,
  name varchar(100) DEFAULT NULL,
  pass varchar(100) DEFAULT NULL,
  fullname varchar(200) DEFAULT NULL,
  firstname varchar(100) DEFAULT NULL,
  lastname varchar(100) DEFAULT NULL,
  title varchar(300) DEFAULT NULL,
  bio mediumtext DEFAULT NULL,
  email varchar(100) DEFAULT NULL,
  status ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
  display tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
  lang char(2) NOT NULL DEFAULT 'el',
  created datetime NOT NULL DEFAULT current_timestamp(),
  modified datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Πίνακας κατηγοριών
CREATE TABLE classification (
  id int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  name varchar(300) NOT NULL,
  title varchar(300) DEFAULT NULL,
  description text DEFAULT NULL,
  created datetime NOT NULL DEFAULT current_timestamp(),
  updated datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Πίνακας περιεχομένου
CREATE TABLE content (
  id int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  classificationid int(3) UNSIGNED NOT NULL DEFAULT 1,
  sort int(10) UNSIGNED NOT NULL DEFAULT 0,
  type enum('post','page','block') NOT NULL DEFAULT 'post',
  userid int(10) UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
  name varchar(200) DEFAULT NULL,
  title varchar(200) DEFAULT NULL,
  excerpt text DEFAULT NULL,
  description text DEFAULT NULL,
  img varchar(500) DEFAULT NULL,
  published datetime DEFAULT NULL,
  created datetime DEFAULT current_timestamp(),
  updated datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  lang char(2) DEFAULT 'el',
  view_count int(10) UNSIGNED DEFAULT 0,
  json longtext DEFAULT NULL,
  css longtext DEFAULT NULL,
  liking int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY userid (userid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Πίνακας setup
CREATE TABLE setup (
  id mediumint(5) UNSIGNED NOT NULL AUTO_INCREMENT,
  name varchar(200) DEFAULT NULL,
  val varchar(5000) DEFAULT NULL,
  tag varchar(20) DEFAULT NULL,
  label varchar(1000) DEFAULT NULL,
  type enum('text','decimal','json','img','pug','boolean','integer','meta') DEFAULT NULL,
  description longtext DEFAULT NULL,
  permit varchar(50) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Πίνακας σχολίων
CREATE TABLE comment (
  id int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  userid int(10) UNSIGNED NOT NULL,
  type varchar(20) NOT NULL,
  typeid int(10) UNSIGNED NOT NULL,
  content mediumtext NOT NULL,
  status ENUM('inactive','active','closed') NOT NULL DEFAULT 'active',
  reply_id int(10) UNSIGNED NOT NULL DEFAULT 0,
  created datetime NOT NULL DEFAULT current_timestamp(),
  modified datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY uid (userid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- DEFAULT DATA
-- =====================================================
INSERT INTO language (id, sort, code, name, status) VALUES
(1, 0, 'el', 'Ελληνικά', 'active'),
(2, 0, 'en', 'English', 'active');

INSERT INTO classification (id, name, title) VALUES
(1, 'publications', 'Ανακοινώσεις'),
(2, 'actions', 'Εκδηλώσεις/Δράσεις');

INSERT INTO user (id, permission, name, email, status) VALUES
(1, 'admin', 'admin', 'admin@local.host', 'active');`;
                setConfigContent(template);
                setOriginalContent(template);
                showNotification('📝 New template created', 'warning');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            showNotification('Error loading template', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Φόρτωση όταν το component φορτώνει
    useEffect(() => {
        loadConfig();
    }, []);

    // Save config
    const handleSave = async () => {
        if (!configContent) return;

        setSaving(true);
        const path = '/var/www/gs/setup/maria/schema/template.sql';

        try {
            const response = await fetch('/api/v1/local/saveFileContent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: path,
                    content: configContent
                })
            });
            const result = await response.json();

            if (result.success) {
                showNotification('✅ Template saved successfully', 'success');
                setOriginalContent(configContent);
            } else {
                showNotification(`❌ Failed to save: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            showNotification('❌ Error saving template', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setConfigContent(originalContent);
        showNotification('Changes discarded', 'warning');
    };

    // Βοηθητικές συναρτήσεις
    const getLineCount = (content) => {
        if (!content || typeof content !== 'string') return 0;
        return content.split('\n').length;
    };

    const getSize = (content) => {
        if (!content || typeof content !== 'string') return 0;
        return new Blob([content]).size;
    };

    return (
        <div className="tab-pane">
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header">
                <h2>📄 Database Template</h2>
                <div className="header-actions">
                    <span className="file-badge">📁 /var/www/gs/setup/maria/schema/template.sql</span>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading template...</div>
            ) : (
                <div className="db-template-edit-mode">
                    <div className="edit-header">
                        <div className="edit-info">
                            <span className="file-path">📁 {filePath}</span>
                            <span className={`status-badge ${configContent !== originalContent ? 'modified' : ''}`}>
                                {configContent !== originalContent ? '⚠️ Modified' : '✓ Up to date'}
                            </span>
                        </div>
                        <div className="edit-actions">
                            {configContent !== originalContent && (
                                <button className="btn-cancel" onClick={handleCancel}>
                                    ↩️ Discard
                                </button>
                            )}
                            <button className="btn-save" onClick={handleSave} disabled={saving || configContent === originalContent}>
                                {saving ? 'Saving...' : '💾 Save'}
                            </button>
                        </div>
                    </div>

                    <div className="edit-content">
                        <textarea
                            value={configContent || ''}
                            onChange={(e) => setConfigContent(e.target.value)}
                            className="db-template-editor"
                            rows={25}
                            spellCheck={false}
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                tabSize: 2,
                                lineHeight: 1.6
                            }}
                        />
                    </div>

                    <div className="edit-footer">
                        <span className="file-info">
                            Lines: {getLineCount(configContent)} |
                            Size: {getSize(configContent)} bytes
                        </span>
                        <span className="file-hint">
                            💡 This template is used when creating new gen_* databases
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DBTemplate;