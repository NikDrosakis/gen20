<?php
namespace Core;
use Exception;

trait CuboPublic {
/**
aka CP based on domain
db gen_localost data installed from gen_admin tables main, maincubo, maingrp
and constructs the web UI of any domain
CA in Layout provides all cubos with their mains
τώρα το maingrp κάνει τη διαδικασία το οποίο χρησιμοποιείται
μόνο για grouparisma σε usergrps

custom domain: gen_localhost
1) addCP
2) delCP
3) renderCubo
4) genMaincubo
- addPageCA
- delPageCA
- maintainCA
- backupCA

*/
protected function addPagegrpCP($domain='', $name = '') {
echo "add cubo to maingrp, copies cubo to ";
}

protected function delCP(string $domain='',string $name): bool {
    // Validate input
    if (empty($name)) {
        echo "Error: Cubo name cannot be empty.\n";
        return false;
    }
    $domain = $domain ?? $this->publicdb;

    // Step 1: Delete related database entries
    try {
        $this->db->q("DELETE FROM {$this->publicdb}.maingrp WHERE name = ?", [$name]);
        $this->db->q("DELETE FROM {$this->publicdb}.main WHERE name = ?", [$name]);

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

protected function renderCubo($cubo) {
    try {
        // Check if the $cubo contains a dot
        if (strpos($cubo, '.') !== false) {
            list($c, $file) = explode('.', $cubo);
            $url = SITE_URL . "cubos/index.php?cubo=$c&file=$file.php";
        } else {
            $url = SITE_URL . "cubos/index.php?cubo=$cubo&file=public.php";
        }
        // Fetch the URL with the correct cubo and file
        $response = $this->fetchUrl($url);

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

protected function getMaincubo($pageName = '') {
    $page = is_array($pageName) ? $pageName['key'] : ($pageName !== '' ? $pageName : $this->page);
    $list = [];

    // Ensure we fetch multiple rows
    $fetch = $this->db->fa("SELECT maincubo.area,maincubo.method, maincubo.name as cubo
        FROM {$this->publicdb}.maincubo
        LEFT JOIN {$this->publicdb}.main ON main.id = maincubo.mainid
        WHERE main.name = ?", [$page]);

    if (!empty($fetch) && is_array($fetch)) {
        foreach ($fetch as $row) {
            $list[$row['area']][$row['method']] = $row['cubo'];
        }
    }
    return $list;
}


}