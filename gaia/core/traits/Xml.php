<?php
namespace Core\Traits;
use DOMDocument;
use DOMXPath;
use Exception;

trait Xml {

  /**
   * Process ClinVar XML file and import to MariaDB
   *
   * @param string $xmlPath Path to XML file (supports .gz)
   * @param string $name Name identifier for the table (c_clinvar_{name})
   * @param bool $dropExisting Drop existing table before creating
   * @return array Result with stats
   */
  protected function xml2Maria($params): array {
      // Extract parameters with defaults
      $xmlPath = $params['xmlPath'] ?? '';
      $name = $params['name'] ?? 'clinvar_default';
      $dropExisting = $params['dropExisting'] ?? false;

      // Validate file exists
      if (!file_exists($xmlPath)) {
          throw new Exception("XML file not found: {$xmlPath}");
      }

      // Load XML
      $dom = $this->loadXmlFile($xmlPath);

      // Check schema (basic validation)
      $root = $dom->documentElement;
      $rootName = $root->nodeName;

      if ($rootName !== 'ClinVarSet') {
          throw new Exception("Invalid XML root. Expected 'ClinVarSet', got '{$rootName}'");
      }

      // Define table name
      $tableName = "c_clinvar_" . $this->sanitizeColumnName($name);
      $fullTableName = "{$this->publicdb}.{$tableName}";

      // Drop table if exists and requested
      if ($dropExisting) {
          $this->db->q("DROP TABLE IF EXISTS {$fullTableName}");
      }

      // Generate schema from first record
      $firstRecord = $this->getFirstRecord($dom);
      $flatRecord = $this->flattenRecord($firstRecord);
      $schema = $this->generateSchema($flatRecord, $tableName);

      // Create table
      $this->db->createTable($fullTableName, $schema);

      // Extract all records
      $records = $this->extractAllRecords($dom);
      $total = count($records);
      $inserted = 0;
      $errors = [];

      // Insert records in batches
      $batchSize = 100;
      $batch = [];

      foreach ($records as $index => $record) {
          try {
              $flatRecord = $this->flattenRecord($record);
              $flatRecord = $this->cleanRecordData($flatRecord);
              $batch[] = $flatRecord;

              // Insert batch when size reached
              if (count($batch) >= $batchSize || $index === $total - 1) {
                  $this->insertBatch($fullTableName, $batch);
                  $inserted += count($batch);
                  $batch = [];
              }
          } catch (Exception $e) {
              $errors[] = [
                  'record_index' => $index,
                  'error' => $e->getMessage()
              ];
          }
      }

      return [
          'success' => true,
          'table' => $fullTableName,
          'total_records' => $total,
          'inserted' => $inserted,
          'errors' => $errors,
          'schema' => $schema
      ];
  }

  /**
   * Generate MySQL schema from flattened record
   */
  protected function generateSchema(array $flatRecord, string $tableName): array {
      $schema = [];
      $schema[] = "`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY";

      foreach ($flatRecord as $field => $value) {
          $columnName = $this->sanitizeColumnName($field);
          $columnType = $this->detectColumnType($value);
          $schema[] = "`$columnName` $columnType NULL";
      }

      $schema[] = "`created_at` timestamp NULL DEFAULT current_timestamp()";
      $schema[] = "`updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()";

      return $schema;
  }

  /**
   * Create table using db->create_table method
   */
  protected function createTable(string $fullTableName, array $schema): bool {
      $sql = "CREATE TABLE `{$fullTableName}` (\n";
      $sql .= implode(",\n", $schema);
      $sql .= "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

      try {
          $this->db->exec($sql);
          echo "Table `{$fullTableName}` created successfully.\n";
          return true;
      } catch (PDOException $e) {
          throw new Exception("Error creating table: " . $e->getMessage());
      }
  }

