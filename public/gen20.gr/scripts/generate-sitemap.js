// scripts/generate-sitemap.js
import { writeFileSync, existsSync, mkdirSync } from 'fs';

async function generateSitemap() {
    try {
        const hostname = 'gen20.gr';
        const publicdb = `gen_${hostname.replace(/\./g, '')}`;

        // ✅ CORRECTED: Only blog posts (type='post', status=1)
        const query = `SELECT name, published FROM ${publicdb}.content WHERE type = 'post' AND status = 1 ORDER BY published DESC`;
        const url = `https://${hostname}/api/v1/maria/fa?folder=${encodeURIComponent(query)}`;

        console.log(`📡 Fetching: ${url}`);

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success || !data.data) {
            console.error('❌ API error:', data);
            process.exit(1);
        }

        console.log(`✅ Found ${data.data.length} blog posts`);

        const baseUrl = `https://${hostname}`;
        const today = new Date().toISOString().split('T')[0];

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${today}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/research</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/publications</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/cv</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <priority>0.7</priority>
  </url>`;

        // Add each blog post
        data.data.forEach(post => {
            const lastmod = post.published ? post.published.split('T')[0] : today;
            sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.name}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.8</priority>
  </url>`;
        });

        sitemap += `
</urlset>`;

        // Ensure dist folder exists
        if (!existsSync('dist')) {
            mkdirSync('dist');
        }

        writeFileSync('dist/sitemap.xml', sitemap);
        console.log(`✅ Sitemap generated with ${data.data.length + 6} total URLs`);
        console.log(`📁 Location: dist/sitemap.xml`);

    } catch (error) {
        console.error('❌ Failed to generate sitemap:', error.message);
        process.exit(1);
    }
}

generateSitemap();