<?php
namespace Core\Traits;
use Exception;

trait DomainFS {

// Στο trait Filesystem.php
protected function getPublicFolders() {
    $publicPath = "/var/www/gs/public/";

    if (!is_dir($publicPath)) {
        return ['success' => false, 'error' => 'Public directory not found'];
    }

    // Get all directories in /var/www/gs/public/
    $folders = array_filter(glob($publicPath . '*'), 'is_dir');

    $results = [];
    foreach ($folders as $folder) {
        $domain = basename($folder);
        $results[$domain] = [
            'exists' => true,
            'path' => $folder,
            'has_index' => file_exists($folder . '/index.html') || file_exists($folder . '/index.php'),
            'has_package' => file_exists($folder . '/package.json'),
            'has_vite' => file_exists($folder . '/vite.config.js')
        ];
    }

    return  $results;
}


   // Στο trait Domain.php ή Filesystem.php
   protected function checkFS($domain = null) {
       // Get domain from params or request
       if (!$domain) {
           $domain = $_POST['domain'] ?? $_GET['domain'] ?? null;
       }

       if (!$domain) {
           return ['success' => false, 'error' => 'Domain parameter required'];
       }

       // Check if folder exists
       $folderPath = "/var/www/gs/public/{$domain}";
       $exists = is_dir($folderPath);

       // Update gen_admin.domain table
    //   $this->db->q("UPDATE gen_admin.domain SET fsys_check = " . ($exists ? 1 : 0) . " WHERE name = '{$domain}'");

       return [
           'success' => true,
           'domain' => $domain,
           'exists' => $exists,
           'fsys_check' => $exists ? 1 : 0,
           'path' => $folderPath,
           'message' => $exists ? 'Filesystem exists' : 'Filesystem not found'
       ];
   }

    /**
     * Build filesystem structure for a domain in gaia/public/DOMAIN
     */
    protected function addFS($domainName): array {
        $domain = $domainName ?: DOMAIN;
        $publicPath = "/var/www/gs/public/{$domain}";

        // Create directory structure
        if (!mkdir($publicPath, 0755, true)) {
            throw new Exception("❌ Failed to create directory structure for $domain");
        }

        // Create proper index.php with Gaia initialization
        $indexContent = <<<'PHP'
    <?php
    use Core\Gen;
    define('GAIAROOT', dirname(dirname(__DIR__)).'/');
    require GAIAROOT.'vendor/autoload.php';
    $gaia = new Gen();
    PHP;

        file_put_contents("$publicPath/index.php", $indexContent);

        return [
            'status' => 'success',
            'message' => "✅ Filesystem structure created for $domain",
            'path' => $publicPath,
            'index_content' => $indexContent // Optional: return the generated content
        ];
    }

    protected function delFS(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;
        $publicPath = GAIAROOT."public/$domain";

        if (!file_exists($publicPath)) {
            throw new Exception("❌ Domain filesystem $publicPath does not exist");
        }

        // Recursively delete directory
        $this->rrmdir($publicPath);

        return [
            'status' => 'success',
            'message' => "✅ Filesystem structure removed for $domain",
            'path' => $publicPath
        ];
    }

    protected function checkfixFS(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;
        $publicPath = GAIAROOT."public/$domain";
        $issues = [];
        $fixed = [];

        // Check directory exists
        if (!file_exists($publicPath)) {
            throw new Exception("❌ Domain filesystem $publicPath does not exist");
        }

        return [
            'status' => 'success',
            'message' => "✅ Filesystem check completed for $domain",
            'issues' => $issues,
            'fixed' => $fixed
        ];
    }

    protected function rrmdir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    $path = "$dir/$object";
                    if (is_dir($path)) {
                        $this->rrmdir($path);
                    } else {
                        unlink($path);
                    }
                }
            }
            rmdir($dir);
        }
    }


/**
 * Δημιουργία νέου αρχείου
 */
protected function createFile($params = null): array {
    $parent  = $params['parent']  ?? $_POST['parent']  ?? null;
    $name    = $params['name']    ?? $_POST['name']    ?? null;
    $content = $params['content'] ?? $_POST['content'] ?? '';

    if (!$parent || !$name) {
        return ['success' => false, 'error' => 'Parent path and filename required'];
    }

    // 1. Sanitize filename — απόρριψε ρητά . και ..
    $name = preg_replace('/[^a-zA-Z0-9._-]/', '', $name);
    if (empty($name) || $name === '.' || $name === '..') {
        return ['success' => false, 'error' => 'Invalid filename'];
    }

    // 2. Whitelist extension (προαιρετικό αλλά συνιστάται)
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $allowedExt = ['jsx','js','ts','tsx','css','scss','json','pug','md','txt','html','php'];
    if ($ext !== '' && !in_array($ext, $allowedExt, true)) {
        return ['success' => false, 'error' => 'File type not allowed: ' . $ext];
    }

    $publicRoot     = '/var/www/gs/public';
    $parentPath     = $publicRoot . '/' . ltrim($parent, '/');
    $realParent     = realpath($parentPath);
    $publicRootReal = realpath($publicRoot);

    if (!$realParent || !is_dir($realParent)) {
        return ['success' => false, 'error' => 'Parent folder not found'];
    }

    // 3. Έλεγχος ότι ο parent είναι εντός publicRoot (με trailing slash για ασφάλεια)
    if (strpos($realParent . '/', $publicRootReal . '/') !== 0) {
        return ['success' => false, 'error' => 'Access denied'];
    }

    $newPath = rtrim($realParent, '/') . '/' . $name;

    // 4. Έλεγχος ότι το τελικό path είναι επίσης εντός publicRoot
    if (strpos($newPath, $publicRootReal . '/') !== 0) {
        return ['success' => false, 'error' => 'Access denied'];
    }

    // 5. Atomic create — 'x' mode αποτυγχάνει αν υπάρχει ήδη (race-safe)
    $fp = @fopen($newPath, 'x');
    if ($fp === false) {
        if (file_exists($newPath)) {
            return ['success' => false, 'error' => 'File already exists'];
        }
        return ['success' => false, 'error' => 'Failed to create file (permissions?)'];
    }

    if ($content !== '' && fwrite($fp, $content) === false) {
        fclose($fp);
        @unlink($newPath);  // rollback
        return ['success' => false, 'error' => 'Failed to write file content'];
    }
    fclose($fp);

    return [
        'success' => true,
        'name'    => $name,
        'path'    => substr($newPath, strlen($publicRootReal) + 1),
    ];
}

/**
 * Δημιουργία νέου φακέλου
 */
protected function createFolderInDomain($params = null): array {
    $parent = $params['parent'] ?? $_POST['parent'] ?? null;
    $name   = $params['name']   ?? $_POST['name']   ?? null;

    if (!$parent || !$name) {
        return ['success' => false, 'error' => 'Parent path and folder name required'];
    }

    $name = preg_replace('/[^a-zA-Z0-9._-]/', '', $name);
    if (empty($name)) {
        return ['success' => false, 'error' => 'Invalid folder name'];
    }

    $publicRoot = '/var/www/gs/public';
    $parentPath = $publicRoot . '/' . ltrim($parent, '/');
    $realParent = realpath($parentPath);

    if (!$realParent || !is_dir($realParent)) {
        return ['success' => false, 'error' => 'Parent folder not found'];
    }

    $publicRootReal = realpath($publicRoot);
    if (strpos($realParent, $publicRootReal) !== 0) {
        return ['success' => false, 'error' => 'Access denied'];
    }

    $newPath = rtrim($realParent, '/') . '/' . $name;
    if (is_dir($newPath)) {
        return ['success' => false, 'error' => 'Folder already exists'];
    }

    if (!mkdir($newPath, 0755)) {
        return ['success' => false, 'error' => 'Failed to create folder (permissions?)'];
    }

    return [
        'success' => true,
        'name' => $name,
        'path' => substr($newPath, strlen($publicRootReal) + 1),
    ];
}

/**
 * Rename αρχείου ή φακέλου
 */
