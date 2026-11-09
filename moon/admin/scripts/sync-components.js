// scripts/sync-components.js
const domains = ['admin','nikimourtzi.com', 'gen20.net', 'directorsunion.gr', 'gen20.gr'];

async function syncDomain(domain) {
    console.log(`📁 Syncing ${domain}...`);

    try {
        const response = await fetch(`https://${domain}/api/v1/local/syncComponents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js Sync Script'
            },
            body: JSON.stringify({
                domain: domain
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log(`✅ ${domain}: Success`);
            if (result.data) {
                console.log(`   New: ${result.data.new || 0}`);
                console.log(`   Updated: ${result.data.updated || 0}`);
                console.log(`   Total: ${result.data.total || 0}`);
            }
        } else {
            console.error(`❌ ${domain}: ${result.error || 'Unknown error'}`);
        }
        return result;
    } catch (error) {
        console.error(`❌ ${domain}: ${error.message}`);
        return null;
    }
}

async function syncComponents() {
    console.log('🔄 Syncing components to all domains...\n');

    const results = [];
    for (const domain of domains) {
        const result = await syncDomain(domain);
        if (result) results.push(result);
        console.log('');
    }

    // Σύνοψη
    console.log('📊 Summary:');
    console.log(`   Total domains: ${domains.length}`);
    console.log(`   Success: ${results.filter(r => r?.success).length}`);
    console.log(`   Failed: ${results.filter(r => !r?.success).length}`);
}

syncComponents();