<?php
namespace Core\Traits;

trait Meta {
/**
page & subpage metadata
create list of metadata to Action
*/
protected function getPageMetatags(): array {
    // Initialize an empty string for concatenation
    $metaString = $this->page;

    // Check if the system is 'admin'
    if ($this->SYSTEM == 'admin') {
        // ADMIN SYSTEM
        if (!empty($this->page)) {
            // ADMIN SUBPAGE
            $metaString .= ',' . $this->page;

            // Add metadata based on the type of admin subpage
            if ($this->db_sub['type'] == 'table') {
                $db = $_SERVER['SYSTEM']=='admin' ? "gen_admin" : $this->publicdb;
                $meta = $this->db->f("SELECT meta FROM {$db}.metadata WHERE name = ?", [$this->page]);
            } else {
                $meta = $this->db->f("SELECT meta FROM {$this->publicdb}.page WHERE name = ?", [$this->page]);
            }

            // Append comma-separated meta if found
            if ($meta) {
                $metaString .= ',' . $meta['meta'];
            }
        } else {
            // page ADMIN PAGE
            $meta = $this->db->f("SELECT meta FROM {$this->publicdb}.pagegrp WHERE name = ?", [$this->page]);
            if ($meta) {
                $metaString .= ',' . $meta['meta'];
            }
        }
    } else {
        // PUBLIC SYSTEM
             $db = $_SERVER['SYSTEM']=='admin' ? "gen_admin" : $this->publicdb;
        if (!empty($this->page)) {
            // PUBLIC PAGE
            $meta = $this->db->f("SELECT meta FROM {$this->publicdb}.page WHERE name = ?", [$this->page]);
        } else {
            // PUBLIC page PAGE
            $meta = $this->db->f("SELECT meta FROM {$db}.metadata WHERE name = ?", [$this->page]);
        }

        // Append comma-separated meta if found
        if ($meta) {
            $metaString .= ',' . $meta['meta'];
        }
    }

    // Explode by commas, trim each tag, filter out empty elements, and wrap in HTML
    $tags = array_filter(array_map('trim', explode(',', $metaString)));
    return $tags;
}



/**
Render metadata of all levels
 */
protected function renderMetadata(): array {
    // 1st level metadata
    $firstLevel = $this->is['meta_title_en'] ?? null;

    // 2nd level metadata
    $secondLevel = $this->getPageMetadata();

    // 3rd level metadata
    $thirdLevel = $this->metadata;

    // Collect all metadata into a single array
    $res = [];

    // Add each level of metadata if it exists
    if ($firstLevel) {
        $res[] = $firstLevel;
    }
    if (!empty($secondLevel)) {
        $res = array_merge($res, (array) $secondLevel); // Ensure it's an array and merge
    }
    if (!empty($thirdLevel)) {
        $res = array_merge($res, (array) $thirdLevel);
    }

    // Return comma-separated metadata or a default message
    return $res;
}


}