protected function renameItem($params = null): array {
    $path = $params['path'] ?? $_POST['path'] ?? null;
    $newName = $params['newName'] ?? $_POST['newName'] ?? null;

    if (!$path || !$newName) {
        return ['success' => false, 'error' => 'Path and new name required'];
    }

    $newName = preg_replace('/[^a-zA-Z0-9._-]/', '', $newName);
    if (empty($newName)) {
        return ['success' => false, 'error' => 'Invalid name'];
    }

    $publicRoot = '/var/www/gs/public';
    $fullPath = $publicRoot . '/' . ltrim($path, '/');
    $realPath = realpath($fullPath);

    if (!$realPath || !file_exists($realPath)) {
        return ['success' => false, 'error' => 'File/folder not found'];
    }

    $publicRootReal = realpath($publicRoot);
    if (strpos($realPath, $publicRootReal) !== 0) {
        return ['success' => false, 'error' => 'Access denied'];
    }

    $parentDir = dirname($realPath);
    $newPath = $parentDir . '/' . $newName;

    if (file_exists($newPath)) {
        return ['success' => false, 'error' => 'Name already exists'];
    }

    if (!rename($realPath, $newPath)) {
        return ['success' => false, 'error' => 'Rename failed (permissions?)'];
    }

    return [
        'success' => true,
        'oldPath' => substr($realPath, strlen($publicRootReal) + 1),
        'newPath' => substr($newPath, strlen($publicRootReal) + 1),
        'newName' => $newName,
    ];
}

/**
 * Διαγραφή αρχείου ή φακέλου (recursive για φάκελο)
 */
protected function deleteItem($params = null): array {
    $path = $params['path'] ?? $_POST['path'] ?? null;

    if (!$path) {
        return ['success' => false, 'error' => 'Path required'];
    }

    $publicRoot = '/var/www/gs/public';
    $fullPath = $publicRoot . '/' . ltrim($path, '/');
    $realPath = realpath($fullPath);

    if (!$realPath || !file_exists($realPath)) {
        return ['success' => false, 'error' => 'File/folder not found'];
    }

    $publicRootReal = realpath($publicRoot);
    if (strpos($realPath, $publicRootReal) !== 0) {
        return ['success' => false, 'error' => 'Access denied'];
    }

    // Μην επιτρέψεις διαγραφή του ίδιου του public root ή domain root
    $relative = substr($realPath, strlen($publicRootReal) + 1);
    if (substr_count($relative, '/') < 1) {
        return ['success' => false, 'error' => 'Cannot delete domain root'];
    }

    try {
        if (is_dir($realPath)) {
            $this->rrmdir($realPath);   // ήδη υπάρχει στο DomainFS
        } else {
            unlink($realPath);
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => 'Delete failed: ' . $e->getMessage()];
    }

    return [
        'success' => true,
        'deleted' => $relative,
    ];
}

/**
 * Move/copy αρχείου
 */
protected function moveFile($params = null): array {
    $source = $params['source'] ?? $_POST['source'] ?? null;
    $target = $params['target'] ?? $_POST['target'] ?? null;
    $mode   = $params['mode']   ?? $_POST['mode']   ?? 'move';

    if (!$source || !$target) {
        return ['success' => false, 'error' => 'Source and target required'];
    }

    $publicRoot = '/var/www/gs/public';
    $srcReal = realpath($publicRoot . '/' . ltrim($source, '/'));
    $tgtReal = realpath($publicRoot . '/' . ltrim($target, '/'));

    if (!$srcReal || !is_file($srcReal)) {
        return ['success' => false, 'error' => 'Source file not found'];
    }
    if (!$tgtReal || !is_dir($tgtReal)) {
        return ['success' => false, 'error' => 'Target folder not found'];
    }

    $publicRootReal = realpath($publicRoot);
    if (strpos($srcReal, $publicRootReal) !== 0 || strpos($tgtReal, $publicRootReal) !== 0) {
        return ['success' => false, 'error' => 'Access denied'];
    }

    $srcDomain = explode('/', substr($srcReal, strlen($publicRootReal) + 1))[0];
    $tgtDomain = explode('/', substr($tgtReal, strlen($publicRootReal) + 1))[0];

    if ($mode === 'move' && $srcDomain !== $tgtDomain) {
        return ['success' => false, 'error' => 'Move only within same domain. Use copy.'];
    }

    $filename = basename($srcReal);
    $finalTarget = rtrim($tgtReal, '/') . '/' . $filename;

    if (file_exists($finalTarget)) {
        return ['success' => false, 'error' => 'File already exists: ' . $filename];
    }

    if ($mode === 'copy') {
        if (!copy($srcReal, $finalTarget)) {
            return ['success' => false, 'error' => 'Copy failed'];
        }
    } else {
        if (!rename($srcReal, $finalTarget)) {
            return ['success' => false, 'error' => 'Move failed'];
        }
    }

    return [
        'success' => true,
        'mode' => $mode,
        'filename' => $filename,
        'target' => substr($finalTarget, strlen($publicRootReal) + 1),
    ];
}



 /* =========================================================
     * 1. FILE METADATA + CONTENT
     * ========================================================= */
    protected function getFileMeta($params = []): array {
    $publicRoot='/var/www/gs/public';
        $displayPath = $params['path'] ?? $_POST['path'] ?? null;
        if (!$displayPath) return ['success' => false, 'error' => 'path required'];

        $parts = explode('/', trim($displayPath, '/'));
        // displayPath: domain/... → πραγματικό: domain/src/...
        if (count($parts) >= 1 && ($parts[1] ?? '') !== 'src') {
            $parts = [$parts[0], 'src', ...array_slice($parts, 1)];
        }
        $realPath = realpath($publicRoot . '/' . implode('/', $parts));

        if (!$realPath || !is_file($realPath)) {
            return ['success' => false, 'error' => 'File not found'];
        }
        if (strpos($realPath, realpath($publicRoot)) !== 0) {
            return ['success' => false, 'error' => 'Access denied'];
        }

        $domain  = $parts[0];
        $ext     = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
        $content = file_get_contents($realPath);
        $lines   = substr_count($content, "\n") + 1;
        $mtime   = filemtime($realPath);
        $size    = filesize($realPath);
        $name    = basename($realPath);

        // components lookup (με cubos join για title/folder)
        $compRow = $this->db->flist(
            "SELECT c.id, c.cuboid, c.name, c.path, c.domain, c.filetype,
                    c.modified, c.filesize, c.version, c.instances, c.color,
                    b.id AS cubosid, b.title AS cubos_title, b.folder AS cubos_folder,
                    b.status AS cubos_status, b.color AS cubos_color
               FROM gen_admin.components c
               LEFT JOIN gen_admin.cubos b ON b.id = c.cuboid
              WHERE c.path = ?
              LIMIT 1",
            [$displayPath]
        );

        return [
            'success' => true,
            'data' => [
                'domain'    => $domain,
                'path'      => $displayPath,
                'real_path' => $realPath,
                'name'      => $name,
                'filetype'  => $ext,
                'modified'  => date('c', $mtime),
                'mtime'     => $mtime,
                'size'      => $size,
                'lines'     => $lines,
                'content'   => $content,
                'component' => $compRow[0] ?? null,
            ]
        ];
    }

    /* =========================================================
     * 2. CROSS-DOMAIN SIMILARITY SEARCH
     * ========================================================= */
    protected function findSimilarComponents($params = []): array {
    $publicRoot = '/var/www/gs/public';
        $targetPath = $params['path'] ?? $_POST['path'] ?? null;
        $threshold  = (float)($params['threshold'] ?? 0.55);

        if (!$targetPath) return ['success' => false, 'error' => 'path required'];

        $targetMeta = $this->getFileMeta(['path' => $targetPath]);
        if (!$targetMeta['success']) return $targetMeta;

        $targetName    = $targetMeta['data']['name'];
        $targetContent = $targetMeta['data']['content'];
        $targetLines   = $targetMeta['data']['lines'];

        $candidates = [];
        $domains = array_diff(scandir($publicRoot), ['.', '..']);

        foreach ($domains as $domain) {
            $srcPath = $publicRoot . '/' . $domain . '/src';
            if (!is_dir($srcPath)) continue;

            foreach ($this->walkComponents($srcPath, $domain) as $file) {
                if ($file['display_path'] === $targetPath) continue;

                $nameMatch = (strcasecmp($file['name'], $targetName) === 0);
                $content   = file_get_contents($file['real_path']);

                // Γρήγορο skip: αν δεν ταιριάζει όνομα και το μήκος διαφέρει πολύ (>3x), skip χωρίς similarity
                $lenRatio = max(strlen($content), strlen($targetContent)) /
                            max(1, min(strlen($content), strlen($targetContent)));
                if (!$nameMatch && $lenRatio > 3.0) continue;

                $similarity = $this->similarity($targetContent, $content);

                if ($nameMatch || $similarity >= $threshold) {
                    // cubos linkage από components table
                    $compRow = $this->db->flist(
                        "SELECT c.id AS comp_id, c.cuboid,
                                b.title AS cubos_title, b.folder AS cubos_folder
                           FROM gen_admin.components c
                           LEFT JOIN gen_admin.cubos b ON b.id = c.cuboid
                          WHERE c.path = ?
                          LIMIT 1",
                        [$file['display_path']]
                    );
                    $candidates[] = [
                        'domain'     => $file['domain'],
                        'path'       => $file['display_path'],
                        'name'       => $file['name'],
                        'filetype'   => $file['filetype'],
                        'modified'   => date('c', filemtime($file['real_path'])),
                        'lines'      => substr_count($content, "\n") + 1,
                        'size'       => filesize($file['real_path']),
                        'similarity' => round($similarity, 4),
                        'name_match' => $nameMatch,
                        'component'  => $compRow[0] ?? null,
                    ];
                }
            }
        }

        usort($candidates, fn($a, $b) => $b['similarity'] <=> $a['similarity']);

        return [
            'success' => true,
            'data' => [
                'target'     => $targetMeta['data'],
                'candidates' => $candidates,
            ]
        ];
    }

    /* ---------- Similarity ---------- */
    protected function similarity(string $a, string $b): float {
        $a = $this->normalizeCode($a);
        $b = $this->normalizeCode($b);
        if ($a === '' || $b === '') return 0.0;
        if ($a === $b) return 1.0;

        similar_text($a, $b, $percent);
        $lev = levenshtein(substr($a, 0, 2550), substr($b, 0, 2550));
        $maxLen = max(strlen($a), strlen($b));
        $levScore = $maxLen > 0 ? 1 - ($lev / $maxLen) : 0;

        return ($percent / 100) * 0.6 + $levScore * 0.4;
    }

    protected function normalizeCode(string $s): string {
        $s = preg_replace('#/\*.*?\*/#s', '', $s);
        $s = preg_replace('#//[^\n]*#', '', $s);
        $s = preg_replace('/\s+/', ' ', $s);
        return trim($s);
    }

    protected function walkComponents(string $dir, string $domain, string $rel = ''): array {
        $out = [];
        foreach (array_diff(scandir($dir), ['.', '..']) as $item) {
            $full = $dir . '/' . $item;
            $display = $domain . ($rel ? '/' . $rel : '') . '/' . $item;
            if (is_dir($full)) {
                if (in_array($item, ['node_modules','vendor','.git','cache','build','dist'])) continue;
                $out = array_merge($out, $this->walkComponents($full, $domain, ($rel ? $rel . '/' : '') . $item));
            } else {
                $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
                if (in_array($ext, ['jsx','js','css','tsx','ts','pug','json'])) {
                    $out[] = [
                        'domain'       => $domain,
                        'display_path' => $display,
                        'real_path'    => $full,
                        'name'         => $item,
                        'filetype'     => $ext,
                    ];
                }
            }
        }
        return $out;
    }

