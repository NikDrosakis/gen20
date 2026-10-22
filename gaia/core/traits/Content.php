<?php
namespace Core\Traits;
use Exception;
/*
db maria usage
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

          $this->db->q("DELETE FROM {$this->publicdb}.page WHERE name = ?", [$name]);
          $this->db->q("UPDATE FROM {$this->publicdb}.page WHERE name = ?", [$name]);

           $fetch = $this->db->fa("
                  SELECT pagecubo.area, pagecubo.cuboviewid, cuboview.name AS cuboname FROM {$this->publicdb}.pagecubo
                  LEFT JOIN {$this->publicdb}.page ON page.id = pagecubo.pageid
                  LEFT JOIN gen_admin.cuboview ON cuboview.id = pagecubo.cuboviewid
                  WHERE page.link = ?
              ", [$page]);

$fetchM = $this->db->f("SELECT name FROM {$this->publicdb}.page WHERE link = ? ",[$pageName]);

    $fetch = $this->db->fa("SELECT pagecubo.area,page.link,page.name
        FROM {$this->publicdb}.pagecubo
        LEFT JOIN {$this->publicdb}.page ON page.id = pagecubo.pageid
        WHERE page.name = ?", [$page]);

CREATE TABLE `content` (
  `id` int(10) UNSIGNED NOT NULL,
  `type` enum('post','page','block') NOT NULL,
  `userid` int(10) UNSIGNED NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 0,
  `name` varchar(200) NOT NULL,
  `title` varchar(300) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `published` datetime DEFAULT NULL,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lang` char(2) DEFAULT 'el',
  `view_count` int(10) UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
*/

trait Content {

//{"contentId":20,"area":"m","componentId":8}
protected function addContentComponent($params) {
    $contentId = $params['contentId'];
    $componentId = $params['componentId'];
    $area = $params['area'];

    $exists = $this->db->f("SELECT id FROM content_components
        WHERE content_id = {$contentId} AND component_id = {$componentId} AND area = '{$area}'");

    if ($exists) {
        return ['success' => true, 'action' => 'already_exists'];
    }

$this->db->inse("content_components", [
    'content_id' => $contentId,
    'component_id' => $componentId,
    'area' => $area,
    'created' => date('Y-m-d H:i:s')
]);

    $this->db->q("UPDATE components SET instances = instances + 1 WHERE id = {$componentId}");

    return ['success' => true, 'action' => 'inserted'];
}

// api/v1/local/removeContentComponent.php
protected function removeContentComponent($params) {
    $contentId = $params['contentId'];
    $componentId = $params['componentId'];
    $area = $params['area'];

    $this->db->q("DELETE FROM content_components
        WHERE content_id = {$contentId} AND component_id = {$componentId} AND area = '{$area}'");

    $this->db->q("UPDATE components SET instances = instances - 1 WHERE id = {$componentId}");

    return ['success' => true, 'action' => 'deleted'];
}

    protected function fetchContentArchive(string $type = 'post', int $classifid = 0, int $limit = 50, int $offset = 0): array
    {
        try {
            $sql = "SELECT c.*,
                           cl.name as classification_name,
                           cl.title_el as classification_title_el,
                           cl.title_en as classification_title_en
                    FROM {$this->publicdb}.content c
                    LEFT JOIN {$this->publicdb}.classification cl ON c.classifid = cl.id
                    WHERE c.type = :type
                      AND c.status = 1
            ";

            if ($classifid > 0) {
                $sql .= " AND c.classifid = :classifid";
            }

            $sql .= " ORDER BY c.published DESC, c.created DESC
                      LIMIT :limit OFFSET :offset";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':type', $type);
            $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);

            if ($classifid > 0) {
                $stmt->bindValue(':classifid', $classifid, \PDO::PARAM_INT);
            }

            $stmt->execute();
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);

        } catch (Exception $e) {
            throw new Exception("Error fetching content archive: " . $e->getMessage());
        }
    }

    /**
     * Fetch single content by ID with classification data
     *
     * @param int $id Content ID
     * @return array|null
     */
    protected function fetchContent(int $id): ?array
    {
        try {
            $sql = "SELECT c.*,
                           cl.id as classification_id,
                           cl.name as classification_name,
                           cl.title_el as classification_title_el,
                           cl.title_en as classification_title_en,
                           cl.description_el as classification_description_el,
                           cl.description_en as classification_description_en
                    FROM {$this->publicdb}.content c
                    LEFT JOIN {$this->publicdb}.classification cl ON c.classifid = cl.id
                    WHERE c.id = :id";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return $result ?: null;

        } catch (Exception $e) {
            throw new Exception("Error fetching content: " . $e->getMessage());
        }
    }

