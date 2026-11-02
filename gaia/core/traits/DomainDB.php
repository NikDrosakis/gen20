<?php
namespace Core\Traits;

use Exception;

trait DomainDB {
    /**
     * Database operations for domains.
     *
     * NOTE: Το create database + import template γίνεται και από το add.sh,
     * αλλά εδώ το έχουμε και ως μεμονωμένη λειτουργία (installDatabase)
     * για χρήση από το DomainManager.
     */

    const TEMPLATE_SQL = '/var/www/gs/public/admin/templates/simple/data/template.sql';
    const MARIADB_ROOT_PASSWORD = 'n130177!'; // ή από env

    // ============================================================
    // Install / Uninstall (ΝΕΑ — καλύπτουν το κενό)
    // ============================================================

    /**
     * Install database for a domain + import template.sql.
     * Ίδια λογική με το add.sh create_database().
     */
protected function installDatabase($domainName = ''): array {
    // Handle array (όπως το addHost)
    if (is_array($domainName)) {
        $domainName = $domainName['domain'] ?? $domainName['key'] ?? $domainName[0] ?? '';
    }
    $domain = $domainName ?: DOMAIN;

    if (!$domain) {
        throw new Exception("❌ Domain is required");
    }
        $dbName = $this->getDbName($domain);
        $results = [];

        // 1. Create database
        $createSql = "CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
        if (!$this->db->q($createSql)) {
            throw new Exception("❌ Failed to create database: $dbName");
        }
        $results['database'] = ['name' => $dbName, 'created' => true];

        // 2. Import template.sql (αν υπάρχει)
        $template = self::TEMPLATE_SQL;
        if (file_exists($template)) {
            $imported = $this->importSqlFile($dbName, $template);
            $results['template'] = [
                'file' => $template,
                'statements' => $imported['count'],
                'errors' => $imported['errors'],
            ];
        } else {
            $results['template'] = ['file' => $template, 'skipped' => 'not found'];
        }

        // 3. Update gen_admin.domain
        $this->db->q(
            "UPDATE gen_admin.domain SET maria = ?, maria_check = 1 WHERE name = ?",
            [$dbName, $domain]
        );

        return [
            'status' => 'success',
            'message' => "✅ Database $dbName installed for $domain",
            'data' => $results,
        ];
    }

    /**
     * Uninstall database for a domain (drop database + clear flags).
     */
    protected function uninstallDatabase(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;
        if (!$domain) {
            throw new Exception("❌ Domain is required");
        }

        $dbName = $this->getDbName($domain);

        // 1. Drop database
        if (!$this->db->q("DROP DATABASE IF EXISTS `$dbName`")) {
            throw new Exception("❌ Failed to drop database: $dbName");
        }

        // 2. Clear flags στο gen_admin.domain (κρατάμε την εγγραφή)
        $this->db->q(
            "UPDATE gen_admin.domain SET maria = NULL, maria_check = 0 WHERE name = ?",
            [$domain]
        );

        return [
            'status' => 'success',
            'message' => "✅ Database $dbName removed for $domain",
            'database' => $dbName,
        ];
    }

    // ============================================================
    // Add / Delete domain record
    // ============================================================

    /**
     * Add domain to gen_admin.domain + install database.
     * (Το add.sh κάνει το ίδιο — αυτό είναι για χρήση από PHP.)
     */
    protected function addDomainDB(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;

        // Check if domain already exists
        if ($this->db->f("SELECT id FROM gen_admin.domain WHERE name = ?", [$domain])) {
            throw new Exception("❌ Domain $domain already exists in database");
        }

        // Insert domain record
        $this->db->insert("gen_admin.domain", [
            'name' => $domain,
            'created' => date('Y-m-d H:i:s'),
            'status' => 'active',
        ]);

        // Install database + tables μέσω template
        $install = $this->installDatabase($domain);

        return [
            'status' => 'success',
            'message' => "✅ Domain $domain added to database",
            'install' => $install,
        ];
    }

    /**
     * Delete domain from gen_admin.domain (δεν κάνει drop database).
     */
    protected function delDomainDB(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;

        if (!$this->db->f("SELECT id FROM gen_admin.domain WHERE name = ?", [$domain])) {
            throw new Exception("❌ Domain $domain does not exist in database");
        }

        $this->db->delete("gen_admin.domain", ['name' => $domain]);

        return [
            'status' => 'success',
            'message' => "✅ Domain $domain removed from database",
        ];
    }

    // ============================================================
    // Check / Fix
    // ============================================================