/* =========================================================
 * 3. SAVE TO CUBOS (components + cubos)
 * ========================================================= */
protected function saveToCubos($params = []): array {
    $path     = $params['path']     ?? $_POST['path']     ?? null;
    $cubosId  = $params['cubosid']  ?? $params['cubos_id'] ?? $_POST['cubosid'] ?? $_POST['cubos_id'] ?? null;
    $name     = $params['name']     ?? $_POST['name']     ?? null;
    $title    = $params['title']    ?? $_POST['title']    ?? null;
    $version  = $params['version']  ?? $_POST['version']  ?? null;   // ✅ ΝΕΟ
    $cubosRoot = "/var/www/gs/cubos";

    if (!$path) {
        return ['success' => false, 'error' => 'path required'];
    }

    $meta = $this->getFileMeta(['path' => $path]);
    if (!$meta['success']) return $meta;
    $data = $meta['data'];

    // Αν ζητείται νέο cubos (δεν δόθηκε id), απαιτείται name ή title για παραγωγή name
    if (!$cubosId && !$name && !$title) {
        return ['success' => false, 'error' => 'cubos_id or name/title required'];
    }

    /* ----- 3a. Δημιουργία / εύρεση cubos record ----- */
    if (!$cubosId) {
        // name: υποχρεωτικό, slug-safe. Fallback: από title ή από filename
        $rawName = $name ?: $title ?: pathinfo($data['name'], PATHINFO_FILENAME);
        $slug = strtolower(trim((string)$rawName));
        $slug = preg_replace('/[^a-z0-9_-]+/', '-', $slug);
        $slug = trim($slug, '-_');
        if ($slug === '') {
            return ['success' => false, 'error' => 'Invalid cubos name'];
        }

        // title: human readable. Fallback: το name
        $titleVal = $title !== null && trim((string)$title) !== ''
            ? trim((string)$title)
            : $rawName;

        // folder: από το name (slug)
        $folder = $slug;

        // version: από params ή auto (last digit of year + mmddhhmm = 9 digits)
        $versionVal = $version !== null && trim((string)$version) !== ''
            ? trim((string)$version)
            : substr(date('Y'), -1) . date('mdHi');

        // 1) Ψάξε υπάρχον με ίδιο name ΚΑΙ version (προτιμότερο)
        $existing = $this->db->flist(
            "SELECT id FROM gen_admin.cubos WHERE name = ? AND version = ? LIMIT 1",
            [$slug, $versionVal]
        );
        $cubosId = $this->firstScalarId($existing);

        // 2) Αν δεν βρέθηκε, ψάξε με ίδιο folder ΚΑΙ version
        if (!$cubosId) {
            $existing = $this->db->flist(
                "SELECT id FROM gen_admin.cubos WHERE folder = ? AND version = ? LIMIT 1",
                [$folder, $versionVal]
            );
            $cubosId = $this->firstScalarId($existing);
        }

        // 3) Αν δεν υπάρχει, κάνε INSERT με ΟΛΑ τα υποχρεωτικά πεδία
        if (!$cubosId) {
            $insertData = [
                'name'    => $slug,
                'title'   => $titleVal,
                'folder'  => $folder,
                'version' => $versionVal,   // ✅
                'status'  => 1,
                'color'   =>  $this->randomCubosColor(),
            ];
            $insertResult = $this->db->inseRaw('gen_admin.cubos', $insertData);
            if (is_numeric($insertResult) && (int)$insertResult > 0) {
                $cubosId = (int)$insertResult;
            } elseif ($insertResult === true) {
                $lookup = $this->db->flist(
                    "SELECT id FROM gen_admin.cubos WHERE name = ? AND version = ? ORDER BY id DESC LIMIT 1",
                    [$slug, $versionVal]
                );
                $cubosId = $this->firstScalarId($lookup);
            }

            if (!$cubosId) {
                return ['success' => false, 'error' => 'Failed to create cubos (name=' . $slug . ', version=' . $versionVal . ')'];
            }
        }
    } else {
        $cubosId = (int)$cubosId;
    }

    /* ----- 3b. Φόρτωσε το cubos row (με version) ----- */
    $cubosRows = $this->db->flist(
        "SELECT id, name, color, title, folder, version FROM gen_admin.cubos WHERE id = ?",
        [$cubosId]
    );
    $cubosRows = is_array($cubosRows) ? array_values($cubosRows) : [];
    $cubosRow = $cubosRows[0] ?? null;
    if (!$cubosRow) {
        return ['success' => false, 'error' => 'Cubos not found (id=' . $cubosId . ')'];
    }

    /* ----- 3c. Versioned path: /cubos/<folder>/<version>/<file> ----- */
    $cubosVersion = $cubosRow['version'] ?: 'latest';
    $cubosDir = rtrim($cubosRoot, '/') . '/' . $cubosRow['folder'] . '/' . $cubosVersion;
    if (!is_dir($cubosDir) && !mkdir($cubosDir, 0755, true)) {
        return ['success' => false, 'error' => 'Cannot create cubos folder: ' . $cubosDir];
    }

    $destFile = $cubosDir . '/' . $data['name'];
    if (!copy($data['real_path'], $destFile)) {
        return ['success' => false, 'error' => 'Copy failed'];
    }

    /* ----- 3d. components UPSERT ----- */
    $now = date('Y-m-d H:i:s');

    // ✅ component version: last digit of year + mmddhhmm = 9 digits
    // π.χ. 2026-10-30 16:43 → "6" . "10301643" → "610301643"
    $componentVersion = substr(date('Y', $data['mtime']), -1) . date('mdHi', $data['mtime']);

    $exists = $this->db->flist(
        "SELECT id FROM gen_admin.components WHERE path = ? LIMIT 1",
        [$path]
    );
    $existingComponentId = $this->firstScalarId($exists);

    if ($existingComponentId > 0) {
        $this->db->q(
            "UPDATE gen_admin.components
                SET cubosid = ?, name = ?, domain = ?, filetype = ?,
                    modified = ?, filesize = ?, version = ?, updated = ?
              WHERE id = ?",
            [
                $cubosId,
                $data['name'],
                $data['domain'],
                $data['filetype'],
                $data['mtime'],
                $data['size'],
                $componentVersion,   // ✅
                $now,
                $existingComponentId,
            ]
        );
        $componentId = $existingComponentId;
    } else {
        $insResult = $this->db->inseRaw('gen_admin.components', [
            'parent'    => 0,
            'sort'      => 0,
            'cubosid'   => $cubosId,
            'name'      => $data['name'],
            'path'      => $path,
            'domain'    => $data['domain'],
            'filetype'  => $data['filetype'],
            'modified'  => $data['mtime'],
            'filesize'  => $data['size'],
            'version'   => $componentVersion,   // ✅
            'instances' => 1,
            'status'    => 1,
            'created'   => $now,
            'updated'   => $now,
            'color'     => $this->randomCubosColor(),
        ]);

        if (is_numeric($insResult) && (int)$insResult > 0) {
            $componentId = (int)$insResult;
        } elseif ($insResult === true) {
            $lookup = $this->db->flist(
                "SELECT id FROM gen_admin.components WHERE path = ? ORDER BY id DESC LIMIT 1",
                [$path]
            );
            $componentId = $this->firstScalarId($lookup);
        } else {
            $componentId = 0;
        }

        if (!$componentId) {
            return ['success' => false, 'error' => 'Failed to create component'];
        }
    }

    /* ----- 3e. cubos.updated ----- */
    $this->db->q(
        "UPDATE gen_admin.cubos SET updated = ? WHERE id = ?",
        [$now, $cubosId]
    );

    return [
        'success'      => true,
        'cubosid'      => $cubosId,
        'cubos_name'   => $cubosRow['name']    ?? null,
        'cubos_color'   => $cubosRow['color']    ?? null,
        'cubos_title'  => $cubosRow['title']   ?? null,
        'cubos_folder' => $cubosRow['folder']  ?? null,
        'cubos_version'=> $cubosRow['version'] ?? null,
        'component_id' => $componentId,
        'component_version' => $componentVersion,
        'copied_to'    => $destFile,
    ];
}