  /**
   * Insert batch of records using prepared statement
   */
  protected function insertBatch(string $fullTableName, array $batch): void {
      if (empty($batch)) {
          return;
      }

      // Get all unique keys from batch
      $keys = array_keys($batch[0]);
      $columns = array_map(function($key) {
          return "`{$key}`";
      }, $keys);

      // Build placeholders
      $placeholders = '(' . implode(', ', array_fill(0, count($keys), '?')) . ')';
      $valuesPlaceholder = implode(', ', array_fill(0, count($batch), $placeholders));

      // Flatten values
      $values = [];
      foreach ($batch as $record) {
          foreach ($keys as $key) {
              $values[] = $record[$key] ?? null;
          }
      }

      $sql = "INSERT INTO `{$fullTableName}` (" . implode(', ', $columns) . ")
              VALUES {$valuesPlaceholder}";

      $this->db->execPrepared($sql, $values);
  }

  /**
   * Clean record data for insertion (limit string lengths, escape, etc.)
   */
  protected function cleanRecordData(array $record): array {
      $cleaned = [];

      foreach ($record as $key => $value) {
          if ($value === null || $value === '') {
              $cleaned[$key] = null;
          } elseif (is_string($value)) {
              // Trim long strings
              if (strlen($value) > 65535) {
                  $value = substr($value, 0, 65535);
              }
              $cleaned[$key] = $value;
          } elseif (is_array($value)) {
              // Store arrays as JSON
              $cleaned[$key] = json_encode($value);
          } else {
              $cleaned[$key] = $value;
          }
      }

      return $cleaned;
  }

  /**
   * Alternative: Stream large XML files (memory efficient)
   */
  protected function xml2MariaStream(string $xmlPath, string $name, callable $onProgress = null): array {
      $tableName = "c_clinvar_" . $this->sanitizeColumnName($name);
      $fullTableName = "{$this->publicdb}.{$tableName}";

      // First pass: get schema from first record
      $dom = $this->loadXmlFile($xmlPath);
      $firstRecord = $this->getFirstRecord($dom);
      $flatRecord = $this->flattenRecord($firstRecord);
      $schema = $this->generateSchema($flatRecord, $tableName);

      // Create table
      $this->createTable($fullTableName, $schema);

      // Second pass: stream records
      $count = 0;
      $batch = [];
      $batchSize = 100;

      $this->streamRecords($xmlPath, function($record) use ($fullTableName, &$count, &$batch, $batchSize, $onProgress) {
          $flatRecord = $this->flattenRecord($record);
          $flatRecord = $this->cleanRecordData($flatRecord);
          $batch[] = $flatRecord;
          $count++;

          if (count($batch) >= $batchSize) {
              $this->insertBatch($fullTableName, $batch);
              $batch = [];

              if ($onProgress) {
                  $onProgress($count);
              }
          }
      });

      // Insert remaining batch
      if (!empty($batch)) {
          $this->insertBatch($fullTableName, $batch);
      }

      return [
          'success' => true,
          'table' => $fullTableName,
          'total_records' => $count
      ];
  }

  /**
   * Helper: Get table info
   */
  protected function getClinvarTableInfo(string $name): array {
      $tableName = "c_clinvar_" . $this->sanitizeColumnName($name);
      $fullTableName = "{$this->publicdb}.{$tableName}";

      try {
          $result = $this->db->f("SELECT COUNT(*) as total FROM {$fullTableName}");
          return [
              'exists' => true,
              'table' => $fullTableName,
              'records' => $result['total'] ?? 0
          ];
      } catch (Exception $e) {
          return [
              'exists' => false,
              'table' => $fullTableName,
              'records' => 0
          ];
      }
     }

    /**
     * Load and parse XML file (supports gzipped files)
     */
    protected function loadXmlFile(string $filePath): DOMDocument {
        $dom = new DOMDocument();

        // Check if file is gzipped
        if (pathinfo($filePath, PATHINFO_EXTENSION) === 'gz') {
            $content = file_get_contents('compress.zlib://' . $filePath);
            $dom->loadXML($content);
        } else {
            $dom->load($filePath);
        }

        return $dom;
    }

