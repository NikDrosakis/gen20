<?php
namespace Core\Traits;

trait Filesystem {

    /**
     * Sync all components from filesystem to database
     * @param array $params Parameters with domain
     * @return array Result with counts
     */
    protected function syncComponents($params = []) {
        // Get domain from params or request
        if (is_array($params) && isset($params['domain'])) {
            $domain = $params['domain'];
        } else {
            $domain = $_SERVER['HTTP_HOST'] ?? 'localhost';
        }

        // Clean domain
        $domain = str_replace(['http://', 'https://'], '', $domain);
        $domain = explode('/', $domain)[0];

        // Get publicdb name
        $publicdb = "gen_" . str_replace('.', '', $domain);
        $this->publicdb = $publicdb;

        // Scan components from filesystem
        $components = $this->scanComponentsFromFilesystem($domain);

        if (!$components['success']) {
            return $components;
        }

        // Create table if not exists
        $this->createComponentsTable($publicdb);

        $now = date('Y-m-d H:i:s');
        $synced = 0;
        $new = 0;
        $updated = 0;
        $deleted = 0;

        // Get existing components from database
        $existingComponents = [];
        $existingResult = $this->db->fa("SELECT id, path, modified FROM {$publicdb}.components");
        if ($existingResult) {
            foreach ($existingResult as $row) {
                $existingComponents[$row['path']] = $row;
            }
        }

        $currentPaths = [];

        foreach ($components['data'] as $comp) {
            $currentPaths[] = $comp['path'];

            // Escape strings
            $name = addslashes($comp['name'] ?? '');
            $path = addslashes($comp['path']);
            $type = $this->detectComponentType($comp['full_path'] ?? $comp['path']);
       // Στο syncComponents, για όλα τα text fields:
       $description = addslashes(htmlspecialchars($comp['metadata']['description'] ?? '', ENT_QUOTES, 'UTF-8'));
            $domain = addslashes($comp['metadata']['domain'] ?? '');
            $version = addslashes($comp['metadata']['version'] ?? '1.0.0');
            $props = addslashes(json_encode($comp['metadata']['props'] ?? [])); // ✅ Πρόσθεσε αυτό
            $dependencies = addslashes(json_encode($comp['metadata']['dependencies'] ?? ['react']));
$methods = json_encode($comp['metadata']['methods'] ?? []);
$apimethods = json_encode($comp['metadata']['apimethods'] ?? []);
$dependencies = json_encode($comp['metadata']['dependencies'] ?? ['react']);
            $fileSize = (int)($comp['size'] ?? 0);
            $modified = (int)($comp['modified'] ?? 0);

            if (isset($existingComponents[$comp['path']])) {
                $query = "UPDATE {$publicdb}.components SET
                    name = '{$name}',
                    type = '{$type}',
                    description = '{$description}',
                    domain = '{$domain}',
                    version = '{$version}',
                    dependencies = '{$dependencies}',
                    methods = '{$methods}',
                    apimethods = '{$apimethods}',
                    file_size = {$fileSize},
                    modified = {$modified},
                    updated = '{$now}'
                    WHERE path = '{$path}'";
                $this->db->q($query);
                $updated++;
            } else {
                $query = "INSERT INTO {$publicdb}.components
                    (name, path, type, description, domain, version, dependencies, methods, apimethods, file_size, modified, created, updated, status)
                    VALUES (
                        '{$name}',
                        '{$path}',
                        '{$type}',
                        '{$description}',
                        '{$domain}',
                        '{$version}',
                        '{$dependencies}',
                        '{$methods}',
                        '{$apimethods}',
                        {$fileSize},
                        {$modified},
                        '{$now}',
                        '{$now}',
                        1
                    )";
                $this->db->q($query);
                $new++;
            }
            $synced++;
        }

        // Delete removed components
        foreach ($existingComponents as $path => $comp) {
            if (!in_array($path, $currentPaths)) {
                $this->db->q("DELETE FROM {$publicdb}.components WHERE path = '{$path}'");
                $deleted++;
            }
        }

        // ========================================
        // SYNC WITH gen_admin.components
        // ========================================
        $this->syncToGenAdmin($components['data'], $domain);

        return [
            'success' => true,
            'synced' => $synced,
            'data' => $components['data'],
            'new' => $new,
            'updated' => $updated,
            'deleted' => $deleted,
            'total' => $components['total'],
            'domain' => $domain,
            'timestamp' => $now
        ];
    }

