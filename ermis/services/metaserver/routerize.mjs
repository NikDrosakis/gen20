// /var/www/gs/public/ermis/metaserver/routerize.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===== CONFIGURATION =====
const BASE_PATH = '/var/www/gs/public';
const PAGES_DIR = 'src/pages';
const COMPONENTS_DIR = 'src/components';
const OUTPUT_FILE = 'src/router.jsx';
const BACKUP_SUFFIX = '.old';

// ===== DOMAINS LOADER (like headify.mjs) =====
const domainsPath = path.join(__dirname, 'data', 'domains.json');
let domains = {};
let domainsLoaded = false;

function loadDomains() {
    try {
        if (fs.existsSync(domainsPath)) {
            const data = fs.readFileSync(domainsPath, 'utf8');
            domains = JSON.parse(data);
            domainsLoaded = true;
            console.log(`✅ Routerize: Loaded ${Object.keys(domains).length} domains from domains.json`);
            return true;
        } else {
            console.error(`❌ Routerize: domains.json not found at ${domainsPath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Routerize: Failed to load domains:`, error.message);
        return false;
    }
}

function watchDomainsFile() {
    fs.watch(domainsPath, (eventType) => {
        if (eventType === 'change') {
            console.log('🔄 Routerize: domains.json changed, reloading...');
            loadDomains();
            // Regenerate routers for all domains
            generateRouters();
        }
    });
}

// Initial load
loadDomains();
watchDomainsFile();

// ===== HELPER FUNCTIONS =====
function getDomainPaths() {
    const domainList = [];

    // Get domains from domains.json
    for (const [domain, config] of Object.entries(domains)) {
        const domainPath = path.join(BASE_PATH, domain);
        const pagesPath = path.join(domainPath, PAGES_DIR);

        // Check if domain exists and has pages directory
        if (fs.existsSync(domainPath) && fs.existsSync(pagesPath)) {
            domainList.push({
                domain,
                domainPath,
                pagesPath,
                config,
                distPath: config.distPath || path.join(domainPath, 'dist')
            });
        } else {
            console.log(`⚠️  Domain ${domain} from domains.json not found or missing pages directory`);
        }
    }

    return domainList;
}

function getPageComponents(pagesPath) {
    try {
        const files = fs.readdirSync(pagesPath);
        const components = [];

        for (const file of files) {
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                const name = path.basename(file, path.extname(file));
                // Skip index.jsx if it exists (will be used as root)
                if (name.toLowerCase() !== 'index') {
                    components.push({
                        name: name,
                        fileName: file,
                        path: `./pages/${file}`,
                        routePath: getRoutePath(name)
                    });
                }
            }
        }
        return components;
    } catch (error) {
        console.error(`❌ Error reading pages:`, error.message);
        return [];
    }
}

function getRoutePath(componentName) {
    // Convert component name to route path
    // Examples: Land -> "/", Login -> "/login", DatasetTable -> "/dataset-table"
    const lower = componentName.toLowerCase();

    // Special cases
    if (lower === 'land' || lower === 'home') return '/';
    if (lower === 'index') return '/';

    // Convert camelCase or PascalCase to kebab-case
    const kebab = lower.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return `/${kebab}`;
}

function getComponentName(componentName) {
    // Keep the original name for import
    return componentName;
}

function checkComponentExists(domainPath, componentName) {
    // Check if component exists in components directory
    const compPath = path.join(domainPath, COMPONENTS_DIR, `${componentName}.jsx`);
    const compPathJs = path.join(domainPath, COMPONENTS_DIR, `${componentName}.js`);
    return fs.existsSync(compPath) || fs.existsSync(compPathJs);
}