    /**
     * Get root element info
     */
    protected function getXmlInfo(DOMDocument $dom): array {
        $root = $dom->documentElement;

        return [
            'root_name' => $root->nodeName,
            'record_count' => $this->countRecords($dom),
            'namespaces' => $this->extractNamespaces($dom)
        ];
    }

    /**
     * Count records in XML (specific to ClinVar structure)
     */
    protected function countRecords(DOMDocument $dom): int {
        $xpath = new DOMXPath($dom);

        // Try different possible record paths
        $paths = [
            '/ClinVarSet/ClinVarVariationRelease',
            '/ClinVarSet/ClinVarSet',
            '/ClinVarSet/Record',
            '//VariationArchive',
            '//*[local-name()="ClinVarSet"]/*[local-name()="ClinVarVariationRelease"]'
        ];

        foreach ($paths as $path) {
            $nodes = $xpath->query($path);
            if ($nodes->length > 0) {
                return $nodes->length;
            }
        }

        return 0;
    }

    /**
     * Extract first record to determine schema
     */
    protected function getFirstRecord(DOMDocument $dom): array {
        $xpath = new DOMXPath($dom);

        // Register namespaces if present
        $this->registerNamespaces($xpath, $dom);

        // Find first record
        $paths = [
            '//ClinVarVariationRelease',
            '//ClinVarSet',
            '//Record',
            '//VariationArchive'
        ];

        foreach ($paths as $path) {
            $nodes = $xpath->query($path);
            if ($nodes->length > 0) {
                return $this->domNodeToArray($nodes->item(0));
            }
        }

        return [];
    }

    /**
     * Extract all records from XML
     */
    protected function extractAllRecords(DOMDocument $dom): array {
        $records = [];
        $xpath = new DOMXPath($dom);
        $this->registerNamespaces($xpath, $dom);

        // Find all record nodes
        $paths = [
            '//ClinVarVariationRelease',
            '//ClinVarSet',
            '//Record',
            '//VariationArchive'
        ];

        foreach ($paths as $path) {
            $nodes = $xpath->query($path);
            if ($nodes->length > 0) {
                foreach ($nodes as $node) {
                    $records[] = $this->domNodeToArray($node);
                }
                break;
            }
        }

        return $records;
    }

    /**
     * Stream records for large files (memory efficient)
     */
    protected function streamRecords(string $filePath, callable $callback): int {
        $count = 0;
        $reader = new XMLReader();

        // Open gzipped file if needed
        if (pathinfo($filePath, PATHINFO_EXTENSION) === 'gz') {
            $reader->open('compress.zlib://' . $filePath);
        } else {
            $reader->open($filePath);
        }

        // Move to first element
        while ($reader->read()) {
            if ($reader->nodeType == XMLReader::ELEMENT &&
                in_array($reader->name, ['ClinVarVariationRelease', 'ClinVarSet', 'Record'])) {

                // Parse the node
                $dom = new DOMDocument();
                $node = $reader->expand();
                $dom->appendChild($dom->importNode($node, true));

                // Convert to array and callback
                $record = $this->domNodeToArray($dom);
                $callback($record);
                $count++;
            }
        }

        $reader->close();
        return $count;
    }

    /**
     * Generate MySQL schema from XML structure
     */
    protected function generateSchemaFromXml(DOMDocument $dom, string $tableName): array {
        $firstRecord = $this->getFirstRecord($dom);
        $flatRecord = $this->flattenRecord($firstRecord);

        $schema = [];
        $schema[] = "`id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY";

        foreach ($flatRecord as $field => $value) {
            $columnName = $this->sanitizeColumnName($field);
            $columnType = $this->detectColumnType($value);
            $schema[] = "`$columnName` $columnType NULL";
        }

        $schema[] = "`created_at` timestamp NULL DEFAULT current_timestamp()";
        $schema[] = "`updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()";

        return $schema;
    }