    /**
     * Sync components to gen_admin.components with domain as domain
     * @param array $components List of components
     * @param string $domain Source domain
     */
    protected function syncToGenAdmin($components, $domain) {
        //$this->createGenAdminComponentsTable($adminDb);

        $now = date('Y-m-d H:i:s');

        foreach ($components as $comp) {
            $name = addslashes($comp['name'] ?? '');
            $path = addslashes($comp['path']);
          $type = $this->detectComponentType($comp['full_path'] ?? $comp['path']);
       // Στο syncComponents, για όλα τα text fields:
       $description = addslashes(htmlspecialchars($comp['metadata']['description'] ?? '', ENT_QUOTES, 'UTF-8'));
            $domain = addslashes($comp['metadata']['domain'] ?? '');
            $version = addslashes($comp['metadata']['version'] ?? '1.0.0');
            $dependencies = addslashes(json_encode($comp['metadata']['dependencies'] ?? ['react']));
$methods = json_encode($comp['metadata']['methods'] ?? []);
$apimethods = json_encode($comp['metadata']['apimethods'] ?? []);
$dependencies = json_encode($comp['metadata']['dependencies'] ?? ['react']);
            $fileSize = (int)($comp['size'] ?? 0);
            $modified = (int)($comp['modified'] ?? 0);

            // Check if exists in gen_admin
            $existing = $this->db->f("SELECT id FROM gen_admin.components WHERE path = '{$path}' AND domain = '{$domain}'");

            if ($existing) {
                // Update existing
                $query = "UPDATE gen_admin.components SET
                    name = '{$name}',
                    type = '{$type}',
                    description = '{$description}',
                    domain = '{$domain}',
                    version = '{$version}',
                    dependencies = '{$dependencies}',
                    methods = '{$methods}',
                    apimethods = '{$apimethods}',
                    file_size = {$fileSize},
                    modified = {$modified},
                    updated = '{$now}'
                    WHERE path = '{$path}' AND domain = '{$domain}'";
                $this->db->q($query);
            } else {
                // Insert new with domain as domain
                $query = "INSERT INTO gen_admin.components
                    (name, path, type, description, domain, version, dependencies, methods, apimethods, file_size, modified, created, updated, status)
                    VALUES (
                        '{$name}',
                        '{$path}',
                        '{$type}',
                        '{$description}',
                        '{$domain}',
                        '{$version}',
                        '{$dependencies}',
                        '{$methods}',
                        '{$apimethods}',
                        {$fileSize},
                        {$modified},
                        '{$now}',
                        '{$now}',
                        1
                    )";
                $this->db->q($query);
            }
        }
    }

    /**
     * Create gen_admin.components table
     */
    protected function createGenAdminComponentsTable($db) {
        $query = "CREATE TABLE IF NOT EXISTS components (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            path VARCHAR(500) NOT NULL,
            type VARCHAR(50),
            description TEXT,
            domain VARCHAR(255) NOT NULL,
            version VARCHAR(50),
            dependencies JSON,
            methods LONGTEXT,
            apimethods LONGTEXT,
            file_size INT,
            modified INT,
            status TINYINT DEFAULT 1,
            instances INT DEFAULT 0,
            created DATETIME,
            updated DATETIME,
            UNIQUE KEY unique_path_domain (path, domain),
            INDEX idx_name (name),
            INDEX idx_type (type),
            INDEX idx_domain (domain),
            INDEX idx_status (status)
        )";
        $this->db->q($query);
    }

    /**
     * Create components table in public database
     */
    protected function createComponentsTable($publicdb) {
        $query = "CREATE TABLE IF NOT EXISTS {$publicdb}.components (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            path VARCHAR(500) NOT NULL,
            type VARCHAR(50),
            description TEXT,
            domain VARCHAR(255),
            version VARCHAR(50),
            dependencies JSON,
            methods LONGTEXT,
            apimethods LONGTEXT,
            file_size INT,
            modified INT,
            status TINYINT DEFAULT 1,
            instances INT DEFAULT 0,
            created DATETIME,
            updated DATETIME,
            UNIQUE KEY unique_path (path),
            INDEX idx_name (name),
            INDEX idx_type (type),
            INDEX idx_status (status)
        )";
        $this->db->q($query);
    }

    /**
     * Scan components directory for all React components
     * @param string|null $domain Domain name
     * @return array List of components with metadata
     */
    protected function scanComponentsFromFilesystem($domain = null) {
        $domain = $domain ?: ($_SERVER['HTTP_HOST'] ?? 'localhost');
        $componentsDir = "/var/www/gs/public/{$domain}/src/components/";

        if (!is_dir($componentsDir)) {
            return ['success' => false, 'error' => 'Components directory not found: ' . $componentsDir];
        }

        $components = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($componentsDir, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->getExtension() === 'jsx') {
                $relativePath = str_replace($componentsDir, '', $file->getPathname());
                $componentName = str_replace(['/', '\\', '.jsx', '.js'], ['.', '.', '', ''], $relativePath);

                // Parse component metadata from file
                $content = file_get_contents($file->getPathname());
        //        xecho($file->getPathname());
                $metadata = $this->parseComponentMetadata($content);
//xecho($metadata);
                // Detect dependencies from imports
                $metadata['dependencies'] = $this->detectDependencies($content);

                $components[] = [
                    'name' => $componentName,
                    'path' => $relativePath,
                    'full_path' => $file->getPathname(),
                    'size' => $file->getSize(),
                    'modified' => $file->getMTime(),
                    'metadata' => $metadata,
                    'type' => $this->detectComponentType($content)
                ];
            }
        }

        // Sort by name
        usort($components, function($a, $b) {
            return strcmp($a['name'], $b['name']);
        });

        return [
            'success' => true,
            'data' => $components,
            'total' => count($components),
            'directory' => $componentsDir
        ];
    }

   /**
     * Parse component metadata from file content
     * @param string $content File content
     * @return array Metadata
     */