function backupExistingRouter(outputPath) {
    try {
        if (fs.existsSync(outputPath)) {
            const backupPath = outputPath + BACKUP_SUFFIX;

            // Check if backup already exists and create numbered backup
            let finalBackupPath = backupPath;
            let counter = 1;
            while (fs.existsSync(finalBackupPath)) {
                finalBackupPath = `${backupPath}.${counter}`;
                counter++;
            }

            // Read current content and write to backup
            const currentContent = fs.readFileSync(outputPath, 'utf8');
            fs.writeFileSync(finalBackupPath, currentContent, 'utf8');

            console.log(`   📝 Backup created: ${path.basename(finalBackupPath)}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`   ❌ Error backing up router:`, error.message);
        return false;
    }
}

function generateRouterContent(domain, domainPath, components) {
    // Check for ErrorBoundary and TestComponent in components
    const hasErrorBoundary = checkComponentExists(domainPath, 'ErrorBoundary');
    const hasTestComponent = checkComponentExists(domainPath, 'TestComponent');

    // Generate imports
    let imports = [];
    imports.push(`import { createBrowserRouter } from "react-router-dom";`);
    imports.push(`import App from "./App";`);

    // Add page imports
    const pageImports = components.map(comp => {
        const name = getComponentName(comp.name);
        return `import ${name} from "./pages/${comp.fileName}";`;
    });
    imports.push(...pageImports);

    // Add component imports if they exist
    if (hasErrorBoundary) {
        imports.push(`import ErrorBoundary from "./components/ErrorBoundary";`);
    }
    if (hasTestComponent) {
        imports.push(`import TestComponent from "./components/TestComponent";`);
    }

    // Generate routes
    const children = [];

    // Add index route (Land/Home)
    const landComponent = components.find(c => c.name.toLowerCase() === 'land' || c.name.toLowerCase() === 'home');
    if (landComponent) {
        children.push(`            { index: true, element: <${landComponent.name} /> }`);
    } else {
        // If no Land/Home component, use the first component as index
        if (components.length > 0) {
            children.push(`            { index: true, element: <${components[0].name} /> }`);
        }
    }

    // Add other routes
    for (const comp of components) {
        if (comp.name.toLowerCase() === 'land' || comp.name.toLowerCase() === 'home') continue;
        if (comp === components[0] && !components.find(c => c.name.toLowerCase() === 'land' || c.name.toLowerCase() === 'home')) continue;
        const routePath = comp.routePath;
        children.push(`            { path: "${routePath.slice(1)}", element: <${comp.name} /> }`);
    }

    // Add test component if exists
    if (hasTestComponent) {
        children.push(`            { path: "test", element: <TestComponent /> }`);
    }

    // Build the router
    let routerCode = `
${imports.join('\n')}

${hasErrorBoundary ? 'const ErrorElement = () => <ErrorBoundary><div /></ErrorBoundary>;' : ''}

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        ${hasErrorBoundary ? 'errorElement: <ErrorElement />,' : ''}
        children: [
${children.join(',\n')}
        ]
    }
]);

export default router;
`;

    return routerCode;
}

// ===== MAIN FUNCTION =====
function generateRouters() {
    console.log('🚀 Starting router generation from domains.json...');

    const domainPaths = getDomainPaths();

    if (domainPaths.length === 0) {
        console.log('❌ No valid domains found in domains.json');
        return;
    }

    console.log(`📂 Found ${domainPaths.length} domain(s) from domains.json`);

    let generatedCount = 0;
    let backupCount = 0;

    for (const { domain, domainPath, pagesPath, config } of domainPaths) {
        try {
            // Check if App.jsx exists
            const appPath = path.join(domainPath, 'src', 'App.jsx');
            if (!fs.existsSync(appPath)) {
                console.log(`⚠️  Skipping ${domain}: App.jsx not found at ${appPath}`);
                continue;
            }

            // Get page components
            const components = getPageComponents(pagesPath);

            if (components.length === 0) {
                console.log(`⚠️  Skipping ${domain}: No page components found in ${pagesPath}`);
                continue;
            }

            // Generate router content
            const routerContent = generateRouterContent(domain, domainPath, components);

            // Write the file with backup
            const outputPath = path.join(domainPath, OUTPUT_FILE);

            // Create backup of existing router if it exists
            console.log(`📂 Processing ${domain}...`);
            const backedUp = backupExistingRouter(outputPath);
            if (backedUp) backupCount++;

            // Write new router
            fs.writeFileSync(outputPath, routerContent, 'utf8');
            console.log(`✅ Generated router for ${domain} (${components.length} pages) -> ${OUTPUT_FILE}`);
            generatedCount++;

        } catch (error) {
            console.error(`❌ Error generating router for ${domain}:`, error.message);
        }
    }

    console.log(`✅ Router generation complete! Generated ${generatedCount} router files, created ${backupCount} backups.`);
}

// ===== WATCH MODE =====
function watchDomains() {
    console.log('👀 Watching for changes in domain pages...');

    const domainPaths = getDomainPaths();

    for (const { domain, domainPath, pagesPath } of domainPaths) {
        if (fs.existsSync(pagesPath)) {
            fs.watch(pagesPath, { recursive: true }, (eventType, filename) => {
                if (filename && (filename.endsWith('.jsx') || filename.endsWith('.js'))) {
                    console.log(`🔄 Change detected in ${domain}: ${filename}`);
                    // Regenerate router for this domain
                    try {
                        const components = getPageComponents(pagesPath);
                        const routerContent = generateRouterContent(domain, domainPath, components);
                        const outputPath = path.join(domainPath, OUTPUT_FILE);

                        // Create backup before overwriting
                        backupExistingRouter(outputPath);

                        // Write new router
                        fs.writeFileSync(outputPath, routerContent, 'utf8');
                        console.log(`✅ Updated router for ${domain}`);
                    } catch (error) {
                        console.error(`❌ Error updating router for ${domain}:`, error.message);
                    }
                }
            });
        }
    }
}

// ===== COMMAND LINE ARGUMENTS =====
const args = process.argv.slice(2);

// Check for force flag to skip backups
const forceMode = args.includes('--force') || args.includes('-f');

if (forceMode) {
    console.log('⚠️  Force mode enabled: Backups will NOT be created');
}

if (args.includes('--watch') || args.includes('-w')) {
    // Generate once then watch
    generateRouters();
    watchDomains();
} else {
    // Just generate
    generateRouters();
}

// Export for use as module
export default {
    generateRouters,
    watchDomains,
    loadDomains,
    getDomainPaths,
    domains,
    backupExistingRouter
};