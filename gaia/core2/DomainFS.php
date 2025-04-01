<?php
namespace Core;
use Exception;

trait DomainFS {
    /**
     * Build filesystem structure for a domain in gaia/public/DOMAIN
     */
    protected function addFS(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;
        $publicPath = GAIAROOT."public/$domain";

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