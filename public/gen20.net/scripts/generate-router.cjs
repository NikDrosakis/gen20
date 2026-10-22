// scripts/generate-router.cjs
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

/**
 * Auto-generate router.jsx based on pages folder
 * Και καταχώρηση pages στη βάση δεδομένων
 */

const PAGES_DIR = path.join(__dirname, '..', 'src', 'pages');
const ROUTER_FILE = path.join(__dirname, '..', 'src', 'router.jsx');

function getDatabaseName() {
    // Παίρνουμε το path του project (2 επίπεδα πάνω από το scripts)
    const projectPath = path.join(__dirname, '..');
    // Παίρνουμε το όνομα του φακέλου
    const folderName = path.basename(projectPath);
    // Αφαιρούμε τυχόν τελείες (π.χ. poetabook.com → poetabookcom)
    const dbName = 'gen_' + folderName.replace(/\./g, '');
    return dbName;
}
// Database configuration - Φόρτωσε από .env ή config
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'n130177!',
    database: getDatabaseName(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Εξαιρέσεις - files που δεν γίνονται routes
const EXCLUDED_PAGES = [
    'index.jsx',
    'index.tsx',
    'index.js',
    '_app.jsx',
    '_document.jsx',
    '404.jsx',
    'error.jsx',
    'Layout.jsx',
    'layout.jsx',
    'NotFound.jsx'
];

// Default page content για νέες σελίδες
const DEFAULT_PAGE_CONTENT = {
    classificationid: 1,
    sort: 0,
    type: 'page',
    userid: 1,
    status: 1,
    excerpt: '',
    description: '',
    img: '',
    lang: 'el',
    view_count: 0,
    json: '{}',
    css: ''
};

async function generateRouter() {
    console.log('🔍 Scanning pages directory...');

    // Έλεγχος αν υπάρχει το pages folder
    if (!fs.existsSync(PAGES_DIR)) {
        console.error(`❌ Pages directory not found: ${PAGES_DIR}`);
        console.log('📁 Creating pages directory...');
        fs.mkdirSync(PAGES_DIR, { recursive: true });
        console.log('✅ Pages directory created. Add your page files and run again.');
        process.exit(0);
    }

    // Διάβασμα όλων των files
    let pageFiles = [];
    try {
        const files = fs.readdirSync(PAGES_DIR);
        pageFiles = files
            .filter(file => {
                const ext = path.extname(file);
                return ['.jsx', '.tsx', '.js'].includes(ext)
                    && !EXCLUDED_PAGES.includes(file)
                    && !file.startsWith('_')
                    && !file.startsWith('.');
            })
            .map(file => {
                const name = path.basename(file, path.extname(file));
                return { file, name };
            });
    } catch (error) {
        console.error('❌ Error reading pages directory:', error);
        process.exit(1);
    }

    if (pageFiles.length === 0) {
        console.log('⚠️ No page files found in src/pages/');
        console.log('📝 Create your first page, e.g.: src/pages/Home.jsx');
        process.exit(0);
    }

    console.log(`📄 Found ${pageFiles.length} pages:`, pageFiles.map(p => p.name).join(', '));

    // Σύνδεση με τη βάση και εισαγωγή pages
    let dbConnection = null;
    try {
        dbConnection = await mysql.createConnection(DB_CONFIG);
        console.log('✅ Database connected');

        // Εισαγωγή pages στη βάση
        await syncPagesToDatabase(dbConnection, pageFiles);

    } catch (error) {
        console.error('⚠️ Database error:', error.message);
        console.log('📝 Continuing without database sync...');
    } finally {
        if (dbConnection) {
            await dbConnection.end();
        }
    }

    // Δημιουργία router
    createRouterFile(pageFiles);
}

/**
 * Συγχρονισμός pages με τη βάση δεδομένων
 */
async function syncPagesToDatabase(connection, pageFiles) {
    console.log('🔄 Syncing pages to database...');

    // Get all existing pages
    const [existingPages] = await connection.execute(
        "SELECT name FROM content WHERE type = 'page'"
    );
    const existingNames = existingPages.map(row => row.name);

    // Get current page names from files
    const currentNames = pageFiles
        .filter(p => p.name !== 'Home' && p.name !== 'index' && p.name !== 'Index')
        .map(p => p.name);

    // Pages to insert (exist in files but not in DB)
    const toInsert = currentNames.filter(name => !existingNames.includes(name));

    // Pages to delete (exist in DB but not in files)
    const toDelete = existingNames.filter(name => !currentNames.includes(name) && name !== 'Home');

    // Insert new pages
    for (const name of toInsert) {
        try {
            const title = name.replace(/([A-Z])/g, ' $1').trim(); // CamelCase to words
            const slug = name.toLowerCase();

            await connection.execute(
                `INSERT INTO content 
                (name, title, type, classificationid, userid, status, lang, sort, description, json, css) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    title,
                    'page',
                    DEFAULT_PAGE_CONTENT.classificationid,
                    DEFAULT_PAGE_CONTENT.userid,
                    DEFAULT_PAGE_CONTENT.status,
                    DEFAULT_PAGE_CONTENT.lang,
                    toInsert.indexOf(name) + 1, // sort
                    `<!-- Auto-generated page: ${name} -->\n\n# ${title}\n\nContent for ${name} page.`,
                    JSON.stringify({
                        template: 'default',
                        sections: [],
                        meta: {
                            title: title,
                            description: `Page: ${title}`
                        }
                    }),
                    '/* Auto-generated styles for ' + name + ' */'
                ]
            );
            console.log(`  ✅ Inserted page: ${name} (slug: ${slug})`);
        } catch (error) {
            console.error(`  ❌ Failed to insert ${name}:`, error.message);
        }
    }

    // Delete pages that no longer exist
    for (const name of toDelete) {
        try {
            await connection.execute(
                "DELETE FROM content WHERE type = 'page' AND name = ?",
                [name]
            );
            console.log(`  🗑️ Deleted page: ${name}`);
        } catch (error) {
            console.error(`  ❌ Failed to delete ${name}:`, error.message);
        }
    }

    console.log(`✅ Database sync complete: ${toInsert.length} inserted, ${toDelete.length} deleted`);
}

