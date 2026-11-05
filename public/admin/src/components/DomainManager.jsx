// components/DomainManager.jsx
import React, { useState, useEffect, useMemo } from 'react';

const DomainManager = ({
                           genAdminData,
                           databases,
                           onAddNew,
                           actionLoading,
                           onRefreshDomains,
                       }) => {
    const [localActionLoading, setLocalActionLoading] = useState({});
    const [realFsStatus, setRealFsStatus] = useState(null);
    const [realDatabases, setRealDatabases] = useState([]);
    const [realZones, setRealZones] = useState({});      // domain → true
    const [realSSL, setRealSSL] = useState({});          // domain → true
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingDatabases, setIsLoadingDatabases] = useState(true);
    const [isLoadingZones, setIsLoadingZones] = useState(true);
    const [isLoadingSSL, setIsLoadingSSL] = useState(true);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    // ============================================================
    // Flags από gen_admin (fallback)
    // ============================================================
    const getGenAdminFsCheck = (domainName) => {
        const record = genAdminData?.find(item => item.name === domainName);
        return record ? (record.fsys_check === 1) : false;
    };

    const getNginxCheck = (domainName) => {
        const record = genAdminData?.find(item => item.name === domainName);
        return record ? (record.nginx_check === 1) : false;
    };

    // ============================================================
    // 1. Fetch filesystem
    // ============================================================
    const fetchPublicFolders = async () => {
        setIsLoadingFolders(true);
        try {
            let result = null;
            try {
                const r = await fetch(`/god/v1/fs/list?t=${Date.now()}`, { cache: 'no-store' });
                if (r.ok) {
                    const j = await r.json();
                    if (j.success && j.data?.directories) {
                        result = { success: true, data: j.data.directories };
                    }
                }
            } catch (_) { /* ignore */ }

            if (!result) {
                const r = await fetch(`/api/v1/local/getPublicFolders?t=${Date.now()}`, {
                    cache: 'no-store',
                });
                result = await r.json();
            }

            if (result.success) {
                const normalized = {};
                for (const [name, info] of Object.entries(result.data || {})) {
                    if (typeof info === 'boolean') {
                        normalized[name] = { exists: info, path: `/var/www/gs/public/${name}` };
                    } else if (info && typeof info === 'object') {
                        normalized[name] = {
                            exists: info.exists !== false,
                            path: info.path || `/var/www/gs/public/${name}`,
                            modified: info.modified,
                        };
                    }
                }
                setRealFsStatus(normalized);
            } else {
                setRealFsStatus({});
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
            setRealFsStatus({});
        } finally {
            setIsLoadingFolders(false);
        }
    };

    // ============================================================
    // 2. Fetch databases
    // ============================================================
    const fetchRealDatabases = async () => {
        setIsLoadingDatabases(true);
        try {
            const response = await fetch(
                `/api/v1/maria/show?q=databases&t=${Date.now()}`,
                { cache: 'no-store' }
            );
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                setRealDatabases(result.data.filter(db => db.startsWith('gen_')));
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

    // ============================================================
    // 3. Fetch zones από god
    // ============================================================
    const fetchZones = async () => {
        setIsLoadingZones(true);
        try {
            const r = await fetch(`/god/v1/bind/list?t=${Date.now()}`, { cache: 'no-store' });
            const j = await r.json();
            if (j.success && j.data?.zones) {
                const map = {};
                j.data.zones.forEach(z => { map[z.domain] = true; });
                setRealZones(map);
            } else {
                setRealZones({});
            }
        } catch (error) {
            console.error('Error fetching zones:', error);
            setRealZones({});
        } finally {
            setIsLoadingZones(false);
        }
    };

    // ============================================================
    // 4. Fetch SSL από god
    // ============================================================
    const fetchSSL = async () => {
        setIsLoadingSSL(true);
        try {
            const r = await fetch(`/god/v1/ssl/list?t=${Date.now()}`, { cache: 'no-store' });
            const j = await r.json();
            if (j.success && j.data) {
                const map = {};
                for (const [domain, info] of Object.entries(j.data)) {
                    if (info.exists) map[domain] = true;
                }
                setRealSSL(map);
            } else {
                setRealSSL({});
            }
        } catch (error) {
            console.error('Error fetching SSL:', error);
            setRealSSL({});
        } finally {
            setIsLoadingSSL(false);
        }
    };

    useEffect(() => {
        fetchPublicFolders();
        fetchRealDatabases();
        fetchZones();
        fetchSSL();
    }, []);

    const handleRefreshAll = async () => {
        await Promise.all([
            fetchPublicFolders(),
            fetchRealDatabases(),
            fetchZones(),
            fetchSSL(),
        ]);
        if (onRefreshDomains) onRefreshDomains();
        showNotification('✅ Data refreshed', 'success');
    };

    // ============================================================
    // 5. Λίστα — ΜΟΝΟ από filesystem
    // ============================================================
    const allDomains = useMemo(() => {
        const fsNames = Object.keys(realFsStatus || {});
        return fsNames
            .map(name => ({
                name,
                path: realFsStatus[name]?.path || `/var/www/gs/public/${name}`,
                modified: realFsStatus[name]?.modified,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [realFsStatus]);

    const filteredDomains = allDomains.filter(d =>
        !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ============================================================
    // Helpers
    // ============================================================
    const postGod = async (path, body) => {
        const res = await fetch(`/god/v1${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    };

    const postPhp = async (path, body) => {
        const res = await fetch(`/api/v1/local${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    };

    const withLoading = async (key, fn) => {
        setLocalActionLoading(prev => ({ ...prev, [key]: true }));
        try {
            return await fn();
        } finally {
            setLocalActionLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    // ============================================================
    // Filesystem — ΜΟΝΟ uninstall + edit
    // ============================================================
    const handleUninstallFilesystem = async (domain) => {
        if (!window.confirm(`⚠️ Delete folder for ${domain}? This cannot be undone!`)) return;
        await withLoading(`${domain}_uninstall_fs`, async () => {
            try {
                const result = await postPhp('/uninstallDomain', { domain });
                if (result.success) {
                    showNotification(`✅ Folder deleted for ${domain}`, 'success');
                    await fetchPublicFolders();
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error || 'Unknown error'}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleEditFilesystem = (domain) => {
        window.open(`/admin#media?path=/var/www/gs/public/${domain}`, '_blank');
    };

    // ============================================================
    // Nginx → god
    // ============================================================
    const generateDefaultNginx = (domain) => {
        return `server {
    listen 80;
    server_name ${domain} www.${domain};
    root /var/www/gs/public/${domain}/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;
    };

    const handleInstallNginx = async (domain) => {
        if (!window.confirm(`Install Nginx configuration for ${domain}?`)) return;
        await withLoading(`${domain}_install_nginx`, async () => {
            try {
                const result = await postGod('/hosts/save', {
                    domain,
                    content: generateDefaultNginx(domain),
                });
                if (result.success) {
                    showNotification(`✅ Nginx installed for ${domain}`, 'success');
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleUninstallNginx = async (domain) => {
        if (!window.confirm(`Remove Nginx configuration for ${domain}?`)) return;
        await withLoading(`${domain}_uninstall_nginx`, async () => {
            try {
                const result = await postGod('/hosts/delete', { domain });
                if (result.success) {
                    showNotification(`✅ Nginx removed for ${domain}`, 'success');
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleEditNginx = (domain) => {
        window.open(`/admin/superadmin?tab=nginx`, '_blank');
    };

    // ============================================================
    // DNS → god
    // ============================================================
    const generateDefaultZone = (domain) => {
        const ip = '135.181.219.173';
        return `$TTL 6000
${domain}.    IN    SOA    ns1.${domain}. server.${domain}. (
    2024010101
    1200
    3600
    1209601
    60000 )

${domain}.    IN    NS    ns1.${domain}.
${domain}.    IN    NS    ns2.${domain}.
${domain}.    IN    A     ${ip}
ns1.${domain}. IN    A     ${ip}
ns2.${domain}. IN    A     ${ip}
mail.${domain}. IN   A     ${ip}
${domain}.    IN    MX    10    mail.${domain}.
`;
    };

    const handleInstallDNS = async (domain) => {
        if (!window.confirm(`Install DNS zone for ${domain}?`)) return;
        await withLoading(`${domain}_install_dns`, async () => {
            try {
                const result = await postGod('/bind/save', {
                    domain,
                    content: generateDefaultZone(domain),
                });
                if (result.success) {
                    showNotification(`✅ DNS installed for ${domain}`, 'success');
                    await fetchZones();
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleUninstallDNS = async (domain) => {
        if (!window.confirm(`Remove DNS zone for ${domain}?`)) return;
        await withLoading(`${domain}_uninstall_dns`, async () => {
            try {
                const result = await postGod('/bind/delete', { domain });
                if (result.success) {
                    showNotification(`✅ DNS removed for ${domain}`, 'success');
                    await fetchZones();
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleEditDNS = (domain) => {
        window.open(`/admin/superadmin?tab=dns`, '_blank');
    };

    // ============================================================
    // Database → PHP
    // ============================================================
    const checkDatabaseExists = (domainName) => {
        const dbName = 'gen_' + domainName.replace(/\./g, '');
        const dbNameUnderscores = 'gen_' + domainName.replace(/\./g, '_');

        if (realDatabases.includes(dbName) || realDatabases.includes(dbNameUnderscores)) {
            return true;
        }

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
        await withLoading(`${domain}_install_db`, async () => {
            try {
                const result = await postPhp('/installDatabase', { domain });
                if (result.success) {
                    showNotification(`✅ Database created for ${domain}`, 'success');
                    await fetchRealDatabases();
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleUninstallDatabase = async (domain) => {
        if (!window.confirm(`⚠️ Delete database for ${domain}? ALL data will be lost!`)) return;
        await withLoading(`${domain}_uninstall_db`, async () => {
            try {
                const result = await postPhp('/uninstallDatabase', { domain });
                if (result.success) {
                    showNotification(`✅ Database deleted for ${domain}`, 'success');
                    await fetchRealDatabases();
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleEditDatabase = (domain) => {
        const dbName = 'gen_' + domain.replace(/\./g, '');
        window.open(`/admin#db?database=${dbName}`, '_blank');
    };

    // ============================================================
    // SSL → god
    // ============================================================
    const handleInstallSSL = async (domain) => {
        if (!window.confirm(`Install SSL certificate for ${domain}?`)) return;
        await withLoading(`${domain}_install_ssl`, async () => {
            try {
                const result = await postGod('/ssl/action', { action: 'issue', domain });
                if (result.success) {
                    showNotification(`✅ SSL installed for ${domain}`, 'success');
                    await fetchSSL();
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleUninstallSSL = async (domain) => {
        if (!window.confirm(`Remove SSL certificate for ${domain}?`)) return;
        await withLoading(`${domain}_uninstall_ssl`, async () => {
            try {
                const result = await postGod('/ssl/action', { action: 'delete', domain });
                if (result.success) {
                    showNotification(`✅ SSL removed for ${domain}`, 'success');
                    await fetchSSL();
                    if (onRefreshDomains) onRefreshDomains();
                } else {
                    showNotification(`❌ ${result.error}`, 'error');
                }
            } catch (e) {
                showNotification(`❌ ${e.message}`, 'error');
            }
        });
    };

    const handleEditSSL = (domain) => {
        window.open(`/admin/superadmin?tab=ssl`, '_blank');
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

    const isActionLoading = (domain, action) => {
        const key = `${domain}_${action}`;
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
                    disabled={isLoadingFolders || isLoadingDatabases || isLoadingZones || isLoadingSSL}
                    style={{ marginLeft: '10px' }}
                >
                    {isLoadingFolders || isLoadingDatabases || isLoadingZones || isLoadingSSL
                        ? '⏳ Loading...'
                        : '🔄 Refresh All'}
                </button>
                <button className="btn-primary" onClick={onAddNew}>
                    + Add New Domain
                </button>
            </div>

            {isLoadingFolders && realFsStatus === null ? (
                <div className="loading-state">Loading domains from filesystem...</div>
            ) : (
                <div>
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Domain</th>
                            <th>GenAdmin</th>
                            <th>Filesystem</th>
                            <th>Nginx</th>
                            <th>DNS Zone</th>
                            <th>Database</th>
                            <th>SSL</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredDomains.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    {searchTerm
                                        ? `No domains match "${searchTerm}"`
                                        : 'No domains found in /var/www/gs/public/'}
                                </td>
                            </tr>
                        ) : (
                            filteredDomains.map(domain => {
                                const name = domain.name;
                                const genAdminValue = getGenAdminFsCheck(name);
                                const nginxExists = getNginxCheck(name);
                                const dbExists = checkDatabaseExists(name);

                                // DNS & SSL: από god, όχι από gen_admin
                                const zoneExists = !!realZones[name];
                                const sslExists = !!realSSL[name];

                                const dbName = 'gen_' + name.replace(/\./g, '');

                                return (
                                    <tr key={name}>
                                        <td style={{ textAlign: 'left' }}>
                                            <strong>{name}</strong>
                                            {dbExists && (
                                                <span className="db-badge" title={`Database: ${dbName}`}>🗄️</span>
                                            )}
                                        </td>

                                        <td className={genAdminValue ? 'status-ok' : 'status-missing'}>
                                            {genAdminValue ? '✓' : '✗'}
                                        </td>

                                        <td className="status-ok">
                                            ✓
                                            <div className="action-buttons-cell">
                                                <button
                                                    className="btn-uninstall"
                                                    onClick={() => handleUninstallFilesystem(name)}
                                                    disabled={isActionLoading(name, 'uninstall_fs')}
                                                    title="Delete folder"
                                                >🗑️</button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(name, 'filesystem')}
                                                    title="Edit files"
                                                >✏️</button>
                                            </div>
                                        </td>

                                        <td className={nginxExists ? 'status-ok' : 'status-missing'}>
                                            {nginxExists ? '✓' : '✗'}
                                            <div className="action-buttons-cell">
                                                {nginxExists ? (
                                                    <>
                                                        <button
                                                            className="btn-uninstall"
                                                            onClick={() => handleUninstallNginx(name)}
                                                            disabled={isActionLoading(name, 'uninstall_nginx')}
                                                        >🗑️</button>
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => handleEdit(name, 'nginx')}
                                                        >✏️</button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn-install"
                                                        onClick={() => handleInstallNginx(name)}
                                                        disabled={isActionLoading(name, 'install_nginx')}
                                                    >📥 Install</button>
                                                )}
                                            </div>
                                        </td>

                                        <td className={zoneExists ? 'status-ok' : 'status-missing'}>
                                            {zoneExists ? '✓' : '✗'}
                                            <div className="action-buttons-cell">
                                                {zoneExists ? (
                                                    <>
                                                        <button
                                                            className="btn-uninstall"
                                                            onClick={() => handleUninstallDNS(name)}
                                                            disabled={isActionLoading(name, 'uninstall_dns')}
                                                        >🗑️</button>
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => handleEdit(name, 'dns')}
                                                        >✏️</button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn-install"
                                                        onClick={() => handleInstallDNS(name)}
                                                        disabled={isActionLoading(name, 'install_dns')}
                                                    >📥 Install</button>
                                                )}
                                            </div>
                                        </td>

                                        <td className={dbExists ? 'status-ok' : 'status-missing'}>
                                            {dbExists ? '✓' : '✗'}
                                            {dbExists && <span className="db-name">{dbName}</span>}
                                            <div className="action-buttons-cell">
                                                {dbExists ? (
                                                    <>
                                                        <button
                                                            className="btn-uninstall"
                                                            onClick={() => handleUninstallDatabase(name)}
                                                            disabled={isActionLoading(name, 'uninstall_db')}
                                                        >🗑️</button>
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => handleEdit(name, 'database')}
                                                        >✏️</button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn-install"
                                                        onClick={() => handleInstallDatabase(name)}
                                                        disabled={isActionLoading(name, 'install_db')}
                                                    >📥 Install</button>
                                                )}
                                            </div>
                                        </td>

                                        <td className={sslExists ? 'status-ok' : 'status-missing'}>
                                            {sslExists ? '✓' : '✗'}
                                            <div className="action-buttons-cell">
                                                {sslExists ? (
                                                    <>
                                                        <button
                                                            className="btn-uninstall"
                                                            onClick={() => handleUninstallSSL(name)}
                                                            disabled={isActionLoading(name, 'uninstall_ssl')}
                                                        >🗑️</button>
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => handleEdit(name, 'ssl')}
                                                        >✏️</button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn-install"
                                                        onClick={() => handleInstallSSL(name)}
                                                        disabled={isActionLoading(name, 'install_ssl')}
                                                    >📥 Install</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DomainManager;