/**
 * Helper: το flist() μπορεί να επιστρέψει:
 *  - false (καμία γραμμή)
 *  - [id1, id2, ...] (1 column, flat)
 *  - [ ['id'=>x], ['id'=>y] ] (array of rows)
 *  - [ id => ['id'=>x, ...] ] (assoc by id)
 * Επιστρέφει πάντα int (0 αν δεν βρεθεί).
 */
private function firstScalarId($rows): int {
    if (!is_array($rows) || empty($rows)) return 0;
    $first = reset($rows);
    if (is_array($first)) {
        return (int)($first['id'] ?? 0);
    }
    return (int)$first;
}
  protected function saveManyToCubos($params = []): array {
      $paths   = $params['paths']    ?? $_POST['paths']    ?? [];
      $cubosId = $params['cubosid']  ?? $params['cubos_id'] ?? $_POST['cubosid'] ?? $_POST['cubos_id'] ?? null;
      $name    = $params['name']     ?? $_POST['name']     ?? null;
      $title   = $params['title']    ?? $_POST['title']    ?? null;
      $version = $params['version']  ?? $_POST['version']  ?? null;

      if (!is_array($paths) || empty($paths)) {
          return ['success' => false, 'error' => 'paths[] required'];
      }

      // Αν έχουμε ήδη cubosid, όλα πάνε εκεί
      if ($cubosId) {
          $firstId = (int)$cubosId;
          $results = [];
          foreach ($paths as $p) {
              $r = $this->saveToCubos(['path' => $p, 'cubosid' => $firstId]);
              $results[] = ['path' => $p] + $r;
          }
          return ['success' => true, 'data' => $results, 'cubosid' => $firstId];
      }

      // Αλλιώς: δημιούργησε cubos με το ΠΡΩΤΟ path, μετά τα υπόλοιπα με το ίδιο id
      if (!$name && !$title) {
          return ['success' => false, 'error' => 'name or title required for new cubos'];
      }

      $firstResult = $this->saveToCubos([
          'path'    => $paths[0],
          'name'    => $name,
          'title'   => $title,
          'version' => $version,
      ]);

      if (empty($firstResult['success'])) {
          return ['success' => false, 'error' => 'First path failed: ' . ($firstResult['error'] ?? 'unknown')];
      }

      $firstId = (int)$firstResult['cubosid'];
      $results = [['path' => $paths[0]] + $firstResult];

      foreach (array_slice($paths, 1) as $p) {
          $r = $this->saveToCubos(['path' => $p, 'cubosid' => $firstId]);
          $results[] = ['path' => $p] + $r;
      }

      return ['success' => true, 'data' => $results, 'cubosid' => $firstId];
  }
    /* =========================================================
     * 4. LIST CUBOS (για dropdown)
     * ========================================================= */
protected function listCubos($params = []): array {
    $rows = $this->db->flist(
        "SELECT id, name, title, folder, status, color, version, created, updated
           FROM gen_admin.cubos
          WHERE status = 1
          ORDER BY name ASC"
    );
    if (!is_array($rows)) $rows = [];

    return ['success' => true, 'data' => array_values($rows)];
}
    /* =========================================================
     * 5. UPDATE FILE CONTENT (για edit drawer)
     * ========================================================= */
      protected function saveFSContent($params = []): array {
      $publicRoot = '/var/www/gs/public';
          $path    = $params['path']    ?? $_POST['path']    ?? null;
          $content = array_key_exists('content', (array)$params)
              ? $params['content']
              : ($_POST['content'] ?? null);

          if (!$path || $content === null) {
              return ['success' => false, 'error' => 'path and content required'];
          }

          // Build real path: displayPath (domain/...) → domain/src/...
          $parts = explode('/', trim($path, '/'));
          if (count($parts) >= 1 && ($parts[1] ?? '') !== 'src') {
              array_splice($parts, 1, 0, ['src']);
          }
          $realPath = realpath($publicRoot . '/' . implode('/', $parts));

          if (!$realPath || !is_file($realPath)) {
              return ['success' => false, 'error' => 'File not found'];
          }

          $publicRootReal = realpath($publicRoot);
          if ($publicRootReal === false || strpos($realPath, $publicRootReal . '/') !== 0) {
              return ['success' => false, 'error' => 'Access denied'];
          }

          if (@file_put_contents($realPath, $content) === false) {
              return ['success' => false, 'error' => 'Write failed (permissions?)'];
          }

          // Ενημέρωση components αν υπάρχει record — με σωστό try/catch
          try {
              if (isset($this->db) && method_exists($this->db, 'q')) {
                  $this->db->q(
                      "UPDATE gen_admin.components
                          SET modified = ?, filesize = ?, updated = ?
                        WHERE path = ?",
                      [time(), filesize($realPath), date('Y-m-d H:i:s'), $path]
                  );
              }
          } catch (\Throwable $e) {
              error_log('[saveFileContent] DB update failed: ' . $e->getMessage());
              // Δεν επιστρέφουμε error — το file write πέτυχε
          }

          return [
              'success' => true,
              'mtime'   => filemtime($realPath),
              'size'    => filesize($realPath),
          ];
      }

/**
 * Διαβάζει ένα .jsx αρχείο και επιστρέφει τα imports του
 * ως array από strings (π.χ. ['react', 'react-router-dom', './Header']).
 */
