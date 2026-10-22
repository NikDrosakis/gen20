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

    private function rrmdir($dir) {
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
}