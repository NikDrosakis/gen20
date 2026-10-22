// /var/www/gs/public/ermis/metaserver/headify.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===== DOMAINS LOADER =====
const domainsPath = path.join(__dirname, 'data', 'domains.json');
let domains = {};
let domainsLoaded = false;
const cache = {};

function loadDomains() {
    try {
        if (fs.existsSync(domainsPath)) {
            const data = fs.readFileSync(domainsPath, 'utf8');
            domains = JSON.parse(data);
            domainsLoaded = true;
            console.log(`✅ MetaServer: Loaded ${Object.keys(domains).length} domains`);
            return true;
        } else {
            console.error(`❌ MetaServer: domains.json not found at ${domainsPath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ MetaServer: Failed to load domains:`, error.message);
        return false;
    }
}

function watchDomainsFile() {
    fs.watch(domainsPath, (eventType) => {
        if (eventType === 'change') {
            console.log('🔄 MetaServer: domains.json changed, reloading...');
            loadDomains();
            // Clear cache
            Object.keys(cache).forEach(key => delete cache[key]);
        }
    });
}

// Initial load
loadDomains();
watchDomainsFile();

async function loadDomainConfig(domain) {
    if (!domains[domain]) {
        loadDomains();
        if (!domains[domain]) return null;
    }

    if (cache[domain]) return cache[domain];

    const config = domains[domain];
    if (!config) return null;

    // Η υλοποίηση από το scripts/generate-headify-config.js
    try {
        const hostname = domain;
        const publicdb = `gen_${hostname.replace(/\./g, '')}`;

        // Fetch content
        const contentquery = `SELECT name, title, excerpt, img FROM ${publicdb}.content ORDER BY created DESC`;
        const setupquery = `SELECT name, val FROM ${publicdb}.setup`;

        const apiUrl = `https://${hostname}/api/v1/maria/fa`;

        // Fetch content data
        const contentResponse = await fetch(`${apiUrl}?folder=${encodeURIComponent(contentquery)}`);
        const contentData = await contentResponse.json();

        // Fetch setup data
        const setupResponse = await fetch(`${apiUrl}?folder=${encodeURIComponent(setupquery)}`);
        const setupData = await setupResponse.json();

        if (!contentData.success || !contentData.data) {
            console.error(`❌ API error for ${domain}: Content data missing`);
            return null;
        }

        if (!setupData.success || !setupData.data) {
            console.error(`❌ API error for ${domain}: Setup data missing`);
            return null;
        }

        // Generate routes from content
        const routes = contentData.data.map(item => ({
            path: `/post/${item.name}`,
            title: item.title,
            description: item.excerpt,
            image: item.img
        }));

        // Read index.html from dist path
        const indexHtml = fs.readFileSync(path.join(config.distPath, 'index.html'), 'utf8');

        cache[domain] = {
            routes,
            indexHtml,
            siteName: config.siteName || hostname
        };

        console.log(`✅ MetaServer: Loaded ${routes.length} routes for ${domain}`);
        return cache[domain];
    } catch(e) {
        console.error(`❌ MetaServer: Failed to load ${domain}:`, e.message);
        return null;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ===== META HANDLER =====
async function metaHandler(req, res) {
    const host = req.headers.host?.replace(/:\d+$/, '');
    const domainConfig = await loadDomainConfig(host);

    if (!domainConfig) {
        console.log(`❌ MetaServer: Unknown domain: ${host}`);
        return res.status(404).json({ error: 'Domain not configured' });
    }

    const route = domainConfig.routes.find(r => r.path === req.path);

    if (route && domainConfig.indexHtml) {
        console.log(`🎯 MetaServer: [${host}] Injecting meta for: ${req.path}`);

        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const fullUrl = `${protocol}://${host}${route.path}`;

        const metaTags = `
    <title>${escapeHtml(route.title)} | ${domainConfig.siteName}</title>
    <meta name="description" content="${escapeHtml(route.description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:title" content="${escapeHtml(route.title)}">
    <meta property="og:description" content="${escapeHtml(route.description)}">
    <meta property="og:image" content="${escapeHtml(route.image)}">
    <meta property="og:image:alt" content="${escapeHtml(route.title)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${domainConfig.siteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(route.title)}">
    <meta name="twitter:description" content="${escapeHtml(route.description)}">
    <meta name="twitter:image" content="${escapeHtml(route.image)}">
    <link rel="canonical" href="${fullUrl}">
`;

        let html = domainConfig.indexHtml.replace('</head>', metaTags + '\n</head>');
        res.send(html);
    } else {
        console.log(`📍 MetaServer: [${host}] Fallback: ${req.path}`);
        res.send(domainConfig.indexHtml);
    }
}

// ===== ADMIN ENDPOINTS =====
function getDomainsList() {
    return Object.keys(domains).map(domain => ({
        domain,
        ...domains[domain]
    }));
}

function reloadDomains() {
    const success = loadDomains();
    Object.keys(cache).forEach(key => delete cache[key]);
    return { success, domains: Object.keys(domains), count: Object.keys(domains).length };
}

export default {
    metaHandler,
    getDomainsList,
    reloadDomains,
    loadDomains,
    domains
};