protected function extractJsxDependencies(string $filePath): array {
    if (!is_file($filePath)) return [];

    $content = @file_get_contents($filePath);
    if ($content === false) return [];

    $deps = [];

    // 1. Static imports: import ... from 'pkg'
    if (preg_match_all('/^\s*import\s+[^;]*?from\s+[\'"]([^\'"]+)[\'"]/m', $content, $m)) {
        $deps = array_merge($deps, $m[1]);
    }

    // 2. Side-effect imports: import 'pkg'
    if (preg_match_all('/^\s*import\s+[\'"]([^\'"]+)[\'"]/m', $content, $m)) {
        $deps = array_merge($deps, $m[1]);
    }

    // 3. Dynamic imports: import('pkg')
    if (preg_match_all('/import\(\s*[\'"]([^\'"]+)[\'"]\s*\)/', $content, $m)) {
        $deps = array_merge($deps, $m[1]);
    }

    // 4. require('pkg')
    if (preg_match_all('/require\(\s*[\'"]([^\'"]+)[\'"]\s*\)/', $content, $m)) {
        $deps = array_merge($deps, $m[1]);
    }

    $deps = array_values(array_unique($deps));
    sort($deps);

    return $deps;
}

protected function getComponentFiles(): array {
    $publicRoot = '/var/www/gs/public';
    if (!is_dir($publicRoot)) {
        return ['success' => false, 'error' => 'Public directory not found'];
    }

    // ✅ Φόρτωσε colors από cubos
    $rows = $this->db->flist(
        "SELECT c.path, b.color AS cubos_color, b.name AS cubos_name, b.title AS cubos_title
           FROM gen_admin.components c
           LEFT JOIN gen_admin.cubos b ON b.id = c.cubosid"
    );
    $colorMap = [];
    if (is_array($rows)) {
        foreach ($rows as $row) {
            $colorMap[$row['path']] = [
                'color' => $row['cubos_color'] ?? null,
                'cubos_name' => $row['cubos_name'] ?? null,
                'cubos_title' => $row['cubos_title'] ?? null,
            ];
        }
    }

 // ✅ Φόρτωσε τα cubos files
    $cuboFilesSet = [];
    $cubosRoot = '/var/www/gs/cubos';
    if (is_dir($cubosRoot)) {
        $packages = array_diff(scandir($cubosRoot), ['.', '..']);
        foreach ($packages as $pkg) {
            $pkgPath = $cubosRoot . '/' . $pkg;
            if (!is_dir($pkgPath)) continue;
            $versions = array_diff(scandir($pkgPath), ['.', '..']);
            foreach ($versions as $version) {
                $versionPath = $pkgPath . '/' . $version;
                if (!is_dir($versionPath)) continue;
                $items = array_diff(scandir($versionPath), ['.', '..']);
                foreach ($items as $item) {
                    $itemPath = $versionPath . '/' . $item;
                    if (is_file($itemPath)) {
                        $key = strtolower($pkg) . '|' . strtolower($item);
                        $cuboFilesSet[$key] = true;
                    }
                }
            }
        }
    }

    $result = [];
    $domains = array_diff(scandir($publicRoot), ['.', '..']);

    foreach ($domains as $domain) {
        $domainPath = $publicRoot . '/' . $domain;
        if (!is_dir($domainPath)) continue;

        $srcPath = $domainPath . '/src';
        if (!is_dir($srcPath)) continue;

        // ✅ Πέρνα domain και rel
      $srcChildren = $this->scanComponentDir($srcPath, $domain, '', $colorMap, $cuboFilesSet);

        $result[$domain] = [
            'path' => 'public/' . $domain,
            'children' => $srcChildren
        ];
    }

    return ['success' => true, 'data' => $result];
}

protected function getCuboPackages(){
// ✅ Μετά: διάβασε από το filesystem
$cubosNames = [];
$cubosRoot = '/var/www/gs/cubos';
if (is_dir($cubosRoot)) {
    $items = array_diff(scandir($cubosRoot), ['.', '..']);
    foreach ($items as $item) {
        if (is_dir($cubosRoot . '/' . $item)) {
            $cubosNames[] = strtolower($item);
        }
    }
}
return $cubosNames ?? [];
}

protected function getCuboFilesList(): array {
    $cubosRoot = '/var/www/gs/cubos';
    if (!is_dir($cubosRoot)) {
        return ['success' => false, 'error' => 'Cubos directory not found'];
    }

    $files = [];
    $packages = array_diff(scandir($cubosRoot), ['.', '..']);

    foreach ($packages as $pkg) {
        $pkgPath = $cubosRoot . '/' . $pkg;
        if (!is_dir($pkgPath)) continue;

        // Version folders (π.χ. 610310917)
        $versions = array_diff(scandir($pkgPath), ['.', '..']);
        foreach ($versions as $version) {
            $versionPath = $pkgPath . '/' . $version;
            if (!is_dir($versionPath)) continue;

            // Files μέσα στο version
            $items = array_diff(scandir($versionPath), ['.', '..']);
            foreach ($items as $item) {
                $itemPath = $versionPath . '/' . $item;
                if (is_file($itemPath)) {
                    $files[] = [
                        'package' => strtolower($pkg),
                        'version' => $version,
                        'filename' => $item,
                        'path' => "$pkg/$version/$item"
                    ];
                }
            }
        }
    }

    return ['success' => true, 'data' => $files];
}

protected function fileExistsInTree(string $path, string $domain): bool {
    $publicRoot = '/var/www/gs/public';
    $fullPath = $publicRoot . '/' . $domain . '/src/' . ltrim($path, '/');

    // Δοκίμασε ως έχει
    if (is_file($fullPath)) return true;

    // Δοκίμασε με extension
    foreach (['.jsx', '.js', '.css', '.json'] as $ext) {
        if (is_file($fullPath . $ext)) return true;
    }

    return false;
}

protected function scanComponentDir(
    string $dir,
    string $domain = '',
    string $rel = '',
    array $colorMap = [],
    array $cuboFilesSet = []
): array {
    $result = [];
    $raw = @scandir($dir);
    if ($raw === false) return [];

    $items = array_values(array_diff($raw, ['.', '..']));

    foreach ($items as $item) {
        $path = $dir . '/' . $item;
        $displayPath = $domain . ($rel ? '/' . $rel : '') . '/' . $item;

        if (is_dir($path)) {
            if (in_array($item, ['node_modules', 'vendor', '.git', 'cache', 'build', 'dist'])) continue;
            $subChildren = $this->scanComponentDir(
                $path,
                $domain,
                ($rel ? $rel . '/' : '') . $item,
                $colorMap,
                $cuboFilesSet
            );
            $result[$item] = ['children' => $subChildren];
        } else {
            $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            if (in_array($ext, ['jsx', 'js', 'css', 'tsx', 'ts', 'pug', 'json'])) {
                $meta = $colorMap[$displayPath] ?? null;
                $cubosName = $meta['cubos_name'] ?? null;

                // in_package
                $inPackage = false;
                if ($cubosName !== null) {
                    $key = strtolower($cubosName) . '|' . strtolower($item);
                    $inPackage = isset($cuboFilesSet[$key]);
                }

                // 🆕 Resolve dependencies + in_place
                $rawDeps = $this->extractJsxDependencies($path);
                $resolvedDeps = [];
                $inPlace = true;

                foreach ($rawDeps as $dep) {
                   $resolved = $this->resolveDependency($dep, $displayPath, $domain);
                    $resolvedDeps[] = $resolved;

                    // Έλεγχος μόνο για internal
                    if ($resolved['type'] === 'internal') {
                        if (!$this->fileExistsInTree($resolved['path'], $domain)) {
                            $inPlace = false;
                        }
                    }
                }

                $result[$item] = [
                    'type' => 'file',
                    'color' => $meta['color'] ?? null,
                    'cubos_name' => $cubosName,
                    'cubos_title' => $meta['cubos_title'] ?? null,
                    'dependencies' => $resolvedDeps,   // 🆕 resolved
                    'in_package' => $inPackage,
                    'in_place' => $inPlace,             // 🆕
                ];
            }
        }
    }

    return $result;
}
/**
 * Resolve ένα import path σε root-relative path (με βάση το src/).
 * Επιστρέφει:
 *  - ['type' => 'external', 'path' => 'react']     για εξωτερικά packages
 *  - ['type' => 'internal', 'path' => 'components/Navbar']  για internal
 */
