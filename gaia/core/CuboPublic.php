<?php
namespace Core;
use Exception;

trait CuboPublic {
/**
aka CP based on domain
db gen_localost data installed from gen_admin tables page, pagecubo, pagegrp
and constructs the web UI of any domain
CA in Layout provides all cubos with their pages
τώρα το pagegrp κάνει τη διαδικασία το οποίο χρησιμοποιείται
μόνο για grouparisma σε usergrps

custom domain: gen_localhost
1) addCP
2) delCP
3) renderCubo
4) genpagecubo
- addPageCA
- delPageCA
- maintainCA
- backupCA

*/
protected function addPagegrpCP($domain='', $name = '') {
echo "add cubo to pagegrp, copies cubo to ";
}

protected function delCP(string $domain,string $name): bool {
    // Validate input
    if (empty($name)) {
        echo "Error: Cubo name cannot be empty.\n";
        return false;
    }
    $domain = $domain ?? $this->publicdb;

    // Step 1: Delete related database entries
    try {
        $this->db->q("DELETE FROM {$this->publicdb}.pagegrp WHERE name = ?", [$name]);
        $this->db->q("DELETE FROM {$this->publicdb}.page WHERE name = ?", [$name]);

        echo "Database entries for `$name` deleted successfully.\n";
    } catch (PDOException $e) {
        echo "Error deleting database entries for `$name`: " . $e->getMessage() . "\n";
        return false;
    }
    // Step 2: Drop the table(s) (if applicable)
    try {
        if ($this->drop("$name", 'table')) {
            echo "Database `$name` dropped successfully.\n";
        } else {
            echo "Failed to drop table `$name`.\n";
        }
    } catch (InvalidArgumentException $e) {
        echo "Error: " . $e->getMessage() . "\n";
        return false;
    } catch (PDOException $e) {
        echo "Database error: " . $e->getMessage() . "\n";
        return false;
    }

    echo "Total deletion of Cubo `$cubo` completed successfully.\n";
    return true;
}

protected function updateCacheCP($cuboview) {
    // Split the cuboview into cubo and view parts
    list($cubo, $view) = explode('.', $cuboview);
    // Construct the URL to fetch data
    $url = SITE_URL . "cubos/index.php?cubo=$cubo&file=$view.php";

    // Delete the existing cache key
    $this->redis->del("cubo_" . $cuboview);

    // Fetch the new data
    $response = $this->fetchUrl($url);

    // Set the new response to cache
    $this->redis->set("cubo_" . $cuboview, $response);
}


protected function renderCubo($cuboview) {
    try {
        // Split the cuboview into cubo and view parts
        list($cubo, $view) = explode('.', $cuboview);
        // Construct the URL to fetch data
        $url = SITE_URL . "cubos/index.php?cubo=$cubo&file=$view.php";

        // Check for cache first
        $cache = $this->redis->get("cubo_" . $cuboview);

        if ($cache) {
            // Use cached response if available
            $response = $cache;
        } else {
            // If no cache found, fetch the data and set the cache
            $response = $this->fetchUrl($url);
            $this->redis->set("cubo_" . $cuboview, $response);
        }

        // If the response is an array, return the 'data' key
        if (is_array($response) && isset($response['data'])) {
            return $response['data'];
        }

        // If the response is a string, return it directly
        if (is_string($response)) {
            return $response;
        }

        // Fallback if the response is invalid
        return "<p>Error: Invalid cubo response for '$cubo'.</p>";
    } catch (Exception $e) {
        // Log the error and return a fallback message
        error_log("Error rendering cubo '$cubo': " . $e->getMessage());
        return "<p>Error loading cubo '$cubo'.</p>";
    }
}


protected function getpagecubo($pageName = '') {
    $page = is_array($pageName) ? $pageName['key'] : ($pageName !== '' ? $pageName : $this->page);
    $list = [];
    // Ensure we fetch multiple rows
    $fetch = $this->db->fa("SELECT pagecubo.area,pagecubo.method, page.name as cubo
        FROM {$this->publicdb}.pagecubo
        LEFT JOIN {$this->publicdb}.page ON page.id = pagecubo.pageid
        WHERE page.name = ?", [$page]);
    if (!empty($fetch) && is_array($fetch)) {
        foreach ($fetch as $row) {
            $list[$row['area']][$row['method']] = $row['cubo'];
        }
    }
    return $list;
}

protected function getLinks() {
return $this->db->fa("SELECT * FROM {$this->publicdb}.links WHERE linksgrpid=2 ORDER BY sort");
}


}