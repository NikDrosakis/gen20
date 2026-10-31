// components/superadmin/DomainManager.jsx
import React, { useState, useEffect, useMemo } from 'react';

const DomainManager = ({
                           domains,              // από gen_admin.domain (μπορεί να είναι κενό)
                           genAdminData,
                           databases,            // από SHOW DATABASES
                           dnsZones,
                           onDomainAction,
                           onAddNew,
                           actionLoading,
                           onRefreshDomains,
                       }) => {
    const [localActionLoading, setLocalActionLoading] = useState({});
    const [realFsStatus, setRealFsStatus] = useState(null);
    const [realDatabases, setRealDatabases] = useState([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingDatabases, setIsLoadingDatabases] = useState(true);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    const getGenAdminFsCheck = (domainName) => {
        const record = genAdminData?.find(item => item.name === domainName);
        return record ? (record.fsys_check === 1) : false;
    };

    const getFsCheck = (domainName) => {
        if (realFsStatus === null) return null;
        if (realFsStatus && realFsStatus[domainName]) {
            return realFsStatus[domainName].exists;
        }
        return false;
    };

    // ============================================================
    // 1. Φόρτωση πραγματικών φακέλων (fresh — χωρίς cache)
    // ============================================================
    const fetchPublicFolders = async () => {
        setIsLoadingFolders(true);
        try {
            const response = await fetch(
                `/api/v1/local/getPublicFolders?t=${Date.now()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                    },
                    cache: 'no-store',
                }
            );
            const result = await response.json();

            if (result.success) {
                setRealFsStatus(result.data || {});
            } else {
                console.error('Fetch folders failed:', result.error);
                setRealFsStatus({});
                showNotification('Failed to fetch folders', 'error');
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
            setRealFsStatus({});
            showNotification('Error fetching folders: ' + error.message, 'error');
        } finally {
            setIsLoadingFolders(false);
        }
    };

    // ============================================================
    // 2. Φόρτωση πραγματικών databases (fresh — χωρίς cache)
    // ============================================================
    const fetchRealDatabases = async () => {
        setIsLoadingDatabases(true);
        try {
            const response = await fetch(
                `/api/v1/maria/show?q=databases&t=${Date.now()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                    },
                    cache: 'no-store',
                }
            );
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                // Μόνο gen_* databases
                const genDbs = result.data.filter(db => db.startsWith('gen_'));
                setRealDatabases(genDbs);
            } else {
                setRealDatabases([]);
            }
        } catch (error) {
            console.error('Error fetching real databases:', error);
            setRealDatabases([]);
        } finally {
            setIsLoadingDatabases(false);
        }
    };

    useEffect(() => {
        fetchPublicFolders();
        fetchRealDatabases();
    }, []);

    const handleRefreshAll = async () => {
        await Promise.all([fetchPublicFolders(), fetchRealDatabases()]);
        if (onRefreshDomains) onRefreshDomains();
        showNotification('✅ Data refreshed successfully', 'success');
    };

    // ============================================================
    // 3. Συνδυασμός ΟΛΩΝ των πηγών σε ένα array domains
    // ============================================================
    const allDomains = useMemo(() => {
        const map = new Map();   // name → domain object

        // α) Από gen_admin.domain (επίσημα)
        (domains || []).forEach(d => {
            if (!d || !d.name) return;
            map.set(d.name, {
                name: d.name,
                source: 'gen_admin',
                raw: d,
            });
        });

        // β) Από πραγματικές databases (gen_*)
        realDatabases.forEach(dbName => {
            // gen_examplecom  →  example.com
            // gen_example_com →  example.com (fallback)
            const baseName = dbName.replace(/^gen_/, '');

            // Δοκίμασε πρώτα με τελεία (αν υπάρχει στα gen_admin)
            let domainName = null;

            // Αν υπάρχει ήδη στο map (από gen_admin) → skip
            for (const existing of map.keys()) {
                const existingDb = 'gen_' + existing.replace(/\./g, '');
                const existingDbUnderscore = 'gen_' + existing.replace(/\./g, '_');
                if (existingDb === dbName || existingDbUnderscore === dbName) {
                    domainName = existing;
                    break;
                }
            }

            if (domainName) return;   // υπάρχει ήδη

            // Δεν υπάρχει → πρόσθεσέ το με το baseName ως domain name
            // (δεν ξέρουμε αν είναι example.com ή example_com — κρατάμε το raw)
            map.set(baseName, {
                name: baseName,
                source: 'database',
                raw: { name: baseName, _db: dbName },
            });
        });

        // γ) Από πραγματικούς φακέλους
        Object.keys(realFsStatus || {}).forEach(folderName => {
            if (map.has(folderName)) return;
            map.set(folderName, {
                name: folderName,
                source: 'filesystem',
                raw: { name: folderName },
            });
        });

        // Επιστροφή ταξινομημένα αλφαβητικά
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [domains, realDatabases, realFsStatus]);

    // Local search filter
    const filteredDomains = allDomains.filter(d =>
        !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ============================================================
    // 4. Generic API caller με notifications
    // ============================================================
    const callApi = async (endpoint, action, domain, component = null) => {
        const key = `${domain}_${action}_${component || ''}`;
        setLocalActionLoading(prev => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: domain,
                    domain: domain,
                    component: component,
                }),
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ ${action} successful for ${domain}`, 'success');
                await Promise.all([fetchPublicFolders(), fetchRealDatabases()]);
                if (onRefreshDomains) onRefreshDomains();
            } else {
                showNotification(`❌ ${action} failed: ${result.error || 'Unknown error'}`, 'error');
            }
            return result;
        } catch (error) {
            console.error(`Error in ${action}:`, error);
            showNotification(`❌ ${action} failed: ${error.message}`, 'error');
        } finally {
            setLocalActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    // Filesystem
    const handleInstallFilesystem = async (domain) => {
        if (!window.confirm(`Create folder for ${domain}?`)) return;
        await callApi('/api/v1/local/apiInstallViteApp', 'Create Folder', domain);
    };
    const handleUninstallFilesystem = async (domain) => {
        if (!window.confirm(`⚠️ DANGER: Delete folder for ${domain}? This cannot be undone!`)) return;
        await callApi('/api/v1/local/uninstallDomain', 'Delete Folder', domain);
    };
    const handleEditFilesystem = (domain) => {
        window.open(`/admin#media?path=/var/www/gs/public/${domain}`, '_blank');
    };

    // Nginx
    const handleInstallNginx = async (domain) => {
        if (!window.confirm(`Install Nginx configuration for ${domain}?`)) return;
        await callApi('/api/v1/local/addHost', 'Install Nginx', domain);
    };
    const handleUninstallNginx = async (domain) => {
        if (!window.confirm(`Remove Nginx configuration for ${domain}?`)) return;
        await callApi('/api/v1/local/delHost', 'Uninstall Nginx', domain);
    };
    const handleEditNginx = (domain) => {
        window.open(`/admin#media?path=/etc/nginx/sites-available/${domain}.conf`, '_blank');
    };

    // DNS
    const handleInstallDNS = async (domain) => {
        if (!window.confirm(`Install DNS zone for ${domain}?`)) return;
        await callApi('/api/v1/local/installDNS', 'Install DNS', domain);
    };
    const handleUninstallDNS = async (domain) => {
        if (!window.confirm(`Remove DNS zone for ${domain}?`)) return;
        await callApi('/api/v1/local/uninstallDNS', 'Uninstall DNS', domain);
    };
    const handleEditDNS = (domain) => {
        window.open(`/admin#media?path=/etc/bind/zones/db.${domain}`, '_blank');
    };

    // Database — τώρα ελέγχει και τα realDatabases
    const checkDatabaseExists = (domainName) => {
        const dbName = 'gen_' + domainName.replace(/\./g, '');
        const dbNameUnderscores = 'gen_' + domainName.replace(/\./g, '_');

        // α) Από τα realDatabases (fresh)
        if (realDatabases.includes(dbName) || realDatabases.includes(dbNameUnderscores)) {
            return true;
        }

        // β) Από τα props databases (fallback)
        if (Array.isArray(databases)) {
            return databases.some(db => {
                const name = typeof db === 'string' ? db : (db?.Database || db?.name);
                return name === dbName || name === dbNameUnderscores;
            });
        }

        return false;
    };

    const handleInstallDatabase = async (domain) => {
        if (!window.confirm(`Create database for ${domain}?`)) return;
        await callApi('/api/v1/local/installDatabase', 'Install Database', domain);
    };
    const handleUninstallDatabase = async (domain) => {
        if (!window.confirm(`⚠️ DANGER: Delete database for ${domain}? This will delete ALL data!`)) return;
        await callApi('/api/v1/local/uninstallDatabase', 'Uninstall Database', domain);
    };
    const handleEditDatabase = (domain) => {
        const dbName = 'gen_' + domain.replace(/\./g, '');
        window.open(`/admin#db?database=${dbName}`, '_blank');
    };

    // DNS zone check
    const checkDnsZoneExists = (domainName) => {
        if (!dnsZones || dnsZones.length === 0) return false;
        return dnsZones.some(zone => {
            if (typeof zone === 'string') {
                return zone.includes(domainName) || zone.endsWith(`/${domainName}`) || zone === domainName;
            }
            if (zone.domain) return zone.domain === domainName;
            if (zone.name) return zone.name === domainName;
            if (zone.file) return zone.file.includes(domainName);
            return false;
        });
    };

    // SSL
    const handleInstallSSL = async (domain) => {
        if (!window.confirm(`Install SSL certificate for ${domain}?`)) return;
        await callApi('/api/v1/local/installSSL', 'Install SSL', domain);
    };
    const handleUninstallSSL = async (domain) => {
        if (!window.confirm(`Remove SSL certificate for ${domain}?`)) return;
        await callApi('/api/v1/local/delSSL', 'Uninstall SSL', domain);
    };
    const handleEditSSL = (domain) => {
        window.open(`/admin#ssl?domain=${domain}`, '_blank');
    };

    const handleEdit = (domain, component) => {
        switch (component) {
            case 'filesystem': return handleEditFilesystem(domain);
            case 'nginx':      return handleEditNginx(domain);
            case 'dns':        return handleEditDNS(domain);
            case 'database':   return handleEditDatabase(domain);
            case 'ssl':        return handleEditSSL(domain);
            default:           console.log('Edit', component, domain);
        }
    };

    const isActionLoading = (domain, action, component = null) => {
        const key = `${domain}_${action}_${component || ''}`;
        return localActionLoading[key] || actionLoading;
    };

    // ============================================================
    // Render
    // ============================================================
    return (
        <div className="tab-pane">
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header">
                <h2>Domain Management</h2>

                <span className="db-count" style={{ marginLeft: 8 }}>
                    {allDomains.length} domains
                </span>

                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Search domain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginLeft: 12 }}
                />

                <button
                    className="btn-refresh-all"
                    onClick={handleRefreshAll}
                    disabled={isLoadingFolders || isLoadingDatabases}
                    style={{ marginLeft: '10px' }}
                >
                    {isLoadingFolders || isLoadingDatabases ? '⏳ Loading...' : '🔄 Refresh All'}
                </button>

                <button className="btn-primary" onClick={onAddNew}>
                    + Add New Domain
                </button>
            </div>

            <div>
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Domain</th>
                        <th>Source</th>
                        <th>GenAdmin (fsys_check)</th>
                        <th>Filesystem</th>
                        <th>Nginx</th>
                        <th>DNS Zone</th>
                        <th>Database</th>
                        <th>SSL</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredDomains.length === 0 ? (
                        <tr>
                            <td colSpan="9" style={{ textAlign: 'center' }}>
                                {searchTerm
                                    ? `No domains match "${searchTerm}"`
                                    : 'No domains found (neither in gen_admin, nor as databases/folders)'}
                            </td>
                        </tr>
                    ) : (
                        filteredDomains.map(domain => {
                            const name = domain.name;
                            const genAdminValue = getGenAdminFsCheck(name);
                            const fsRealValue = getFsCheck(name);
                            const dbExists = checkDatabaseExists(name);
                            const dnsExists = checkDnsZoneExists(name);
                            const dbName = 'gen_' + name.replace(/\./g, '');
                            const raw = domain.raw || {};

                            // ✅ Badge για την πηγή
                            const sourceBadge = {
                                gen_admin:  { icon: '📋', title: 'Registered in gen_admin.domain' },
                                database:   { icon: '🗄️', title: 'Found as database only' },
                                filesystem: { icon: '📁', title: 'Found as folder only' },
                            }[domain.source] || { icon: '❓', title: 'Unknown source' };

                            return (
                                <tr key={name}>
                                    <td style={{ textAlign: 'left' }}>
                                        <strong>{name}</strong>
                                        {dbExists && (
                                            <span className="db-badge" title={`Database: ${dbName}`}>🗄️</span>
                                        )}
                                    </td>

                                    <td title={sourceBadge.title} style={{ textAlign: 'center', fontSize: 16 }}>
                                        {sourceBadge.icon}
                                    </td>

                                    <td className={genAdminValue ? 'status-ok' : 'status-missing'}>
                                        {genAdminValue ? '✓' : '✗'}
                                    </td>

                                    <td className={fsRealValue ? 'status-ok' : 'status-missing'}>
                                        {isLoadingFolders && realFsStatus === null
                                            ? '⏳'
                                            : (fsRealValue ? '✓' : '✗')}
                                        <div className="action-buttons-cell">
                                            {fsRealValue ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallFilesystem(name)} disabled={isActionLoading(name, 'uninstall', 'filesystem')} title="Delete Folder">🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(name, 'filesystem')} disabled={isActionLoading(name, 'edit', 'filesystem')} title="Edit Files">✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallFilesystem(name)} disabled={isActionLoading(name, 'install', 'filesystem')} title="Create Folder">📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td className={raw.nginx_check ? 'status-ok' : 'status-missing'}>
                                        {raw.nginx_check ? '✓' : '✗'}
                                        <div className="action-buttons-cell">
                                            {raw.nginx_check ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallNginx(name)} disabled={isActionLoading(name, 'uninstall', 'nginx')}>🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(name, 'nginx')} disabled={isActionLoading(name, 'edit', 'nginx')}>✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallNginx(name)} disabled={isActionLoading(name, 'install', 'nginx')}>📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td className={dnsExists ? 'status-ok' : 'status-missing'}>
                                        {dnsExists ? '✓' : '✗'}
                                        <div className="action-buttons-cell">
                                            {dnsExists ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallDNS(name)} disabled={isActionLoading(name, 'uninstall', 'dns')}>🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(name, 'dns')} disabled={isActionLoading(name, 'edit', 'dns')}>✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallDNS(name)} disabled={isActionLoading(name, 'install', 'dns')}>📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td className={dbExists ? 'status-ok' : 'status-missing'}>
                                        {dbExists ? '✓' : '✗'}
                                        {dbExists && <span className="db-name">{dbName}</span>}
                                        <div className="action-buttons-cell">
                                            {dbExists ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallDatabase(name)} disabled={isActionLoading(name, 'uninstall', 'database')}>🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(name, 'database')} disabled={isActionLoading(name, 'edit', 'database')}>✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallDatabase(name)} disabled={isActionLoading(name, 'install', 'database')}>📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td className={raw.ssl_check ? 'status-ok' : 'status-missing'}>
                                        {raw.ssl_check ? '✓' : '✗'}
                                        <div className="action-buttons-cell">
                                            {raw.ssl_check ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallSSL(name)} disabled={isActionLoading(name, 'uninstall', 'ssl')}>🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(name, 'ssl')} disabled={isActionLoading(name, 'edit', 'ssl')}>✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallSSL(name)} disabled={isActionLoading(name, 'install', 'ssl')}>📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        <button
                                            className="btn-small"
                                            onClick={() => onDomainAction(name, 'fix')}
                                            disabled={actionLoading}
                                        >
                                            🔧 Fix All
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DomainManager;