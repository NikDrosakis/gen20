// scripts/generate-sitemap.js
import { writeFileSync, existsSync, mkdirSync } from 'fs';

// ✅ XML escape function
function xmlEscape(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

async function generateSitemap() {
    try {
        const hostname = 'directorsunion.gr';
        const publicdb = `gen_${hostname.replace(/\./g, '')}`;

        // ✅ Query για posts και pages
        const query = `SELECT 
            id, 
            name, 
            title, 
            excerpt,
            type, 
            published, 
            updated,
            img
        FROM ${publicdb}.content 
        WHERE status = 'active'
        AND type IN ('post', 'page')
        ORDER BY published DESC`;

        const url = `https://${hostname}/api/v1/maria/fa?query=${encodeURIComponent(query)}`;

        console.log(`📡 Fetching: ${url}`);

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success || !data.data) {
            console.error('❌ API error:', data);
            process.exit(1);
        }

        const items = data.data;
        const posts = items.filter(i => i.type === 'post');
        const pages = items.filter(i => i.type === 'page');

        console.log(`✅ Found ${posts.length} posts and ${pages.length} pages`);

        const baseUrl = `https://${hostname}`;
        const today = new Date().toISOString().split('T')[0];

        // ========================================
        // 1. SITEMAP.XML
        // ========================================
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // 1.1 Static pages
        const staticPages = [
            { loc: '/', priority: '1.0', changefreq: 'daily' },
            { loc: '/blog', priority: '0.9', changefreq: 'daily' },
            { loc: '/publications', priority: '0.8', changefreq: 'weekly' },
            { loc: '/research', priority: '0.8', changefreq: 'weekly' },
            { loc: '/cv', priority: '0.7', changefreq: 'monthly' },
            { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
        ];

        staticPages.forEach(page => {
            sitemap += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        });

        // 1.2 Posts → /post/{name}
        posts.forEach(post => {
            const lastmod = post.published?.split('T')[0] ||
                post.updated?.split('T')[0] || today;

            sitemap += `
  <url>
    <loc>${baseUrl}/post/${post.name}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        // 1.3 Pages → /{name}
        pages.forEach(page => {
            const lastmod = page.published?.split('T')[0] ||
                page.updated?.split('T')[0] || today;

            sitemap += `
  <url>
    <loc>${baseUrl}/${page.name}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        sitemap += `
</urlset>`;

        // ========================================
        // 2. RSS FEED (rss.xml) - με xmlEscape
        // ========================================
        let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ένωση Σκηνοθετών Δημιουργών</title>
    <link>${baseUrl}</link>
    <description>Τελευταία Νέα απ' την Ένωση Σκηνοθετών Δημιουργών</description>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>el</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

        // Τα 20 πιο πρόσφατα posts
        const recentPosts = posts.slice(0, 20);
        recentPosts.forEach(post => {
            const pubDate = post.published ? new Date(post.published).toUTCString() : new Date().toUTCString();
            const title = xmlEscape(post.title || 'Untitled');
            const excerpt = xmlEscape(post.excerpt || '');
            const link = `${baseUrl}/post/${post.name}`;

            rss += `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${excerpt}]]></description>`;

            if (post.img) {
                rss += `
      <enclosure url="${baseUrl}/media/${post.img}" type="image/jpeg" />`;
            }

            rss += `
      <pubDate>${pubDate}</pubDate>
    </item>`;
        });

        rss += `
  </channel>
</rss>`;

        // ========================================
        // 3. ΑΠΟΘΗΚΕΥΣΗ
        // ========================================
        // Δημιουργία φακέλων
        ['dist', 'public'].forEach(folder => {
            if (!existsSync(folder)) {
                mkdirSync(folder, { recursive: true });
            }

            // Sitemap
            writeFileSync(`${folder}/sitemap.xml`, sitemap);

            // RSS Feed
            writeFileSync(`${folder}/rss.xml`, rss);

            // Robots.txt
            const robots = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin & api
Disallow: /api/
Disallow: /admin/
Disallow: /login
Disallow: /signup

# Crawl-delay
Crawl-delay: 1

Host: ${baseUrl}`;
            writeFileSync(`${folder}/robots.txt`, robots);
        });

        const totalUrls = staticPages.length + posts.length + pages.length;
        console.log(`\n✅ SITEMAP generated with ${totalUrls} total URLs`);
        console.log(`   📄 ${staticPages.length} static pages`);
        console.log(`   📝 ${posts.length} blog posts (/post/...)`);
        console.log(`   📃 ${pages.length} pages (/${pages.map(p => p.name).join(', ')})`);

        console.log(`\n📡 RSS FEED generated with ${recentPosts.length} recent posts`);
        console.log(`📁 All files saved to: dist/ and public/`);
        console.log(`\n📂 Files created:`);
        console.log(`   📄 dist/sitemap.xml`);
        console.log(`   📄 dist/rss.xml`);
        console.log(`   📄 dist/robots.txt`);
        console.log(`   📄 public/sitemap.xml`);
        console.log(`   📄 public/rss.xml`);
        console.log(`   📄 public/robots.txt`);

    } catch (error) {
        console.error('❌ Failed to generate sitemap:', error.message);
        process.exit(1);
    }
}

generateSitemap();