    /**
     * Update content
     *
     * @param int $id Content ID
     * @param array $data Data to update
     * @return bool
     */
    protected function updateContent(int $id, array $data): bool
    {
        try {
            // Validate classification if provided
            if (isset($data['classifid']) && $data['classifid'] > 0) {
                $check = $this->db->f("SELECT id FROM {$this->publicdb}.classification WHERE id = ?", [$data['classifid']]);
                if (!$check) {
                    throw new Exception("Invalid classification ID: {$data['classifid']}");
                }
            }

            // Build update query dynamically
            $fields = [];
            $params = [':id' => $id];

            $allowedFields = ['type', 'userid', 'status', 'name', 'title',
                             'excerpt', 'img', 'published', 'lang', 'view_count', 'classifid'];

            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "`$field` = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (empty($fields)) {
                return false;
            }

            $sql = "UPDATE {$this->publicdb}.content SET " . implode(', ', $fields) . "
                    WHERE id = :id";

            $stmt = $this->db->prepare($sql);
            return $stmt->execute($params);

        } catch (Exception $e) {
            throw new Exception("Error updating content: " . $e->getMessage());
        }
    }

    /**
     * Create new content
     *
     * @param array $data Content data
     * @return int Last insert ID
     */
    protected function createContent(array $data): int
    {
        try {
            // Validate classification if provided
            if (isset($data['classifid']) && $data['classifid'] > 0) {
                $check = $this->db->f("SELECT id FROM {$this->publicdb}.classification WHERE id = ?", [$data['classifid']]);
                if (!$check) {
                    throw new Exception("Invalid classification ID: {$data['classifid']}");
                }
            }

            // Default values
            $defaults = [
                'status' => 0,
                'created' => date('Y-m-d H:i:s'),
                'updated' => date('Y-m-d H:i:s'),
                'lang' => 'el',
                'view_count' => 0,
                'classifid' => 0
            ];

            $data = array_merge($defaults, $data);

            $allowedFields = ['type', 'userid', 'status', 'name', 'title',
                             'excerpt', 'img', 'published', 'created', 'updated',
                             'lang', 'view_count', 'classifid'];

            $fields = [];
            $placeholders = [];
            $params = [];

            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "`$field`";
                    $placeholders[] = ":$field";
                    $params[":$field"] = $data[$field];
                }
            }

            $sql = "INSERT INTO {$this->publicdb}.content (" . implode(', ', $fields) . ")
                    VALUES (" . implode(', ', $placeholders) . ")";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            return (int)$this->db->lastInsertId();

        } catch (Exception $e) {
            throw new Exception("Error creating content: " . $e->getMessage());
        }
    }

    /**
     * Delete content (soft delete by setting status to trash)
     *
     * @param int $id Content ID
     * @return bool
     */
    protected function deleteContent(int $id): bool
    {
        try {
            $sql = "UPDATE {$this->publicdb}.content SET status = 2 WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            return $stmt->execute();

        } catch (Exception $e) {
            throw new Exception("Error deleting content: " . $e->getMessage());
        }
    }

    /**
     * Get content by classification with hierarchy support
     *
     * @param int $classifid Classification ID
     * @param string $type Content type
     * @return array
     */
    protected function getContentByClassification(int $classifid, string $type = 'post'): array
    {
        try {
            $sql = "SELECT c.*, cl.name as classification_name
                    FROM {$this->publicdb}.content c
                    JOIN {$this->publicdb}.classification cl ON c.classifid = cl.id
                    WHERE c.type = :type
                      AND c.status = 1
                      AND c.classifid = :classifid
                    ORDER BY c.published DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':type', $type);
            $stmt->bindValue(':classifid', $classifid, \PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(\PDO::FETCH_ASSOC);

        } catch (Exception $e) {
            throw new Exception("Error getting content by classification: " . $e->getMessage());
        }
    }

    /**
     * Increment view count for content
     *
     * @param int $id Content ID
     * @return bool
     */
    protected function incrementViewCount(int $id): bool
    {
        try {
            $sql = "UPDATE {$this->publicdb}.content
                    SET view_count = view_count + 1
                    WHERE id = :id";

            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(':id', $id, \PDO::PARAM_INT);
            return $stmt->execute();

        } catch (Exception $e) {
            throw new Exception("Error incrementing view count: " . $e->getMessage());
        }
    }

}