protected function resolveDependency(string $import, string $currentFilePath, string $domain = ''): array {
    // Εξωτερικό package
    if ($import === '' || $import[0] !== '.') {
        return ['type' => 'external', 'path' => $import];
    }

    // 🆕 Αφαίρεσε το domain από το currentFilePath
    $relPath = $currentFilePath;
    if ($domain && str_starts_with($relPath, $domain . '/')) {
        $relPath = substr($relPath, strlen($domain) + 1);
    }

    // Τώρα το $relPath είναι π.χ. "App.jsx" ή "components/NavAdmin.jsx"
    $currentDir = dirname($relPath);  // "components" ή ""
    $resolved = ($currentDir === '.' ? '' : $currentDir . '/') . $import;

    // Κανονικοποίηση
    $parts = [];
    foreach (explode('/', $resolved) as $part) {
        if ($part === '' || $part === '.') continue;
        if ($part === '..') {
            array_pop($parts);
        } else {
            $parts[] = $part;
        }
    }

    return ['type' => 'internal', 'path' => implode('/', $parts)];
}

private function randomCubosColor(): string {
    $palette = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
        '#f97316', // orange
        '#6366f1', // indigo
        '#14b8a6', // teal
        '#a855f7', // purple
    ];
    return $palette[array_rand($palette)];
}


/**
 * Επιστρέφει όλα τα cubos με τα αρχεία τους ομαδοποιημένα.
 * Χρήση: Cubo Mode tree.
 */
protected function getCubosWithFiles($params = []): array {
    // Φίλτρα (προαιρετικά)
    $status   = isset($params['status'])   ? (int)$params['status']   : 1;
    $domain   = $params['domain']   ?? null;   // φίλτρο domain
    $search   = $params['search']   ?? null;   // φίλτρο name/title

    // 1. Φόρτωσε cubos
    $sqlCubos = "SELECT id, name, title, folder, version, color, status,
                        description, created, updated
                   FROM gen_admin.cubos
                  WHERE status = ?";
    $bindings = [$status];

    if ($search) {
        $sqlCubos .= " AND (name LIKE ? OR title LIKE ?)";
        $bindings[] = "%{$search}%";
        $bindings[] = "%{$search}%";
    }

    $sqlCubos .= " ORDER BY name ASC";

    $cubosRows = $this->db->flist($sqlCubos, $bindings);
    if (!is_array($cubosRows)) $cubosRows = [];
    $cubosRows = array_values($cubosRows);

    if (empty($cubosRows)) {
        return ['success' => true, 'data' => []];
    }

    // 2. Φόρτωσε components (με φίλτρο domain αν δοθεί)
    $cubosIds = array_column($cubosRows, 'id');
    $placeholders = implode(',', array_fill(0, count($cubosIds), '?'));

    $sqlComp = "SELECT c.id, c.cubosid, c.name, c.path, c.domain,
                       c.filetype, c.modified, c.filesize, c.version,
                       c.instances, c.color, c.status
                  FROM gen_admin.components c
                 WHERE c.cubosid IN ($placeholders)";

    $compBindings = $cubosIds;

    if ($domain) {
        $sqlComp .= " AND c.domain = ?";
        $compBindings[] = $domain;
    }

    $sqlComp .= " ORDER BY c.domain ASC, c.path ASC";

    $compRows = $this->db->flist($sqlComp, $compBindings);
    if (!is_array($compRows)) $compRows = [];
    $compRows = array_values($compRows);

    // 3. Ομαδοποίηση ανά cubosid
    $byCubos = [];
    foreach ($compRows as $row) {
        $cid = (int)$row['cubosid'];
        if (!isset($byCubos[$cid])) $byCubos[$cid] = [];
        $byCubos[$cid][] = [
            'id'        => (int)$row['id'],
            'name'      => $row['name'],
            'path'      => $row['path'],
            'domain'    => $row['domain'],
            'filetype'  => $row['filetype'],
            'modified'  => $row['modified'] ? date('c', (int)$row['modified']) : null,
            'filesize'  => $row['filesize'] ? (int)$row['filesize'] : 0,
            'version'   => $row['version'],
            'instances' => (int)$row['instances'],
            'color'     => $row['color'],
            'status'    => (int)$row['status'],
        ];
    }

    // 4. Χτίσε το τελικό αποτέλεσμα
    $result = [];
    foreach ($cubosRows as $c) {
        $cid = (int)$c['id'];
        $files = $byCubos[$cid] ?? [];

        // Μέτρηση domains
        $domains = array_unique(array_column($files, 'domain'));
        sort($domains);

        $result[] = [
            'id'          => $cid,
            'name'        => $c['name'],
            'title'       => $c['title'],
            'folder'      => $c['folder'],
            'version'     => $c['version'],
            'color'       => $c['color'] ?: '#808080',
            'status'      => (int)$c['status'],
            'description' => $c['description'],
            'created'     => $c['created'],
            'updated'     => $c['updated'],
            'files'       => $files,
            'files_count' => count($files),
            'domains'     => $domains,
            'domains_count' => count($domains),
        ];
    }

    // Φίλτρο: μόνο cubos με αρχεία (προαιρετικό)
    $onlyWithFiles = !empty($params['only_with_files']);
    if ($onlyWithFiles) {
        $result = array_values(array_filter($result, fn($c) => $c['files_count'] > 0));
    }

    return ['success' => true, 'data' => $result];
}

/**
 * Επιστρέφει τα αρχεία ενός συγκεκριμένου cubos.
 * Χρήση: refresh μετά από drag & drop.
 */
protected function getCuboFiles($params = []): array {
    $cubosId = $params['cubos_id'] ?? $params['cubosid'] ?? $_POST['cubos_id'] ?? $_POST['cubosid'] ?? null;

    if (!$cubosId) {
        return ['success' => false, 'error' => 'cubos_id required'];
    }

    $cubosId = (int)$cubosId;

    // Φόρτωσε cubos
    $cubosRows = $this->db->flist(
        "SELECT id, name, title, folder, version, color, status, description
           FROM gen_admin.cubos
          WHERE id = ? LIMIT 1",
        [$cubosId]
    );
    $cubosRows = is_array($cubosRows) ? array_values($cubosRows) : [];
    $cubosRow = $cubosRows[0] ?? null;

    if (!$cubosRow) {
        return ['success' => false, 'error' => 'Cubos not found'];
    }

    // Φόρτωσε files
    $compRows = $this->db->flist(
        "SELECT id, cubosid, name, path, domain, filetype, modified,
                filesize, version, instances, color, status
           FROM gen_admin.components
          WHERE cubosid = ?
          ORDER BY domain ASC, path ASC",
        [$cubosId]
    );
    if (!is_array($compRows)) $compRows = [];
    $compRows = array_values($compRows);

    $files = [];
    foreach ($compRows as $row) {
        $files[] = [
            'id'        => (int)$row['id'],
            'name'      => $row['name'],
            'path'      => $row['path'],
            'domain'    => $row['domain'],
            'filetype'  => $row['filetype'],
            'modified'  => $row['modified'] ? date('c', (int)$row['modified']) : null,
            'filesize'  => $row['filesize'] ? (int)$row['filesize'] : 0,
            'version'   => $row['version'],
            'instances' => (int)$row['instances'],
            'color'     => $row['color'],
            'status'    => (int)$row['status'],
        ];
    }

    $domains = array_unique(array_column($files, 'domain'));
    sort($domains);

    return [
        'success' => true,
        'data' => [
            'id'            => (int)$cubosRow['id'],
            'name'          => $cubosRow['name'],
            'title'         => $cubosRow['title'],
            'folder'        => $cubosRow['folder'],
            'version'       => $cubosRow['version'],
            'color'         => $cubosRow['color'] ?: '#808080',
            'status'        => (int)$cubosRow['status'],
            'description'   => $cubosRow['description'],
            'files'         => $files,
            'files_count'   => count($files),
            'domains'       => $domains,
            'domains_count' => count($domains),
        ],
    ];
}


/**
 * Αντιγράφει ένα component σε άλλο cubos (νέο row).
 * Δεν διαγράφει το original.
 */
