// components/superadmin/SuperAdminHeader.jsx
import React, { useState, useEffect } from 'react';

const SuperAdminHeader = ({
                              usingCache,
                              cacheTimestamp,
                              onRefresh,
                              onSync,
                              isLoading,
                              onDomainChange  // ← Πρόσθεσε callback για το parent
                          }) => {
    const [domains, setDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState('');

    // Φόρτωση domains
    useEffect(() => {
        fetchDomains();
    }, []);

    // Φόρτωση saved domain από localStorage
    useEffect(() => {
        const savedDomain = localStorage.getItem('superadmin_selected_domain');
        if (savedDomain) {
            setSelectedDomain(savedDomain);
        }
    }, []);

    // Αποθήκευση στο localStorage όταν αλλάζει
    useEffect(() => {
        if (selectedDomain) {
            localStorage.setItem('superadmin_selected_domain', selectedDomain);
            // Ενημέρωσε το parent
            if (onDomainChange) {
                onDomainChange(selectedDomain);
            }
        }
    }, [selectedDomain]);

    const fetchDomains = async () => {
        try {
            const domainsRes = await fetch('/api/v1/maria/fa?folder=select * from gen_admin.domain order by name asc');
            const domainsData = await domainsRes.json();
            if (domainsData.success && domainsData.data) {
                setDomains(domainsData.data);
              //  console.log(`✅ Loaded ${domainsData.data.length} domains from API`);
            } else {
                setDomains([]);
            }
        } catch (error) {
            console.error('❌ Domains API failed:', error);
            setDomains([]);
        }
    };

    const handleDomainChange = (e) => {
        setSelectedDomain(e.target.value);
    };

    return (
        <div className="superadmin-header">
            <div className="superadmin-header-top">
                <h1>🛡️ SuperAdmin Dashboard</h1>
                <div className="header-actions">
                    {usingCache && (
                        <div className="cache-badge" title={`Cached data from ${cacheTimestamp ? new Date(cacheTimestamp).toLocaleString() : 'unknown time'}`}>
                            📦 Cache Mode
                        </div>
                    )}
                    <button onClick={onRefresh} disabled={isLoading} className="refresh-btn">
                        🔄 Refresh Data
                    </button>
                    <button onClick={onSync} disabled={isLoading} className="sync-btn">
                        🔄 Sync All Domains
                    </button>
                </div>
            </div>
            <div className="superadmin-header-bottom">
                <div className="domain-selector-group">
                    <label>Filter domain:</label>
                    <select
                        value={selectedDomain}
                        onChange={handleDomainChange}
                        className="domain-filter-select"
                    >
                        <option value="">-- All Domains --</option>
                        {domains.map(domain => (
                            <option key={domain.name} value={domain.name}>
                                {domain.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminHeader;