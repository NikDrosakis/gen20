// scripts/generate-headify-config.js
import { writeFileSync } from 'fs';

async function generateHeadifyConfig() {
    try {
        const hostname = 'nikimourtzi.com';
        const publicdb = `gen_${hostname.replace(/\./g, '')}`;

        // Fetch posts
        const query = `SELECT name, title_en, excerpt_en, img FROM ${publicdb}.content ORDER BY created DESC`;
        const url = `https://${hostname}/api/v1/maria/fa?folder=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success || !data.data) {
            console.error('❌ API error');
            process.exit(1);
        }

        // Routes array
        const routes = [
            {
                path: "/",
                title: "Niki Mourtzi | Bioinformatics",
                description: "Επίσημη ιστοσελίδα της Δρ. Νίκης Μούρτζη – Ερευνήτρια Βιοπληροφορικής και Γονιδιωματικής.",
                image: "https://nikimourtzi.com/assets/niki.png"
            },
            {
                path: "/blog",
                title: "Blog | Niki Mourtzi",
                description: "Blog της Δρ. Νίκης Μούρτζη – Ερευνήτρια Βιοπληροφορικής και Γονιδιωματικής.",
                image: "https://nikimourtzi.com/assets/niki.png"
            }
        ];

        // Add blog posts
        data.data.forEach(post => {
            routes.push({
                path: `/blog/${post.name}`,
                title: post.title_en || 'Untitled',
                description: (post.excerpt_en || '').substring(0, 160),
                image: post.img || 'https://nikimourtzi.com/assets/default-og.jpg'
            });
        });

        // ΓΙΑ ES MODULE (με export default)
        const esConfigContent = `export default {
    port: 3005,
    buildDir: "dist",
    routes: ${JSON.stringify(routes, null, 2)}
};`;

        // ΓΙΑ COMMONJS (με module.exports)
        const cjsConfigContent = `module.exports = {
    port: 3005,
    buildDir: "dist",
    routes: ${JSON.stringify(routes, null, 2)}
};`;

        // Γράψε και τα δύο formats
        writeFileSync('headify.config.js', esConfigContent);
        writeFileSync('headify.config.cjs', cjsConfigContent);

        console.log(`✅ headify.config.js (ES module) and headify.config.cjs (CommonJS) generated with ${routes.length} routes`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

generateHeadifyConfig();