/**
 * Δημιουργία router file
 */
function createRouterFile(pageFiles) {
    console.log('📝 Generating router file...');

    // Δημιουργία imports
    let imports = [
        'import { createBrowserRouter } from "react-router-dom";',
        'import App from "./App";',
        'import ErrorBoundary from "./components/ErrorBoundary";',
        'import NotFound from "./pages/NotFound";',
        ''
    ];

    // Import για κάθε page
    pageFiles.forEach(({ name, file }) => {
        if (name === 'Home' || name === 'index' || name === 'Index') {
            imports.push(`import Home from "./pages/${file}";`);
        } else if (name !== 'NotFound') {
            imports.push(`import ${name} from "./pages/${file}";`);
        }
    });

    // Δημιουργία children routes
    let children = [];

    // Home route (index)
    const homePage = pageFiles.find(p => p.name === 'Home' || p.name === 'index' || p.name === 'Index');
    if (homePage) {
        children.push(`            { index: true, element: <Home /> }`);
        children.push(`            { path: "home", element: <Home /> }`);
    }

    // Όλα τα άλλα pages
    pageFiles.forEach(({ name, file }) => {
        if (name === 'Home' || name === 'index' || name === 'Index' || name === 'NotFound') {
            return;
        }

        const routePath = name.toLowerCase();
        children.push(`            { path: "${routePath}", element: <${name} /> }`);
    });

    // 404 route
    children.push(`            { path: "*", element: <NotFound /> }`);

    // Σύνθεση router
    const routerContent = [
        imports.join('\n'),
        '',
        'const ErrorElement = () => <ErrorBoundary><div /></ErrorBoundary>;',
        '',
        'const router = createBrowserRouter([',
        '    {',
        '        path: "/",',
        '        element: <App />,',
        '        errorElement: <ErrorElement />,',
        '        children: [',
        children.join(',\n'),
        '        ]',
        '    }',
        ']);',
        '',
        'export default router;'
    ].join('\n');

    // Εγγραφή στο router.jsx
    try {
        const srcDir = path.dirname(ROUTER_FILE);
        if (!fs.existsSync(srcDir)) {
            fs.mkdirSync(srcDir, { recursive: true });
        }

        fs.writeFileSync(ROUTER_FILE, routerContent, 'utf8');
        console.log(`✅ Router generated successfully at ${ROUTER_FILE}`);

        // Εμφάνιση των routes
        console.log('\n📋 Generated routes:');
        console.log('─'.repeat(40));
        if (homePage) {
            console.log('  /          → Home (index)');
            console.log('  /home      → Home');
        }
        pageFiles.forEach(({ name }) => {
            if (name === 'Home' || name === 'index' || name === 'Index' || name === 'NotFound') {
                return;
            }
            console.log(`  /${name.toLowerCase()} → ${name} (${name.toLowerCase()})`);
        });
        console.log('  /*         → NotFound (404)');
        console.log('─'.repeat(40));

    } catch (error) {
        console.error('❌ Error writing router file:', error);
        process.exit(1);
    }
}

// Load environment variables
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value && !key.startsWith('#')) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }
    } catch (error) {
        // Ignore .env errors
    }
}

// Load .env
loadEnv();

// Εκτέλεση
generateRouter();

// Watch mode
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
    console.log('\n👀 Watching pages directory for changes...');
    console.log('📝 Add, remove, or rename files in src/pages/ and the router will auto-update\n');

    let timeout;
    fs.watch(PAGES_DIR, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            console.log(`📝 Detected change in ${filename}`);
            generateRouter();
        }, 300);
    });
}

module.exports = { generateRouter, syncPagesToDatabase };