protected function parseComponentMetadata($content) {
    $default = [
        'description' => '',
        'domain' => '',
        'version' => '1.0.0',
        'dependencies' => ['react'],
        'methods' => [],
        'apimethods' => []
    ];

    // Find block comments (/* ... */)
    preg_match('/\/\*([\s\S]*?)\*\//', $content, $matches);

    if (empty($matches)) {
        return $default;
    }

    $comment = $matches[1];
    $lines = explode("\n", $comment);
    $metadata = [];
    $descriptionLines = [];

    foreach ($lines as $line) {
        $line = trim($line);
        $line = preg_replace('/^\*\s?/', '', $line);
        if (empty($line)) continue;

        // Check for tags (#key: value)
        if (preg_match('/^#([a-zA-Z_]+):\s*(.*)/i', $line, $match)) {
            $key = strtolower($match[1]);
            $value = trim($match[2]);

            switch ($key) {
                case 'description':
                    $metadata['description'] = $value;
                    break;
                case 'domain':
                    $metadata['domain'] = $value;
                    break;
                case 'version':
                    $metadata['version'] = $value;
                    break;
                case 'dependencies':
                    $metadata['dependencies'] = array_map('trim', explode(',', $value));
                    break;
                case 'methods':
                    // ✅ Μετατροπή σε array
                    $metadata['methods'] = array_map('trim', explode(',', $value));
                    break;
                case 'apimethods':
                    // ✅ Μετατροπή σε array
                    $metadata['apimethods'] = array_map('trim', explode(',', $value));
                    break;
                case 'library':
                    $metadata['library'] = $value;
                    break;
                case 'type':
                    $metadata['type'] = $value;
                    break;
                case 'title':
                    $metadata['title'] = $value;
                    break;
                case 'name':
                    $metadata['name'] = $value;
                    break;
                default:
                    $descriptionLines[] = $line;
            }
        }
        // Check for YAML-style (key: value)
        elseif (preg_match('/^([a-zA-Z_]+):\s*(.*)/', $line, $match)) {
            $key = strtolower($match[1]);
            $value = trim($match[2]);

            if (!in_array($key, ['description', 'domain', 'version', 'dependencies', 'methods', 'apimethods', 'library', 'type', 'title', 'name'])) {
                $descriptionLines[] = $line;
            } else {
                // ✅ Μετατροπή σε array για methods και apimethods
                if ($key === 'methods' || $key === 'apimethods') {
                    $metadata[$key] = array_map('trim', explode(',', $value));
                } else {
                    $metadata[$key] = $value;
                }
            }
        }
        // Simple text - add to description
        else {
            $cleanLine = preg_replace('/^\*\s?/', '', $line);
            if (!empty($cleanLine)) {
                $descriptionLines[] = $cleanLine;
            }
        }
    }

    // If no description, use all non-tag lines
    if (empty($metadata['description']) && !empty($descriptionLines)) {
        $metadata['description'] = implode(' ', $descriptionLines);
    }

    // If description still empty, use whole comment without tags
    if (empty($metadata['description'])) {
        $cleanComment = preg_replace('/^#.*$/m', '', $comment);
        $cleanComment = preg_replace('/^\*\s?/', '', $cleanComment);
        $cleanComment = trim($cleanComment);
        if (!empty($cleanComment)) {
            $metadata['description'] = $cleanComment;
        }
    }

    // ✅ Ensure methods and apimethods are always arrays
    if (!isset($metadata['methods']) || !is_array($metadata['methods'])) {
        $metadata['methods'] = [];
    }
    if (!isset($metadata['apimethods']) || !is_array($metadata['apimethods'])) {
        $metadata['apimethods'] = [];
    }

    return array_merge($default, $metadata);
}
 /**
     * Detect dependencies from imports
     * @param string $content File content
     * @return array List of dependencies
     */
    protected function detectDependencies($content) {
        $dependencies = [];
        preg_match_all('/import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+[\'"]([^\'"]+)[\'"]/', $content, $matches);

        if (!empty($matches[1])) {
            foreach ($matches[1] as $dep) {
                if (!str_starts_with($dep, '.') && !str_starts_with($dep, '/')) {
                    $dependencies[] = $dep;
                }
            }
        }

        // Also check for require statements
        preg_match_all('/require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)/', $content, $matches);
        if (!empty($matches[1])) {
            foreach ($matches[1] as $dep) {
                if (!str_starts_with($dep, '.') && !str_starts_with($dep, '/')) {
                    $dependencies[] = $dep;
                }
            }
        }

        return array_unique($dependencies);
    }

    /**
     * Detect component type from file content
     * @param string $content File content
     * @return string Component type
     */
    protected function detectComponentType($path) {
        // Αν είναι σε φάκελο pages, είναι page
        if (strpos($path, '/pages/') !== false || strpos($path, '\\pages\\') !== false) {
            return 'page';
        }
        return 'compo';
    }
// ... rest of the trait methods (parseComponentMetadata, detectComponentType, detectDependencies, etc.)
}