// meta-server.js - ΔΙΟΡΘΩΜΕΝΟ (χωρίς wildcard)
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3005;

// Διάβασε το config σου
let routes = [];
try {
    const configModule = await import('./headify.config.js');
    routes = configModule.default.routes;
    console.log(`✅ Loaded ${routes.length} routes from config`);
} catch(e) {
    console.error('❌ Failed to load config:', e.message);
}

// Διάβασε το index.html μία φορά
let indexHtml = '';
try {
    indexHtml = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');
    console.log('✅ Loaded index.html from dist/');
} catch(e) {
    console.error('❌ Failed to load index.html:', e.message);
}

app.use((req, res) => {
    const route = routes.find(r => r.path === req.path);

    if (route && indexHtml) {
        console.log(`🎯 Injecting meta for: ${req.path}`);

        const metaTags = `
    <title>${escapeHtml(route.title)}</title>
    <meta name="description" content="${escapeHtml(route.description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://nikimourtzi.com${route.path}">
    <meta property="og:title" content="${escapeHtml(route.title)}">
    <meta property="og:description" content="${escapeHtml(route.description)}">
    <meta property="og:image" content="${escapeHtml(route.image)}">
    <meta property="og:image:alt" content="${escapeHtml(route.title)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="GEN20">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(route.title)}">
    <meta name="twitter:description" content="${escapeHtml(route.description)}">
    <meta name="twitter:image" content="${escapeHtml(route.image)}">
    <link rel="canonical" href="https://nikimourtzi.com${route.path}">
`;

        let html = indexHtml.replace('</head>', metaTags + '\n</head>');
        res.send(html);
    } else {
        console.log(`📍 Fallback (no route): ${req.path}`);
        res.send(indexHtml);
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Meta server running on http://0.0.0.0:${port}`);
    console.log(`📋 Routes available: ${routes.length}`);
});