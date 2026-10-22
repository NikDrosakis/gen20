// components/superadmin/DomainManager.jsx
import React, { useState, useEffect } from 'react';

const DomainManager = ({ domains, genAdminData, databases, dnsZones, onDomainAction, onAddNew, actionLoading, onRefreshDomains, selectedDomain = '' }) => {
    const [localActionLoading, setLocalActionLoading] = useState({});
    const [realFsStatus, setRealFsStatus] = useState(null);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [apiStatus, setApiStatus] = useState({ show: false, message: '', type: '' });

    const filteredDomains = selectedDomain
        ? domains.filter(domain => domain.name === selectedDomain)
        : domains;

    // ✅ Show notification function
    const showNotification = (message, type = 'success') => {
        setApiStatus({ show: true, message, type });
        setTimeout(() => setApiStatus({ show: false, message: '', type: '' }), 4000);
    };

    const getGenAdminFsCheck = (domainName) => {
        const record = genAdminData?.find(item => item.name === domainName);
        return record ? (record.fsys_check === 1) : false;
    };

    const getFsCheck = (domainName) => {
        if (realFsStatus === null) {
            return null;
        }
        if (realFsStatus && realFsStatus[domainName]) {
            return realFsStatus[domainName].exists;
        }
        return false;
    };

    const fetchPublicFolders = async () => {
        setIsLoadingFolders(true);
        try {
            const response = await fetch('/api/v1/local/getPublicFolders', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
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

    useEffect(() => {
        fetchPublicFolders();
    }, []);

    const handleRefreshFilesystems = async () => {
        await fetchPublicFolders();
        if (onRefreshDomains) onRefreshDomains();
        showNotification('✅ Folders refreshed successfully', 'success');
    };

    // ✅ Generic API caller με notifications
    const callApi = async (endpoint, action, domain, component = null) => {
        const key = `${domain}_${action}_${component || ''}`;
        setLocalActionLoading(prev => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: domain,      // ✅ Το domain ως key
                    domain: domain,   // ✅ Και ξεχωριστά το domain
                    component: component
                })
            });
            const result = await response.json();

            if (result.success) {
                showNotification(`✅ ${action} successful for ${domain}`, 'success');
                await fetchPublicFolders();
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

    // Filesystem actions
    const handleInstallFilesystem = async (domain) => {
        if (!window.confirm(`Create folder for ${domain}?`)) return;
        await callApi('/api/v1/local/apiInstallViteApp', 'Create Folder', domain);
    };

    const handleUninstallFilesystem = async (domain) => {
        if (!window.confirm(`⚠️ DANGER: Delete folder for ${domain}? This cannot be undone!`)) return;
        await callApi('/api/v1/local/uninstallDomain', 'Delete Folder', domain);
    };

    const handleEditFilesystem = async (domain) => {
        window.open(`/admin#media?path=/var/www/gs/public/${domain}`, '_blank');
    };

    // Nginx actions
    const handleInstallNginx = async (domain) => {
        if (!window.confirm(`Install Nginx configuration for ${domain}?`)) return;
        await callApi('/api/v1/local/addHost', 'Install Nginx', domain);
    };

    const handleUninstallNginx = async (domain) => {
        if (!window.confirm(`Remove Nginx configuration for ${domain}?`)) return;
        await callApi('/api/v1/local/delHost', 'Uninstall Nginx', domain);
    };

    const handleEditNginx = async (domain) => {
        window.open(`/admin#media?path=/etc/nginx/sites-available/${domain}.conf`, '_blank');
    };

    // DNS actions
    const handleInstallDNS = async (domain) => {
        if (!window.confirm(`Install DNS zone for ${domain}?`)) return;
        await callApi('/api/v1/local/installDNS', 'Install DNS', domain);
    };

    const handleUninstallDNS = async (domain) => {
        if (!window.confirm(`Remove DNS zone for ${domain}?`)) return;
        await callApi('/api/v1/local/uninstallDNS', 'Uninstall DNS', domain);
    };

    const handleEditDNS = async (domain) => {
        window.open(`/admin#media?path=/etc/bind/zones/db.${domain}`, '_blank');
    };

    // Database actions
    const checkDatabaseExists = (domainName) => {
        if (!databases || databases.length === 0) return false;
        const dbName = "gen_" + domainName.replace(/\./g, '');
        const dbNameWithUnderscores = "gen_" + domainName.replace(/\./g, '_');
        return databases.some(db => {
            if (typeof db === 'string') {
                return db === dbName || db === dbNameWithUnderscores;
            }
            return false;
        });
    };

    const handleInstallDatabase = async (domain) => {
        if (!window.confirm(`Create database for ${domain}?`)) return;
        await callApi('/api/v1/local/installDatabase', 'Install Database', domain);
    };

    const handleUninstallDatabase = async (domain) => {
        if (!window.confirm(`⚠️ DANGER: Delete database for ${domain}? This will delete ALL data!`)) return;
        await callApi('/api/v1/local/uninstallDatabase', 'Uninstall Database', domain);
    };

    const handleEditDatabase = async (domain) => {
        const dbName = "gen_" + domain.replace(/\./g, '');
        window.open(`/admin#db?database=${dbName}`, '_blank');
    };

    // DNS Zone check
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

    // SSL actions
    const handleInstallSSL = async (domain) => {
        if (!window.confirm(`Install SSL certificate for ${domain}?`)) return;
        await callApi('/api/v1/local/installSSL', 'Install SSL', domain);
    };

    const handleUninstallSSL = async (domain) => {
        if (!window.confirm(`Remove SSL certificate for ${domain}?`)) return;
        await callApi('/api/v1/local/delSSL', 'Uninstall SSL', domain);
    };

    const handleEditSSL = async (domain) => {
        window.open(`/admin#ssl?domain=${domain}`, '_blank');
    };

    // Generic edit handler
    const handleEdit = async (domain, component) => {
        switch(component) {
            case 'filesystem':
                handleEditFilesystem(domain);
                break;
            case 'nginx':
                handleEditNginx(domain);
                break;
            case 'dns':
                handleEditDNS(domain);
                break;
            case 'database':
                handleEditDatabase(domain);
                break;
            case 'ssl':
                handleEditSSL(domain);
                break;
            default:
                console.log('Edit', component, domain);
        }
    };

    const isActionLoading = (domain, action, component = null) => {
        const key = `${domain}_${action}_${component || ''}`;
        return localActionLoading[key] || actionLoading;
    };

    return (
        <div className="tab-pane">
            {/* ✅ Notifications */}
            {apiStatus.show && (
                <div className={`notification ${apiStatus.type === 'success' ? 'notification-success' : 'notification-error'}`}>
                    {apiStatus.message}
                </div>
            )}

            <div className="section-header">
                <h2>Domain Management</h2>
                <button className="btn-refresh-all" onClick={handleRefreshFilesystems} disabled={isLoadingFolders} style={{ marginLeft: '10px' }}>
                    {isLoadingFolders ? '⏳ Loading...' : '🔄 Refresh All'}
                </button>
                <button className="btn-primary" onClick={onAddNew}>+ Add New Domain</button>
            </div>

            <div className="domains-grid">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Domain</th>
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
                        <tr><td colSpan="9" style={{ textAlign: 'center' }}>No domains found</td></tr>
                    ) : (
                        filteredDomains.map(domain => {
                            const genAdminValue = getGenAdminFsCheck(domain.name);
                            const fsRealValue = getFsCheck(domain.name);
                            const dbExists = checkDatabaseExists(domain.name);
                            const dnsExists = checkDnsZoneExists(domain.name);
                            const dbName = "gen_" + domain.name.replace(/\./g, '');

                            return (
                                <tr key={domain.name}>
                                    <td style={{ textAlign: 'left' }}>
                                        <strong>{domain.name}</strong>
                                        {dbExists && <span className="db-badge" title={`Database: ${dbName}`}>🗄️</span>}
                                    </td>

                                    <td className={genAdminValue ? 'status-ok' : 'status-missing'}>
                                        {genAdminValue ? '✓' : '✗'}
                                    </td>

                                    <td className={fsRealValue ? 'status-ok' : 'status-missing'}>
                                        {isLoadingFolders && realFsStatus === null ? '⏳' : (fsRealValue ? '✓' : '✗')}
                                        <div className="action-buttons-cell">
                                            {fsRealValue ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallFilesystem(domain.name)} disabled={isActionLoading(domain.name, 'uninstall', 'filesystem')} title="Delete Folder">🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(domain.name, 'filesystem')} disabled={isActionLoading(domain.name, 'edit', 'filesystem')} title="Edit Files">✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallFilesystem(domain.name)} disabled={isActionLoading(domain.name, 'install', 'filesystem')} title="Create Folder">📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td className={domain.nginx_check ? 'status-ok' : 'status-missing'}>
                                        {domain.nginx_check ? '✓' : '✗'}
                                        <div className="action-buttons-cell">
                                            {domain.nginx_check ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallNginx(domain.name)} disabled={isActionLoading(domain.name, 'uninstall', 'nginx')}>🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(domain.name, 'nginx')} disabled={isActionLoading(domain.name, 'edit', 'nginx')}>✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallNginx(domain.name)} disabled={isActionLoading(domain.name, 'install', 'nginx')}>📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td className={dnsExists ? 'status-ok' : 'status-missing'}>
                                        {dnsExists ? '✓' : '✗'}
                                        <div className="action-buttons-cell">
                                            {dnsExists ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallDNS(domain.name)} disabled={isActionLoading(domain.name, 'uninstall', 'dns')}>🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(domain.name, 'dns')} disabled={isActionLoading(domain.name, 'edit', 'dns')}>✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallDNS(domain.name)} disabled={isActionLoading(domain.name, 'install', 'dns')}>📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td className={dbExists ? 'status-ok' : 'status-missing'}>
                                        {dbExists ? '✓' : '✗'}
                                        {dbExists && <span className="db-name">{dbName}</span>}
                                        <div className="action-buttons-cell">
                                            {dbExists ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallDatabase(domain.name)} disabled={isActionLoading(domain.name, 'uninstall', 'database')}>🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(domain.name, 'database')} disabled={isActionLoading(domain.name, 'edit', 'database')}>✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallDatabase(domain.name)} disabled={isActionLoading(domain.name, 'install', 'database')}>📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td className={domain.ssl_check ? 'status-ok' : 'status-missing'}>
                                        {domain.ssl_check ? '✓' : '✗'}
                                        <div className="action-buttons-cell">
                                            {domain.ssl_check ? (
                                                <>
                                                    <button className="btn-uninstall" onClick={() => handleUninstallSSL(domain.name)} disabled={isActionLoading(domain.name, 'uninstall', 'ssl')}>🗑️</button>
                                                    <button className="btn-edit" onClick={() => handleEdit(domain.name, 'ssl')} disabled={isActionLoading(domain.name, 'edit', 'ssl')}>✏️</button>
                                                </>
                                            ) : (
                                                <button className="btn-install" onClick={() => handleInstallSSL(domain.name)} disabled={isActionLoading(domain.name, 'install', 'ssl')}>📥 Install</button>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        <button className="btn-small" onClick={() => onDomainAction(domain.name, 'fix')} disabled={actionLoading}>🔧 Fix All</button>
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