    /**
     * Check domain database and fix missing tables.
     * Ελέγχει τη βάση gen_<domain> και τα tables της.
     */
    protected function checkfixDomainDB(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;
        $issues = [];
        $fixed = [];

        // 1. Έλεγξε αν υπάρχει το domain στο gen_admin.domain
        $domainRecord = $this->db->f("SELECT * FROM gen_admin.domain WHERE name = ?", [$domain]);
        if (!$domainRecord) {
            // Δημιούργησε την εγγραφή αν λείπει
            $this->db->insert("gen_admin.domain", [
                'name' => $domain,
                'created' => date('Y-m-d H:i:s'),
                'status' => 'active',
            ]);
            $fixed[] = "Created gen_admin.domain record for $domain";
            $domainRecord = $this->db->f("SELECT * FROM gen_admin.domain WHERE name = ?", [$domain]);
        }

        $dbName = $this->getDbName($domain);

        // 2. Έλεγξε αν υπάρχει η βάση
        $dbExists = $this->db->f("SHOW DATABASES LIKE ?", [$dbName]);
        if (!$dbExists) {
            $issues[] = "Database $dbName is missing.";
            // Δημιούργησε
            $this->installDatabase($domain);
            $fixed[] = "Created database $dbName from template";
        }

        // 3. Έλεγξε βασικά tables (μέσα στη βάση του domain)
        $requiredTables = ['user', 'setup', 'content', 'comment', 'classification'];
        $missingTables = [];
        foreach ($requiredTables as $table) {
            $tableExists = $this->db->f("SHOW TABLES FROM `$dbName` LIKE ?", [$table]);
            if (!$tableExists) {
                $missingTables[] = $table;
            }
        }

        if (!empty($missingTables)) {
            $issues[] = "Missing tables in $dbName: " . implode(', ', $missingTables);
            // Προσπάθησε να τα φτιάξεις από template
            $template = self::TEMPLATE_SQL;
            if (file_exists($template)) {
                $imported = $this->importSqlFile($dbName, $template, $missingTables);
                $fixed[] = "Re-imported template.sql (statements: {$imported['count']}, errors: {$imported['errors']})";
            } else {
                $issues[] = "Template not found: $template";
            }
        }

        // 4. Update flags
        $this->db->q(
            "UPDATE gen_admin.domain SET maria = ?, maria_check = 1 WHERE name = ?",
            [$dbName, $domain]
        );

        return [
            'status' => 'success',
            'message' => "✅ Database check completed for $domain",
            'database' => $dbName,
            'issues' => $issues,
            'fixed' => $fixed,
        ];
    }

    // ============================================================
    // Helpers
    // ============================================================

    /**
     * Get db name from domain (same logic as add.sh).
     * gen_example.com  →  gen_examplecom
     */
    private function getDbName(string $domain): string {
        $clean = str_replace(['.', '-'], '', strtolower($domain));
        return 'gen_' . $clean;
    }

    /**
     * Import SQL file into a database.
     * Same logic as add.sh: mariadb -D <db> < template.sql
     */
    private function importSqlFile(string $dbName, string $file, array $onlyTables = []): array {
        $content = file_get_contents($file);
        if ($content === false) {
            throw new Exception("❌ Cannot read $file");
        }

        $count = 0;
        $errors = 0;

        // Split by ; (same as add.sh logic)
        $statements = $this->splitSql($content);

        foreach ($statements as $stmt) {
            $stmt = trim($stmt);
            if (empty($stmt)) continue;

            // Αν φιλτράρουμε μόνο συγκεκριμένα tables
            if (!empty($onlyTables)) {
                $matches = false;
                foreach ($onlyTables as $table) {
                    if (preg_match('/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?' . preg_quote($table, '/') . '`?\b/i', $stmt)) {
                        $matches = true;
                        break;
                    }
                }
                if (!$matches) continue;
            }

            try {
                $this->db->q("USE `$dbName`");
                if ($this->db->q($stmt) === false) {
                    $errors++;
                } else {
                    $count++;
                }
            } catch (Exception $e) {
                $errors++;
                error_log("SQL import error in $dbName: " . $e->getMessage());
            }
        }

        return ['count' => $count, 'errors' => $errors];
    }

    /**
     * Split SQL content by ; respecting quotes/comments.
     * (Απλοποιημένη έκδοση — αρκεί για τα template files.)
     */
    private function splitSql(string $sql): array {
        $statements = [];
        $current = '';
        $inString = false;
        $stringChar = '';
        $inComment = false;
        $len = strlen($sql);

        for ($i = 0; $i < $len; $i++) {
            $char = $sql[$i];
            $next = $i + 1 < $len ? $sql[$i + 1] : '';

            if ($inComment) {
                if ($char === "\n") {
                    $inComment = false;
                }
                $current .= $char;
                continue;
            }

            if ($inString) {
                $current .= $char;
                if ($char === $stringChar && $sql[$i - 1] !== '\\') {
                    $inString = false;
                }
                continue;
            }

            // Σχόλια: -- ή #
            if (($char === '-' && $next === '-') || $char === '#') {
                $inComment = true;
                $current .= $char;
                continue;
            }

            // Strings
            if ($char === "'" || $char === '"') {
                $inString = true;
                $stringChar = $char;
                $current .= $char;
                continue;
            }

            // Statement terminator
            if ($char === ';') {
                $statements[] = $current;
                $current = '';
                continue;
            }

            $current .= $char;
        }

        if (trim($current) !== '') {
            $statements[] = $current;
        }

        return $statements;
    }
}