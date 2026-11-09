// scripts/generate-meta.js
import { writeFileSync } from 'fs';

const hostname = 'gen20.gr';
const publicdb = `gen_${hostname.replace(/\./g, '')}`;

async function generateMeta() {
    console.log('🔄 Generating meta tags...');

    // Fetch posts from your API
    const response = await fetch(`https://${hostname}/api/v1/maria/fa?folder=select name, title, excerpt, img from ${publicdb}.content WHERE type='post'`);
    const data = await response.json();

    if (!data.success || !data.data) {
        console.error('Failed to fetch posts', data);
        return;
    }

    console.log(`✅ Fetched ${data.data.length} posts`);

    // Create routes for Headify
    const routes = data.data.map(post => ({
        // CRITICAL FIX: path MUST be /blog/name, NOT /media/blog/name
        path: `/blog/${post.name}`,
        title: post.title || 'Untitled',
        description: (post.excerpt || '').substring(0, 160),
        // image MUST be full URL or absolute path
        image: post.img ? (post.img.startsWith('http') ? post.img : `https://${hostname}/media/blog/${post.img}`) : `https://${hostname}/assets/default-og.jpg`
    }));

    // Add static routes
    routes.unshift(
        {
            path: "/",
            title: "Ένωση Σκηνοθετών Δημιουργών",
            description: "Επίσημη ιστοσελίδα της Ένωσης Σκηνοθετών Δημιουργών.",
            image: "https://directorsunion.gr/logo0.png"
        },
        {
            path: "/blog",
            title: "Ένωση Σκηνοθετών Δημιουργών",
            description: "Blog της Δρ. Νίκης Μούρτζη – Ερευνήτρια Βιοπληροφορικής και Γονιδιωματικής.",
            image: "https://directorsunion.gr/logo0.png"
        }
    );

    // Write headify.config.js (ES module format)
    const configContent = `export default {
    port: 3005,
    host: '0.0.0.0',
    buildDir: "dist",
    routes: ${JSON.stringify(routes, null, 2)}
};`;

    writeFileSync('headify.config.js', configContent);
    console.log(`✅ Generated ${routes.length} routes in headify.config.js`);
    console.log(`   - ${routes.filter(r => r.path !== '/' && r.path !== '/blog').length} blog posts`);
}

generateMeta();