    /**
     * Flatten nested XML structure
     */
    protected function flattenRecord(array $record, string $prefix = ''): array {
        $result = [];

        foreach ($record as $key => $value) {
            $newKey = $prefix . $key;

            if (is_array($value)) {
                // Check if it's a list of similar items
                if (isset($value[0]) && is_array($value[0])) {
                    // Store as JSON for complex nested structures
                    $result[$newKey] = json_encode($value);
                } else {
                    $result = array_merge($result, $this->flattenRecord($value, $newKey . '_'));
                }
            } else {
                $result[$newKey] = $value;
            }
        }

        return $result;
    }

    /**
     * Convert DOM node to array
     */
    private function domNodeToArray($node): array {
        $result = [];

        if ($node instanceof DOMDocument) {
            $node = $node->documentElement;
        }

        // Check for attributes
        if ($node->hasAttributes()) {
            foreach ($node->attributes as $attr) {
                $result['@' . $attr->name] = $attr->value;
            }
        }

        // Process children
        if ($node->hasChildNodes()) {
            $children = $node->childNodes;

            foreach ($children as $child) {
                if ($child->nodeType == XML_ELEMENT_NODE) {
                    $childName = $child->nodeName;
                    $childValue = $this->domNodeToArray($child);

                    // Handle multiple children with same name
                    if (isset($result[$childName])) {
                        if (!is_array($result[$childName]) || !isset($result[$childName][0])) {
                            $result[$childName] = [$result[$childName]];
                        }
                        $result[$childName][] = $childValue;
                    } else {
                        $result[$childName] = $childValue;
                    }
                } elseif ($child->nodeType == XML_TEXT_NODE && trim($child->nodeValue) !== '') {
                    $textValue = trim($child->nodeValue);

                    // If no elements were found, set the text as the value
                    if (empty($result)) {
                        return $textValue;
                    }

                    // Otherwise, store as text
                    $result['#text'] = $textValue;
                }
            }
        }

        return $result;
    }

    /**
     * Register XML namespaces
     */
    private function registerNamespaces(DOMXPath $xpath, DOMDocument $dom): void {
        $xpath->registerNamespace('xs', 'http://www.w3.org/2001/XMLSchema');
        $xpath->registerNamespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance');

        // Extract custom namespaces from document
        $nsNodes = $xpath->query('//namespace::*');
        foreach ($nsNodes as $ns) {
            if ($ns->prefix && $ns->nodeValue) {
                try {
                    $xpath->registerNamespace($ns->prefix, $ns->nodeValue);
                } catch (Exception $e) {
                    // Skip invalid namespaces
                }
            }
        }
    }

    /**
     * Extract namespaces from document
     */
    private function extractNamespaces(DOMDocument $dom): array {
        $xpath = new DOMXPath($dom);
        $namespaces = [];

        $nsNodes = $xpath->query('//namespace::*');
        foreach ($nsNodes as $ns) {
            if ($ns->prefix) {
                $namespaces[$ns->prefix] = $ns->nodeValue;
            }
        }

        return $namespaces;
    }

    /**
     * Sanitize column name for MySQL
     */
    private function sanitizeColumnName(string $name): string {
        // Remove special characters and limit length
        $name = preg_replace('/[^a-zA-Z0-9_]/', '_', $name);
        $name = preg_replace('/__+/', '_', $name);
        $name = trim($name, '_');
        $name = substr($name, 0, 64); // MySQL max column name length

        return strtolower($name);
    }

    /**
     * Detect MySQL column type from value
     */
    private function detectColumnType($value): string {
        if ($value === null || $value === '') {
            return 'TEXT';
        }

        if (is_numeric($value)) {
            if (strpos($value, '.') !== false) {
                return 'DECIMAL(20,6)';
            }
            if ($value > 2147483647) {
                return 'BIGINT(20)';
            }
            return 'INT(11)';
        }

        if (strtotime($value) !== false) {
            return 'DATETIME';
        }

        $length = strlen($value);
        if ($length > 10000) {
            return 'LONGTEXT';
        } elseif ($length > 255) {
            return 'TEXT';
        }

        return "VARCHAR(255)";
    }
}