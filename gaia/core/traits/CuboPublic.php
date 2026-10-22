<?php
namespace Core\Traits;
use Exception;

trait CuboPublic {
/**
abbrev. CP based on domain
db gen_localost data installed from gen_admin tables page, pagecubo, pagegrp
and constructs the web UI of any domain
CA in Layout provides all cubos with their pages
τώρα το pagegrp κάνει τη διαδικασία το οποίο χρησιμοποιείται
μόνο για grouparisma σε usergrps

custom domain: gen_localhost
1) addCP
2) delCP
3) renderCP
4) genpagecubo
TODO addPageCA
TODO delPageCA
- maintainCA
- backupCA

CREATE TABLE `page` (
  `id` int(11) UNSIGNED NOT NULL COMMENT 'auto',
  `cuboviewid` int(10) UNSIGNED DEFAULT NULL,
  `pagegrpid` int(10) UNSIGNED NOT NULL COMMENT 'selectjoin-gen_vivalibrocom.maingrp.name',
  `sort` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `name` varchar(300) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `img` varchar(200) DEFAULT NULL COMMENT 'img-upload',
  `description` text DEFAULT NULL COMMENT 'loc-default',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'selectG-status',
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'readonly',
  `modified` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
  `meta` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
*/


protected function addPageCP(string $name): bool {
    if (empty($name)) {
        echo "Error: Page name is required.\n";
        return false;
    }
    $db = $this->publicdb;
    $data = [
        'name'        => $name,
        'sort'        => 0,
        'link'        => "/$name",
        'title'       => ucfirst($name),
        'status'      => 1,
        'created'     => date('Y-m-d H:i:s'),
        'modified'    => date('Y-m-d H:i:s')
    ];

    try {
        $this->db->insert("{$db}.page", $data);
        echo "Cubo page `$name` added to `$db.page` .\n";
        return true;
    } catch (Exception $e) {
        echo "Error adding page `$name`: " . $e->getMessage() . "\n";
        return false;
    }
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

protected function renderAPCuCP($cuboview) {
    try {
        // Split the cuboview into cubo and view parts
        list($cubo, $view) = explode('.', $cuboview);
        // Construct the URL to fetch data
        $url = SITE_URL . "cubos/index.php?cubo=$cubo&file=$view.php";

        // Check for APCu cache first
        //$cache = apcu_fetch("cubo_" . $cuboview);
            $cache=false;
        if ($cache) {
            // Use cached response if available
            $response = $cache;
        } else {
            // If no cache found, fetch the data and set the cache
            $response = $this->fetchUrl($url);
            apcu_store("cubo_" . $cuboview, $response);
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


/**
Watch cubos viewfiles in cubo is changed
a) update cubo_ cache saved in Redis
*/
protected function renderCP($cuboview) {

$cuboview=is_array($cuboview) ? $cuboview['name']: $cuboview;
    try {
        // Split the cuboview into cubo and view parts
        list($cubo, $view) = explode('.', $cuboview);
        // Construct the URL to fetch data
        $url = SITE_URL . "cubos/index.php?cubo=$cubo&file=$view.php";
       
        // Check for cache first
     //   $cache = $this->redis->get("cubo_" . $cuboview);

       // if ($cache) {
            // Use cached response if available
         //   $response = $cache;
        //} else {
            // If no cache found, fetch the data and set the cache

            //$response = $this->fetchUrl($url);
            $response = $this->include_buffer($url);

          //  $this->redis->set("cubo_" . $cuboview, $response);
        //}

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

protected function pageCP($link = '') {
    $page = $link !== '' ? $link : $this->page;
    $list = ['m'=>[],'f'=>[],'h'=>[],'sl'=>[],'sr'=>[]];
    $fetchM = $this->db->f("SELECT name,menu FROM {$this->pagetable} WHERE link = ? ",[$link]);
    $fetch = $this->db->fa("
        SELECT pagecubo.area, pagecubo.cuboviewid, cuboview.name AS cuboname FROM {$this->publicdb}.pagecubo
        LEFT JOIN {$this->publicdb}.page ON page.id = pagecubo.pageid
        LEFT JOIN gen_admin.cuboview ON cuboview.id = pagecubo.cuboviewid
        WHERE page.link = ?
    ", [$page]);

    if (!empty($fetch) && is_array($fetch)) {
        foreach ($fetch as $row) {
            if (!empty($row['cuboviewid'])) {
                $list[$row['area']][]["renderCP"] = $row['cuboname'];
            }
        }
    }
        //add default main in m area
        if(!empty($fetchM)){
        if($fetchM['menu']){
        $list['h'][0]["renderCP"]= "default.menu";
        }
        $list['m'][0]["renderCP"]= $fetchM['name'];
        }
    return $list;
}


protected function getpagecubo($pageName = '') {
    $page = is_array($pageName) ? $pageName['key'] : ($pageName !== '' ? $pageName : $this->page);
    $list = [];
    $list['m'] = [];
    // Ensure we fetch multiple rows
$likePattern = '%.' . $pageName;
$exactPattern = $pageName . '.public';
$fetchM = $this->db->f("SELECT name FROM {$this->publicdb}.page WHERE link = ? ",[$pageName]);

    $fetch = $this->db->fa("SELECT pagecubo.area,page.link,page.name
        FROM {$this->publicdb}.pagecubo
        LEFT JOIN {$this->publicdb}.page ON page.id = pagecubo.pageid
        WHERE page.name = ?", [$page]);

    if (!empty($fetch) && is_array($fetch)) {
        foreach ($fetch as $row) {
        //if link does not exist set name[1] or name[0]
        $exploded_name = explode('.',$row['name']);
        $alterlink = $exploded_name[1] === 'public' ? $exploded_name[0] : $exploded_name[1];
        $list[$row['area']]["renderCP"] = $row['link'] ?? $alterlink;
        }
            }
        //add default main in m area
        if(!empty($fetchM)){
        $list['m'][0]["renderCP"]= $fetchM['name'];
        }
    return $list;
}

protected function getLinks() {
return $this->db->fa("SELECT * FROM {$this->publicdb}.links WHERE linksgrpid=2 ORDER BY sort");
}


}