protected function copyComponentToCubos($params = []): array {
    $sourcePath   = $params['source_path']   ?? $_POST['source_path']   ?? null;
    $sourceDomain = $params['source_domain'] ?? $_POST['source_domain'] ?? null;
    $targetCubos  = $params['target_cubosid'] ?? $params['cubos_id'] ?? $_POST['target_cubosid'] ?? $_POST['cubos_id'] ?? null;

    if (!$sourcePath || !$targetCubos) {
        return ['success' => false, 'error' => 'source_path and target_cubosid required'];
    }

    $targetCubos = (int)$targetCubos;

    // 1. Βρες το source component
    $srcRows = $this->db->flist(
        "SELECT id, cubosid, name, path, domain, filetype, modified,
                filesize, version, instances, color, status
           FROM gen_admin.components
          WHERE path = ?
          LIMIT 1",
        [$sourcePath]
    );
    $srcRows = is_array($srcRows) ? array_values($srcRows) : [];
    $src = $srcRows[0] ?? null;

    if (!$src) {
        return ['success' => false, 'error' => 'Source component not found: ' . $sourcePath];
    }

    // 2. Έλεγξε αν υπάρχει ήδη στο target cubos
    $existing = $this->db->flist(
        "SELECT id FROM gen_admin.components
          WHERE cubosid = ? AND path = ?
          LIMIT 1",
        [$targetCubos, $sourcePath]
    );
    $existingId = $this->firstScalarId($existing);

    if ($existingId) {
        return [
            'success' => true,
            'action'  => 'already_exists',
            'message' => 'Component already in target cubos',
            'component_id' => $existingId,
        ];
    }

    // 3. Έλεγξε ότι το target cubos υπάρχει
    $cubosRows = $this->db->flist(
        "SELECT id, name, title, folder FROM gen_admin.cubos WHERE id = ? LIMIT 1",
        [$targetCubos]
    );
    $cubosRows = is_array($cubosRows) ? array_values($cubosRows) : [];
    $cubosRow = $cubosRows[0] ?? null;

    if (!$cubosRow) {
        return ['success' => false, 'error' => 'Target cubos not found: ' . $targetCubos];
    }

    // 4. INSERT νέο row
    $now = date('Y-m-d H:i:s');
    $insertData = [
        'parent'    => 0,
        'sort'      => 0,
        'cubosid'   => $targetCubos,
        'name'      => $src['name'],
        'path'      => $src['path'],
        'domain'    => $src['domain'],
        'filetype'  => $src['filetype'],
        'modified'  => $src['modified'],
        'filesize'  => $src['filesize'],
        'version'   => $src['version'],
        'instances' => 1,
        'status'    => 1,
        'created'   => $now,
        'updated'   => $now,
        'color'     => $src['color'] ?: '#808080',
    ];

    $insResult = $this->db->inseRaw('gen_admin.components', $insertData);

    if (is_numeric($insResult) && (int)$insResult > 0) {
        $newId = (int)$insResult;
    } elseif ($insResult === true) {
        $lookup = $this->db->flist(
            "SELECT id FROM gen_admin.components
              WHERE cubosid = ? AND path = ?
              ORDER BY id DESC LIMIT 1",
            [$targetCubos, $sourcePath]
        );
        $newId = $this->firstScalarId($lookup);
    } else {
        return ['success' => false, 'error' => 'Failed to copy component'];
    }

    // 5. Ενημέρωση cubos.updated
    $this->db->q(
        "UPDATE gen_admin.cubos SET updated = ? WHERE id = ?",
        [$now, $targetCubos]
    );

    return [
        'success'         => true,
        'action'          => 'copied',
        'component_id'    => $newId,
        'source_cubosid'  => (int)$src['cubosid'],
        'target_cubosid'  => $targetCubos,
        'cubos_name'      => $cubosRow['name'],
        'cubos_title'     => $cubosRow['title'],
    ];
}

/**
 * Μετακινεί ένα component σε άλλο cubos (αλλάζει το cubosid).
 * Δεν δημιουργεί νέο row — ενημερώνει το υπάρχον.
 */
protected function moveComponentToCubos($params = []): array {
    $path        = $params['path']        ?? $_POST['path']        ?? null;
    $targetCubos = $params['target_cubosid'] ?? $params['cubos_id'] ?? $_POST['target_cubosid'] ?? $_POST['cubos_id'] ?? null;

    if (!$path || !$targetCubos) {
        return ['success' => false, 'error' => 'path and target_cubosid required'];
    }

    $targetCubos = (int)$targetCubos;

    // 1. Βρες το component
    $rows = $this->db->flist(
        "SELECT id, cubosid FROM gen_admin.components WHERE path = ? LIMIT 1",
        [$path]
    );
    $rows = is_array($rows) ? array_values($rows) : [];
    $row = $rows[0] ?? null;

    if (!$row) {
        return ['success' => false, 'error' => 'Component not found: ' . $path];
    }

    $oldCubos = (int)$row['cubosid'];

    if ($oldCubos === $targetCubos) {
        return [
            'success' => true,
            'action'  => 'no_change',
            'message' => 'Already in target cubos',
        ];
    }

    // 2. Έλεγξε target cubos
    $cubosRows = $this->db->flist(
        "SELECT id, name, title FROM gen_admin.cubos WHERE id = ? LIMIT 1",
        [$targetCubos]
    );
    $cubosRows = is_array($cubosRows) ? array_values($cubosRows) : [];
    $cubosRow = $cubosRows[0] ?? null;

    if (!$cubosRow) {
        return ['success' => false, 'error' => 'Target cubos not found'];
    }

    // 3. UPDATE
    $now = date('Y-m-d H:i:s');
    $this->db->q(
        "UPDATE gen_admin.components
            SET cubosid = ?, updated = ?
          WHERE id = ?",
        [$targetCubos, $now, (int)$row['id']]
    );

    // 4. Ενημέρωση cubos.updated και για τα δύο
    $this->db->q(
        "UPDATE gen_admin.cubos SET updated = ? WHERE id IN (?, ?)",
        [$now, $oldCubos, $targetCubos]
    );

    return [
        'success'        => true,
        'action'         => 'moved',
        'component_id'   => (int)$row['id'],
        'old_cubosid'    => $oldCubos,
        'target_cubosid' => $targetCubos,
        'cubos_name'     => $cubosRow['name'],
        'cubos_title'    => $cubosRow['title'],
    ];
}


/**
 * Αφαιρεί ένα component από το cubos του (διαγράφει το row).
 * ΔΕΝ διαγράφει το φυσικό αρχείο.
 */
protected function removeComponentFromCubos($params = []): array {
    $path = $params['path'] ?? $_POST['path'] ?? null;

    if (!$path) {
        return ['success' => false, 'error' => 'path required'];
    }

    $rows = $this->db->flist(
        "SELECT id, cubosid FROM gen_admin.components WHERE path = ? LIMIT 1",
        [$path]
    );
    $rows = is_array($rows) ? array_values($rows) : [];
    $row = $rows[0] ?? null;

    if (!$row) {
        return ['success' => false, 'error' => 'Component not found'];
    }

    $this->db->q(
        "DELETE FROM gen_admin.components WHERE id = ?",
        [(int)$row['id']]
    );

    $now = date('Y-m-d H:i:s');
    $this->db->q(
        "UPDATE gen_admin.cubos SET updated = ? WHERE id = ?",
        [$now, (int)$row['cubosid']]
    );

    return [
        'success' => true,
        'deleted_component_id' => (int)$row['id'],
        'removed_from_cubosid' => (int)$row['cubosid'],
    ];
}

/**
 * Αντιγράφει ένα component από cubos στο filesystem ενός domain.
 * Χρήση: "install" ενός cubos component σε domain.
 */
