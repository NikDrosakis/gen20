<?php
namespace Core;
use Illuminate\Support\Facades\DB;
use RethinkDB\RethinkDB as r;

trait Rethink {

    // Declare the FFI property to hold the connection
    protected $ffi;
    protected $rethink_conn;

    // Initialize connection to RethinkDB
    protected function connectRethinkDB($host = 'localhost', $port = 28015, $dbName = 'gen20') {
        try {
            $this->rethink_conn = r::connect([
                'host' => $host,
                'port' => $port,
                'db' => $dbName
            ]);
        } catch (\Exception $e) {
            throw new \Exception("Failed to connect to RethinkDB: " . $e->getMessage());
        }
    }
    // Create a table if it doesn’t exist
    protected function createTable($dbName, $tableName) {
        if (!in_array($tableName, r\db($dbName)->tableList()->run($this->rethink_conn))) {
            r\db($dbName)->tableCreate($tableName)->run($this->rethink_conn);
        }
    }

    // Insert data into table
    protected function insertMessage($dbName, $tableName, $data) {
        return r\db($dbName)->table($tableName)->insert($data)->run($this->rethink_conn);
    }

    // Retrieve message by ID
    protected function getMessage($dbName, $tableName, $id) {
        return r\db($dbName)->table($tableName)->get($id)->run($this->rethink_conn);
    }

    // Delete message by ID
    protected function deleteMessage($dbName, $tableName, $id) {
        return r\db($dbName)->table($tableName)->get($id)->delete()->run($this->rethink_conn);
    }

    // Migrate MySQL table `actiongrp_chat` to RethinkDB
 // Migrate MySQL table `actiongrp_chat` to RethinkDB
    protected function migrateActionChat($mysqlTable = 'gen_admin.actiongrp_chat', $rethinkTable = 'actiongrp_chat') {
        try {
            // Connect to RethinkDB
            $this->connectRethinkDB();
            if (!$this->rethink_conn) {
                throw new Exception("RethinkDB connection failed.");
            }

            // Ensure RethinkDB table exists
            $dbName = 'chat';
            if (!in_array($rethinkTable, r\db($dbName)->tableList()->run($this->rethink_conn))) {
                r\db($dbName)->tableCreate($rethinkTable)->run($this->rethink_conn);
                echo "✅ Created RethinkDB table: $rethinkTable\n";
            }

            // Fetch data from MySQL
            try {
                $rows = DB::connection('mysql')->select("SELECT * FROM $mysqlTable");
            } catch (Exception $e) {
                throw new Exception("MySQL query error: " . $e->getMessage());
            }

            // Check if data exists
            if (empty($rows)) {
                echo "⚠️ No records found in $mysqlTable. Nothing to migrate.\n";
                return;
            }

            // Begin transaction simulation (RethinkDB doesn't support transactions natively)
            echo "🔄 Starting migration of " . count($rows) . " records...\n";

            foreach ($rows as $row) {
                try {
                    // Validate row before inserting
                    if (!isset($row->id, $row->fromid, $row->toid, $row->text, $row->created)) {
                        throw new Exception("Invalid row structure: " . json_encode($row));
                    }

                    // Insert record into RethinkDB
                    r\db($dbName)->table($rethinkTable)->insert((array) $row)->run($this->rethink_conn);
                } catch (Exception $e) {
                    echo "❌ Failed to insert row (ID: {$row->id}): " . $e->getMessage() . "\n";
                }
            }

            echo "✅ Migration completed successfully!\n";

        } catch (Exception $e) {
            echo "❌ Migration error: " . $e->getMessage() . "\n";
        }
    }


    // Close connection
    protected function closeConnection() {
        if ($this->rethink_conn) {
            $this->rethink_conn->close();
        }
    }

}
?>
