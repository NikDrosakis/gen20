// pages/SuperAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SuperAdminHeader from '../components/superadmin/SuperAdminHeader';
import DomainManager from '../components/superadmin/DomainManager';
import SSLManager from '../components/superadmin/SSLManager';
import FilesystemManager from '../components/superadmin/FilesystemManager';
import DatabaseManager from '../components/superadmin/DatabaseManager';
import NginxManager from '../components/superadmin/NginxManager';
import DNSManager from '../components/superadmin/DNSManager';
import DBTemplate from '../components/superadmin/DBTemplate';
import DBTree from '../components/superadmin/DBTree';
import Lab from '../components/superadmin/Lab';
import NewDomain from '../components/superadmin/NewDomain';
import './SuperAdmin.css';

const SuperAdmin = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedDomain, setSelectedDomain] = useState('');
    const [activeTab, setActiveTab] = useState('domains');
    const [domains, setDomains] = useState([]);
    const [DBS, setDBS] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sslInfo, setSslInfo] = useState({});
    const [filesystem, setFilesystem] = useState([]);
    const [nginx, setNginx] = useState([]);
    const [dnsZones, setDnsZones] = useState([]);
    const [components, setComponents] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [usingCache, setUsingCache] = useState(false);
    const [cacheTimestamp, setCacheTimestamp] = useState(null);
    const [genAdminData, setGenAdminData] = useState([]);

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const CACHE_URL = '/var/www/gs/public/admin/cache/superadmin.json';

  //  console.log('=== SuperAdmin Component Loaded ===');
   // console.log('Hostname:', window.location.hostname);
   // console.log('Public DB:', publicdb);
   // console.log('Cache URL:', CACHE_URL);
    const handleDomainChange = (domain) => {
        setSelectedDomain(domain);
    };

    useEffect(() => {
        console.log('🔄 Starting data fetch with cache check...');
        fetchAllData();
    }, []);

    const isCacheFresh = (timestamp) => {
        if (!timestamp) return false;
        const cacheAge = Date.now() - timestamp;
        const oneHour = 60 * 60 * 1000;
        return cacheAge < oneHour;
    };

    const getCacheTimestamp = (cacheData) => {
        return cacheData._timestamp || null;
    };

    const fetchAllData = async () => {
        console.log('📡 Starting fetchAllData with cache priority...');
        setLoading(true);

        try {
            const cacheLoaded = await loadFromCache();
            if (!cacheLoaded) {
                console.log('⚠️ No cache found or cache invalid, loading from API...');
                await loadFromAPI();
            } else {
                console.log('✅ Loaded from cache successfully');
            }
        } catch (error) {
            console.error('❌ Error in fetchAllData:', error);
            showMessage('error', 'Failed to load data: ' + error.message);
            console.log('🔄 Attempting API fallback...');
            await loadFromAPI();
        } finally {
            setLoading(false);
            console.log('🏁 Loading state set to false');
        }
    };

