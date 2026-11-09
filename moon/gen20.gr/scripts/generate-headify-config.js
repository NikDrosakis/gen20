// scripts/generate-headify-config.js
import { writeFileSync } from 'fs';

async function generateHeadifyConfig() {
    try {
        const hostname = 'gen20.gr';
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
        ];

        // Add blog posts
        data.data.forEach(post => {
            routes.push({
                path: `/blog/${post.name}`,
                title: post.title_en || 'Untitled',
                description: (post.excerpt_en || '').substring(0, 160),
                image: post.img || 'https://directorsunion.gr/logo0.png'
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