protected function copyComponentToDomain($params = []): array {
    $sourcePath   = $params['source_path']   ?? $_POST['source_path']   ?? null;
    $targetDomain = $params['target_domain'] ?? $_POST['target_domain'] ?? null;
    $targetPath   = $params['target_path']   ?? $_POST['target_path']   ?? null;

    if (!$sourcePath || !$targetDomain) {
        return ['success' => false, 'error' => 'source_path and target_domain required'];
    }

    $publicRoot = '/var/www/gs/public';

    // 1. Βρες το source component
    $srcRows = $this->db->flist(
        "SELECT id, cubosid, name, path, domain, filetype, modified,
                filesize, version, color
           FROM gen_admin.components
          WHERE path = ?
          LIMIT 1",
        [$sourcePath]
    );
    $srcRows = is_array($srcRows) ? array_values($srcRows) : [];
    $src = $srcRows[0] ?? null;

    if (!$src) {
        return ['success' => false, 'error' => 'Source component not found: ' . $sourcePath];
    }

    // 2. Βρες το πραγματικό αρχείο
    $srcDomainPath = $publicRoot . '/' . $src['domain'] . '/src/' . ltrim(
        str_replace($src['domain'] . '/', '', $src['path']),
        '/'
    );

    // Fallback: δοκίμασε απευθείας
    if (!is_file($srcDomainPath)) {
        $srcDomainPath = $publicRoot . '/' . ltrim($src['path'], '/');
    }

    if (!is_file($srcDomainPath)) {
        return ['success' => false, 'error' => 'Source file not found on disk: ' . $srcDomainPath];
    }

    // 3. Χτίσε το target path
    // target_path = π.χ. 'components/Slides.jsx' (χωρίς domain/src)
    $relPath = $targetPath ?: str_replace($src['domain'] . '/', '', $src['path']);
    $targetFullPath = $publicRoot . '/' . $targetDomain . '/src/' . ltrim($relPath, '/');

    // 4. Έλεγχος ότι ο target φάκελος υπάρχει
    $targetDir = dirname($targetFullPath);
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true)) {
        return ['success' => false, 'error' => 'Cannot create target directory: ' . $targetDir];
    }

    // 5. Copy
    if (!copy($srcDomainPath, $targetFullPath)) {
        return ['success' => false, 'error' => 'Copy failed'];
    }

    // 6. Το νέο path για components
    $newDisplayPath = $targetDomain . '/' . ltrim($relPath, '/');

    // 7. Έλεγξε αν υπάρχει ήδη component στο target domain
    $existing = $this->db->flist(
        "SELECT id FROM gen_admin.components WHERE path = ? LIMIT 1",
        [$newDisplayPath]
    );
    $existingId = $this->firstScalarId($existing);

    $now = date('Y-m-d H:i:s');
    $componentVersion = substr(date('Y', filemtime($targetFullPath)), -1)
                      . date('mdHi', filemtime($targetFullPath));

    if ($existingId) {
        $this->db->q(
            "UPDATE gen_admin.components
                SET cubosid = ?, name = ?, domain = ?, filetype = ?,
                    modified = ?, filesize = ?, version = ?, updated = ?
              WHERE id = ?",
            [
                (int)$src['cubosid'],
                basename($targetFullPath),
                $targetDomain,
                pathinfo($targetFullPath, PATHINFO_EXTENSION),
                filemtime($targetFullPath),
                filesize($targetFullPath),
                $componentVersion,
                $now,
                $existingId,
            ]
        );
        $componentId = $existingId;
    } else {
        $insResult = $this->db->inseRaw('gen_admin.components', [
            'parent'    => 0,
            'sort'      => 0,
            'cubosid'   => (int)$src['cubosid'],
            'name'      => basename($targetFullPath),
            'path'      => $newDisplayPath,
            'domain'    => $targetDomain,
            'filetype'  => pathinfo($targetFullPath, PATHINFO_EXTENSION),
            'modified'  => filemtime($targetFullPath),
            'filesize'  => filesize($targetFullPath),
            'version'   => $componentVersion,
            'instances' => 1,
            'status'    => 1,
            'created'   => $now,
            'updated'   => $now,
            'color'     => $src['color'] ?: '#808080',
        ]);

        if (is_numeric($insResult) && (int)$insResult > 0) {
            $componentId = (int)$insResult;
        } elseif ($insResult === true) {
            $lookup = $this->db->flist(
                "SELECT id FROM gen_admin.components WHERE path = ? ORDER BY id DESC LIMIT 1",
                [$newDisplayPath]
            );
            $componentId = $this->firstScalarId($lookup);
        } else {
            return ['success' => false, 'error' => 'Failed to create component record'];
        }
    }

    return [
        'success'       => true,
        'component_id'  => $componentId,
        'source_path'   => $sourcePath,
        'target_path'   => $newDisplayPath,
        'target_domain' => $targetDomain,
        'copied_to'     => $targetFullPath,
    ];
}

/**
 * Επιστρέφει λεπτομέρειες ενός cubos (για tooltip/modal).
 */
protected function getCuboDetails($params = []): array {
    $cubosId = $params['cubos_id'] ?? $params['cubosid'] ?? $_POST['cubos_id'] ?? $_POST['cubosid'] ?? null;

    if (!$cubosId) {
        return ['success' => false, 'error' => 'cubos_id required'];
    }

    $cubosId = (int)$cubosId;

    $rows = $this->db->flist(
        "SELECT id, name, title, folder, version, color, status,
                description, config, dependencies, created, updated
           FROM gen_admin.cubos
          WHERE id = ? LIMIT 1",
        [$cubosId]
    );
    $rows = is_array($rows) ? array_values($rows) : [];
    $row = $rows[0] ?? null;

    if (!$row) {
        return ['success' => false, 'error' => 'Cubos not found'];
    }

    // Μέτρηση files
    $countRows = $this->db->flist(
        "SELECT COUNT(*) AS cnt FROM gen_admin.components WHERE cubosid = ?",
        [$cubosId]
    );
    $count = 0;
    if (is_array($countRows) && !empty($countRows)) {
        $first = reset($countRows);
        $count = is_array($first) ? (int)($first['cnt'] ?? 0) : (int)$first;
    }

    return [
        'success' => true,
        'data' => [
            'id'            => (int)$row['id'],
            'name'          => $row['name'],
            'title'         => $row['title'],
            'folder'        => $row['folder'],
            'version'       => $row['version'],
            'color'         => $row['color'] ?: '#808080',
            'status'        => (int)$row['status'],
            'description'   => $row['description'],
            'config'        => $row['config'],
            'dependencies'  => $row['dependencies'],
            'created'       => $row['created'],
            'updated'       => $row['updated'],
            'files_count'   => $count,
        ],
    ];
}

/**
 * Αλλάζει το χρώμα ενός cubos.
 */
protected function updateCuboColor($params = []): array {
    $cubosId = $params['cubos_id'] ?? $params['cubosid'] ?? $_POST['cubos_id'] ?? $_POST['cubosid'] ?? null;
    $color   = $params['color'] ?? $_POST['color'] ?? null;

    if (!$cubosId || !$color) {
        return ['success' => false, 'error' => 'cubos_id and color required'];
    }

    $cubosId = (int)$cubosId;

    // Validate hex
    if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
        return ['success' => false, 'error' => 'Invalid color format (expected #RRGGBB)'];
    }

    $now = date('Y-m-d H:i:s');
    $this->db->q(
        "UPDATE gen_admin.cubos SET color = ?, updated = ? WHERE id = ?",
        [$color, $now, $cubosId]
    );

    return [
        'success' => true,
        'cubos_id' => $cubosId,
        'color' => $color,
    ];
}

/**
 * Λίστα cubos με πλήθος αρχείων (για dropdown / stats).
 */
protected function listCubosWithCounts($params = []): array {
    $rows = $this->db->flist(
        "SELECT b.id, b.name, b.title, b.folder, b.version, b.color, b.status,
                COUNT(c.id) AS files_count,
                COUNT(DISTINCT c.domain) AS domains_count
           FROM gen_admin.cubos b
           LEFT JOIN gen_admin.components c ON c.cubosid = b.id
          WHERE b.status = 1
          GROUP BY b.id
          ORDER BY b.name ASC"
    );

    if (!is_array($rows)) $rows = [];
    $rows = array_values($rows);

    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
        $r['files_count'] = (int)$r['files_count'];
        $r['domains_count'] = (int)$r['domains_count'];
        $r['color'] = $r['color'] ?: '#808080';
    }

    return ['success' => true, 'data' => $rows];
}

protected function readFile($params = []): array {
    $publicRoot = '/var/www/gs/public';
    $path = $params['path'] ?? $_POST['path'] ?? $_GET['path'] ?? null;

    if (!$path) {
        return ['success' => false, 'error' => 'path required'];
    }

    // Ασφάλεια: μόνο εντός publicRoot
    $fullPath = realpath($publicRoot . '/' . ltrim($path, '/'));
    $publicRootReal = realpath($publicRoot);

    if (!$fullPath || strpos($fullPath, $publicRootReal) !== 0) {
        return ['success' => false, 'error' => 'Access denied'];
    }

    if (!is_file($fullPath)) {
        return ['success' => false, 'error' => 'File not found'];
    }

    return [
        'success' => true,
        'data' => [
            'content' => file_get_contents($fullPath),
            'path' => $path,
            'size' => filesize($fullPath),
            'modified' => filemtime($fullPath),
        ]
    ];
}

}