// Στο SuperAdmin.jsx, replace το loadFromCache με αυτό:

    const loadFromCache = async () => {
        console.log('📦 Checking cache at:', CACHE_URL);

        try {
            const cacheResponse = await fetch(CACHE_URL, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!cacheResponse.ok) {
                if (cacheResponse.status === 404) {
                    console.log('❌ Cache file not found (404)');
                } else {
                    console.log(`❌ Cache request failed with status: ${cacheResponse.status}`);
                }
                return false;
            }

            const cacheData = await cacheResponse.json();
            console.log('📖 Cache file loaded successfully');
            console.log('Cache structure:', Object.keys(cacheData));

            // Get timestamp
            const timestamp = cacheData._timestamp || null;
            if (timestamp) {
                setCacheTimestamp(timestamp);
                console.log(`Cache timestamp: ${new Date(timestamp).toLocaleString()}`);
                if (isCacheFresh(timestamp)) {
                    console.log('✅ Cache is fresh (< 1 hour old)');
                } else {
                    console.log('⚠️ Cache is older than 1 hour, consider regenerating');
                }
            }

            let hasValidData = false;

            // Load domains (now at root level, not per-domain)
            if (cacheData.domains && Array.isArray(cacheData.domains)) {
                setDomains(cacheData.domains);
                console.log(`✅ Cache: Loaded ${cacheData.domains.length} domains`);
                hasValidData = true;
            } else {
                console.log('⚠️ Cache: No domains data');
                setDomains([]);
            }

            // Load SSL certificates
            if (cacheData.ssl && typeof cacheData.ssl === 'object') {
                setSslInfo(cacheData.ssl);
                console.log(`✅ Cache: Loaded SSL for ${Object.keys(cacheData.ssl).length} domains`);
                hasValidData = true;
            } else {
                console.log('⚠️ Cache: No SSL data');
                setSslInfo({});
            }

            // Load filesystem (now as object, not array)
            if (cacheData.filesystem && typeof cacheData.filesystem === 'object') {
                setFilesystem(cacheData.filesystem);
                console.log(`✅ Cache: Loaded ${Object.keys(cacheData.filesystem).length} filesystem entries`);
                hasValidData = true;
            } else {
                console.log('⚠️ Cache: No filesystem data');
                setFilesystem({});
            }

            // Load components
            if (cacheData.components && Array.isArray(cacheData.components)) {
                setComponents(cacheData.components);
                console.log(`✅ Cache: Loaded ${cacheData.components.length} components`);
                hasValidData = true;
            } else {
                console.log('⚠️ Cache: No components data');
                setComponents([]);
            }

            // Load databases
            if (cacheData.databases && Array.isArray(cacheData.databases)) {
                setDBS(cacheData.databases);
                console.log(`✅ Cache: Loaded ${cacheData.databases.length} databases`);
                hasValidData = true;
            } else {
                console.log('⚠️ Cache: No databases data');
                setDBS([]);
            }

            // Load nginx configs
            if (cacheData.nginx && Array.isArray(cacheData.nginx)) {
                setNginx(cacheData.nginx);
                console.log(`✅ Cache: Loaded ${cacheData.nginx.length} nginx configs`);
                hasValidData = true;
            } else {
                console.log('⚠️ Cache: No nginx data');
                setNginx([]);
            }

            // Load DNS zones
            if (cacheData.dns_zones && Array.isArray(cacheData.dns_zones)) {
                setDnsZones(cacheData.dns_zones);
                console.log(`✅ Cache: Loaded ${cacheData.dns_zones.length} DNS zones`);
                hasValidData = true;
            } else {
                console.log('⚠️ Cache: No DNS zones data');
                setDnsZones([]);
            }

            if (hasValidData) {
                setUsingCache(true);
                showMessage('success', `Loaded from cache (${timestamp ? new Date(timestamp).toLocaleString() : 'unknown time'})`);
                return true;
            } else {
                console.log('⚠️ Cache contained no valid data');
                return false;
            }

        } catch (error) {
            console.log('❌ Error loading from cache:', error);
            return false;
        }
    };

    const loadFromAPI = async () => {
        console.log('🌐 Loading data from API endpoints...');
        setUsingCache(false);
        let hasErrors = false;

        try {
            // Fetch gen_admin.domain record
            try {
                const genAdminRes = await fetch('/api/v1/maria/fa?folder=select * from gen_admin.domain order by name asc');
                const genAdminResult = await genAdminRes.json();
                if (genAdminResult.success && genAdminResult.data) {
                    setGenAdminData(genAdminResult.data);
                    console.log(`✅ Loaded ${genAdminResult.data.length} gen_admin domain records`);
                }
            } catch (error) {
                console.error('❌ GenAdmin API failed:', error);
                setGenAdminData([]);
            }

            // Domains
            try {
                const domainsRes = await fetch('/api/v1/maria/fa?folder=select * from gen_admin.domain order by name asc');
                const domainsData = await domainsRes.json();
                if (domainsData.success && domainsData.data) {
                    setDomains(domainsData.data);
                    console.log(`✅ Loaded ${domainsData.data.length} domains from API`);
                } else {
                    setDomains([]);
                    hasErrors = true;
                }
            } catch (error) {
                console.error('❌ Domains API failed:', error);
                setDomains([]);
                hasErrors = true;
            }

            // Databases
            try {
                const dbsRes = await fetch('/api/v1/maria/show?q=databases');
                const dbData = await dbsRes.json();
                if (dbData.success && dbData.data) {
                    setDBS(dbData.data);
                    console.log(`✅ Loaded ${dbData.data.length} databases from API`);
                } else {
                    setDBS([]);
                    hasErrors = true;
                }
            } catch (error) {
                console.error('❌ Databases API failed:', error);
                setDBS([]);
                hasErrors = true;
            }

            // SSL certificates
            try {
                const sslRes = await fetch('/api/v1/local/getSSLs');
                const sslData = await sslRes.json();
                if (sslData.success && sslData.data) {
                    setSslInfo(sslData.data);
                    console.log(`✅ Loaded SSL info for ${Object.keys(sslData.data).length} domains from API`);
                } else {
                    setSslInfo({});
                    hasErrors = true;
                }
            } catch (error) {
                console.error('❌ SSL API failed:', error);
                setSslInfo({});
                hasErrors = true;
            }

            // Filesystem
            try {
                const fsRes = await fetch('/api/v1/local/getPublicFilesystem');
                const fsData = await fsRes.json();
                if (fsData.success && fsData.data) {
                    setFilesystem(fsData.data);
                    console.log(`✅ Loaded ${fsData.data.length} filesystem entries from API`);
                } else {
                    setFilesystem([]);
                    hasErrors = true;
                }
            } catch (error) {
                console.error('❌ Filesystem API failed:', error);
                setFilesystem([]);
                hasErrors = true;
            }

            // Components
            try {
                const compRes = await fetch(`/api/v1/maria/fa?folder=select * from ${publicdb}.components order by name asc`);
                const compData = await compRes.json();
                if (compData.success && compData.data) {
                    setComponents(compData.data);
                    console.log(`✅ Loaded ${compData.data.length} components from API`);
                } else {
                    setComponents([]);
                    hasErrors = true;
                }
            } catch (error) {
                console.error('❌ Components API failed:', error);
                setComponents([]);
                hasErrors = true;
            }

            // Nginx
            try {
                const nginxRes = await fetch('/api/v1/local/getPublicNginx');
                const nginxData = await nginxRes.json();
                if (nginxData.success && nginxData.data) {
                    setNginx(nginxData.data);
                    console.log(`✅ Loaded ${nginxData.data.length} Nginx entries from API`);
                } else {
                    setNginx([]);
                    hasErrors = true;
                }
            } catch (error) {
                console.error('❌ Nginx API failed:', error);
                setNginx([]);
                hasErrors = true;
            }

            // DNS Zones
            try {
                const dnsRes = await fetch('/api/v1/local/getZones');
                const dnsData = await dnsRes.json();
                if (dnsData.success && dnsData.data) {
                    setDnsZones(dnsData.data);
                    console.log(`✅ Loaded ${dnsData.data.length} DNS zones from API`);
                } else {
                    setDnsZones([]);
                    hasErrors = true;
                }
            } catch (error) {
                console.error('❌ DNS API failed:', error);
                setDnsZones([]);
                hasErrors = true;
            }

            console.log('✅ loadFromAPI completed');

            if (hasErrors) {
                showMessage('warning', 'Some data failed to load from API - partial data displayed');
            } else {
                showMessage('success', 'Loaded fresh data from API');
            }

            return true;
        } catch (error) {
            console.error('❌ Error in loadFromAPI:', error);
            showMessage('error', 'Failed to load data from API: ' + error.message);
            throw error;
        }
    };

    const refreshData = async () => {
        console.log('🔄 Manual refresh triggered...');
        setLoading(true);

        try {
            showMessage('info', 'Regenerating cache...');
            const regenResponse = await fetch('/api/v1/local/regenerateSuperadminCache', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (regenResponse.ok) {
                console.log('Cache regeneration triggered successfully');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.log('Cache regeneration endpoint not available, loading from API directly');
        }

        const cacheLoaded = await loadFromCache();
        if (!cacheLoaded) {
            await loadFromAPI();
        }

        setLoading(false);
    };

    const showMessage = (type, text) => {
        console.log(`📢 Message: [${type}] ${text}`);
        setMessage({ type, text });
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 5000);
    };

    const handleDomainAction = async (domain, action = 'fix') => {
        console.log(`🎯 Domain action ${action} on ${domain}`);
        setActionLoading(true);
        try {
            const response = await fetch(`/api/v1/local/checkfixDomainDB`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, action })
            });
            const result = await response.json();

            if (result.success) {
                showMessage('success', `Action completed for ${domain}`);
                await refreshData();
            } else {
                showMessage('error', result.error || 'Action failed');
            }
        } catch (error) {
            console.error(`❌ Error in domain action:`, error);
            showMessage('error', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSSLAction = async (action, domain) => {
        console.log(`🔒 SSL action: ${action} on ${domain}`);
        setActionLoading(true);
        try {
            const response = await fetch(`/api/v1/local/${action}SSL`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain })
            });
            const result = await response.json();

            if (result.success) {
                showMessage('success', `SSL ${action} completed for ${domain}`);
                await refreshData();
            } else {
                showMessage('error', result.error || 'SSL action failed');
            }
        } catch (error) {
            console.error(`❌ Error in ${action}SSL:`, error);
            showMessage('error', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const syncDomains = async () => {
        console.log('🔄 Syncing domains...');
        setActionLoading(true);
        try {
            const response = await fetch('/api/v1/local/syncDomains', { method: 'POST' });
            const result = await response.json();

            if (result.success) {
                showMessage('success', 'Domains synchronized successfully');
                await refreshData();
            } else {
                showMessage('error', result.error || 'Sync failed');
            }
        } catch (error) {
            console.error('❌ Error syncing domains:', error);
            showMessage('error', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const tabs = [
        { id: 'domains', label: 'Domain Manager', icon: '🌐' },
        { id: 'lab', label: 'API Lab', icon: '🧩' },
        { id: 'filesystem', label: 'Filesystem', icon: '📁' },
        { id: 'db', label: 'Databases', icon: '🗄️' },
        { id: 'dbtemplate', label: 'DB Template', icon: '🌳' },
        { id: 'dbtree', label: 'DB Tree', icon: '🌳' },
        { id: 'nginx', label: 'WebServer Hosts', icon: '⚙️' },
        { id: 'dns', label: 'Bind Zones', icon: '🌍' },
        { id: 'ssl', label: 'SSL Certificates', icon: '🔒' },
        { id: 'newdomain', label: 'New Domain', icon: '🧩' },
    ];

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && tabs.some(t => t.id === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    // ✅ Αλλαγή tab - ενημέρωση URL
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId }); // ← Προσθήκη query parameter
    };


    if (loading) {
        return (
            <div className="superadmin-loading">
                <div className="loading-spinner"></div>
                <p>Loading SuperAdmin panel...</p>
                <small>Checking cache first...</small>
            </div>
        );
    }

    return (
        <div className="superadmin-container">
            {message.text && (
                <div className={`superadmin-message ${message.type}`}>
                    {message.type === 'success' ? '✓' : message.type === 'error' ? '✗' : 'ℹ'} {message.text}
                </div>
            )}

            <SuperAdminHeader
                usingCache={usingCache}
                cacheTimestamp={cacheTimestamp}
                onRefresh={refreshData}
                onSync={syncDomains}
                isLoading={actionLoading || loading}
                selectedDomain={selectedDomain}
                onDomainChange={handleDomainChange}
            />

            <div className="superadmin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>


            <div className="superadmin-content">
                {activeTab === 'domains' && (
                    <DomainManager
                        domains={domains}
                        genAdminData={genAdminData}  // Πρόσθεσε αυτό
                        databases={DBS}
                        dnsZones={dnsZones}
                        onDomainAction={handleDomainAction}
                        onAddNew={() => console.log('Add new domain')}
                        actionLoading={actionLoading}
                        onRefreshDomains={refreshData}
                        selectedDomain={selectedDomain}
                    />
                )}

                {activeTab === 'ssl' && (
                    <SSLManager
                        sslInfo={sslInfo}
                        onSSLAction={handleSSLAction}
                        actionLoading={actionLoading}
                        selectedDomain={selectedDomain}
                    />
                )}

                {activeTab === 'filesystem' && (
                    <FilesystemManager filesystem={filesystem} selectedDomain={selectedDomain}/>
                )}

                {activeTab === 'db' && (
                    <DatabaseManager databases={DBS} selectedDomain={selectedDomain}/>
                )}

                {activeTab === 'dbtemplate' && (
                    <DBTemplate databases={DBS} selectedDomain={selectedDomain}/>
                )}
                {activeTab === 'dbtree' && (
                    <DBTree databases={DBS} selectedDomain={selectedDomain}/>
                )}

                {activeTab === 'nginx' && (
                    <NginxManager nginxConfigs={nginx} selectedDomain={selectedDomain}/>
                )}

                {activeTab === 'dns' && (
                    <DNSManager dnsZones={dnsZones} selectedDomain={selectedDomain}/>
                )}

                {activeTab === 'lab' && (
                    <Lab components={components} selectedDomain={selectedDomain}/>
                )}
                {activeTab === 'newdomain' && (
                    <NewDomain components={components} selectedDomain={selectedDomain}/>
                )}
            </div>
        </div>
    );
};

export default SuperAdmin;