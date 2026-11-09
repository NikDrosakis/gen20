// scripts/generate-superadmin-cache.js
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const cacheDir = '/var/www/gs/public/admin/cache';
const API_BASE = 'https://nikimourtzi.com'; // ή το κεντρικό σου domain

async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return response;
            }
            if (i === maxRetries - 1) {
                console.log(`  ⚠️ Failed after ${maxRetries} retries: ${url} (status: ${response.status})`);
                return null;
            }
        } catch (e) {
            if (i === maxRetries - 1) {
                console.log(`  ⚠️ Failed after ${maxRetries} retries: ${url} (error: ${e.message})`);
                return null;
            }
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
    }
    return null;
}

async function generateSuperadminCache() {
    console.log('🚀 Generating SuperAdmin cache...');
    const startTime = Date.now();

    // Create cache directory if not exist
    if (!existsSync(cacheDir)) {
        mkdirSync(cacheDir, { recursive: true });
        console.log(`📁 Created cache directory: ${cacheDir}`);
    }

    const cacheData = {
        _timestamp: Date.now(),
        _generated: new Date().toISOString(),
        _version: '1.0.0'
    };

    try {
        // 1. Fetch domains from database (returns ALL domains)
        console.log(`\n🔍 Fetching domains from DB...`);
        try {
            const response = await fetchWithRetry(`${API_BASE}/api/v1/maria/fa?folder=select%20*%20from%20gen_admin.domain%20order%20by%20name%20asc`);
            if (response) {
                const dbData = await response.json();
                cacheData.domains = dbData.success && dbData.data ? dbData.data : [];
                console.log(`  ✅ Domains: ${cacheData.domains.length}`);
            } else {
                cacheData.domains = [];
                console.log(`  ⚠️ Domains: Could not fetch`);
            }
        } catch (e) {
            console.error(`  ❌ Domains fetch failed: ${e.message}`);
            cacheData.domains = [];
        }

        // 2. Fetch databases list (returns ALL databases)
        console.log(`\n🔍 Fetching databases...`);
        try {
            const response = await fetchWithRetry(`${API_BASE}/api/v1/maria/show?q=databases`);
            if (response) {
                const dbData = await response.json();
                cacheData.databases = dbData.success && dbData.data ? dbData.data : [];
                console.log(`  ✅ Databases: ${cacheData.databases.length}`);
            } else {
                cacheData.databases = [];
                console.log(`  ⚠️ Databases: Could not fetch`);
            }
        } catch (e) {
            console.error(`  ❌ Databases fetch failed: ${e.message}`);
            cacheData.databases = [];
        }

        // 3. Fetch SSL certificates (returns ALL SSL certs)
        console.log(`\n🔍 Fetching SSL certificates...`);
        try {
            const response = await fetchWithRetry(`${API_BASE}/api/v1/local/getSSLs`);
            if (response) {
                const sslData = await response.json();
                cacheData.ssl = sslData.success && sslData.data ? sslData.data : {};
                console.log(`  ✅ SSL: ${Object.keys(cacheData.ssl).length} certificates`);
            } else {
                cacheData.ssl = {};
                console.log(`  ⚠️ SSL: Could not fetch`);
            }
        } catch (e) {
            cacheData.ssl = {};
            console.log(`  ⚠️ SSL fetch failed: ${e.message}`);
        }

        // 4. Fetch filesystem (returns ALL filesystem entries)
        console.log(`\n🔍 Fetching filesystem data...`);
        try {
            const response = await fetchWithRetry(`${API_BASE}/api/v1/local/getPublicFilesystem`);
            if (response) {
                const fsData = await response.json();
                cacheData.filesystem = fsData.success && fsData.data ? fsData.data : {};
                console.log(`  ✅ Filesystem: ${Object.keys(cacheData.filesystem).length} entries`);
            } else {
                cacheData.filesystem = {};
                console.log(`  ⚠️ Filesystem: Could not fetch`);
            }
        } catch (e) {
            cacheData.filesystem = {};
            console.log(`  ⚠️ Filesystem fetch failed: ${e.message}`);
        }

        // 5. Fetch Nginx configurations (returns ALL nginx configs)
        console.log(`\n🔍 Fetching Nginx configurations...`);
        try {
            const response = await fetchWithRetry(`${API_BASE}/api/v1/local/getPublicNginx`);
            if (response) {
                const nginxData = await response.json();
                cacheData.nginx = nginxData.success && nginxData.data ? nginxData.data : [];
                console.log(`  ✅ Nginx: ${cacheData.nginx.length} configs`);
            } else {
                cacheData.nginx = [];
                console.log(`  ⚠️ Nginx: Could not fetch`);
            }
        } catch (e) {
            cacheData.nginx = [];
            console.log(`  ⚠️ Nginx fetch failed: ${e.message}`);
        }

        // 6. Fetch DNS Zones (returns ALL zones)
        console.log(`\n🔍 Fetching DNS zones...`);
        try {
            const response = await fetchWithRetry(`${API_BASE}/api/v1/local/getZones`);
            if (response) {
                const zonesData = await response.json();
                cacheData.dns_zones = zonesData.success && zonesData.data ? zonesData.data : [];
                console.log(`  ✅ DNS Zones: ${cacheData.dns_zones.length} zones`);
            } else {
                cacheData.dns_zones = [];
                console.log(`  ⚠️ DNS Zones: Could not fetch`);
            }
        } catch (e) {
            cacheData.dns_zones = [];
            console.log(`  ⚠️ DNS Zones fetch failed: ${e.message}`);
        }

        // 7. Fetch components (returns ALL components)
        console.log(`\n🔍 Fetching components...`);
        const publicdb = "gen_" + API_BASE.replace(/https?:\/\//, '').replace(/\./g, '_');
        try {
            const response = await fetchWithRetry(`${API_BASE}/api/v1/maria/fa?folder=select%20*%20from%20${publicdb}.components%20order%20by%20name%20asc`);
            if (response) {
                const compData = await response.json();
                cacheData.components = compData.success && compData.data ? compData.data : [];
                console.log(`  ✅ Components: ${cacheData.components.length}`);
            } else {
                cacheData.components = [];
                console.log(`  ⚠️ Components: Could not fetch`);
            }
        } catch (e) {
            console.error(`  ❌ Components fetch failed: ${e.message}`);
            cacheData.components = [];
        }

        // Add summary
        cacheData._summary = {
            total_domains: cacheData.domains?.length || 0,
            total_ssl: Object.keys(cacheData.ssl || {}).length,
            total_filesystem: Object.keys(cacheData.filesystem || {}).length,
            total_nginx: cacheData.nginx?.length || 0,
            total_dns_zones: cacheData.dns_zones?.length || 0,
            total_components: cacheData.components?.length || 0,
            total_databases: cacheData.databases?.length || 0
        };

    } catch (error) {
        console.error(`❌ Failed to generate cache:`, error.message);
        cacheData.error = error.message;
    }

    // Write cache file
    const cacheJson = JSON.stringify(cacheData, null, 2);
    const cachePath = join(cacheDir, 'superadmin.json');
    writeFileSync(cachePath, cacheJson);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('✅ SuperAdmin cache generation completed!');
    console.log('='.repeat(50));
    console.log(`⏱️  Time: ${duration} seconds`);
    console.log(`📁 Path: ${cachePath}`);
    console.log(`📊 Size: ${(cacheJson.length / 1024).toFixed(2)} KB`);
    console.log(`\n📈 Summary:`, cacheData._summary);
}

// Run the script
generateSuperadminCache().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});