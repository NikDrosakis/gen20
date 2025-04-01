<?php
namespace Core;
use Exception;

trait DomainDB {
    /**
     * Database operations for domains
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
            'status' => 'active'
        ]);

        // Create domain-specific tables
        $this->createDomainTables($domain);

        return [
            'status' => 'success',
            'message' => "✅ Domain $domain added to database"
        ];
    }

    protected function delDomainDB(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;

        // Check if domain exists
        if (!$this->db->f("SELECT id FROM gen_admin.domain WHERE name = ?", [$domain])) {
            throw new Exception("❌ Domain $domain does not exist in database");
        }

        // Delete domain record
        $this->db->delete("gen_admin.domain", ['name' => $domain]);

        // Drop domain-specific tables (optional)
        // $this->dropDomainTables($domain);

        return [
            'status' => 'success',
            'message' => "✅ Domain $domain removed from database"
        ];
    }

    protected function checkfixDomainDB(string $domainName = ''): array {
        $domain = $domainName ?: DOMAIN;
        $issues = [];
        $fixed = [];

        // Check if domain exists
        $domainRecord = $this->db->f("SELECT * FROM gen_admin.domain WHERE name = ?", [$domain]);
        if (!$domainRecord) {
            throw new Exception("❌ Domain $domain does not exist in database");
        }

        // Check required tables exist
        $requiredTables = ['users', 'settings', 'content'];
        foreach ($requiredTables as $table) {
            $fullTableName = "{$domain}_$table";
            if (!$this->db->tableExists($fullTableName)) {
                $this->createTable($fullTableName);
                $fixed[] = "Created missing table: $fullTableName";
            }
        }

        return [
            'status' => 'success',
            'message' => "✅ Database check completed for $domain",
            'issues' => $issues,
            'fixed' => $fixed
        ];
    }

    private function createDomainTables($domain) {
        // Create standard tables for the domain
        $tables = [
            'users' => "CREATE TABLE IF NOT EXISTS {$domain}_users (...)",
            'settings' => "CREATE TABLE IF NOT EXISTS {$domain}_settings (...)",
            // etc...
        ];

        foreach ($tables as $sql) {
            $this->db->query($sql);
        }
    }
}