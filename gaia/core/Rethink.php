<?php
namespace Core;

trait RethinkDBTrait {

    // Declare the FFI property to hold the connection
    protected $ffi;

    // Method to initialize the FFI instance
    public function initializeRethinkDB($host, $port, $dbName, $tableName) {
        // Load the FFI interface for RethinkDB
        try {
            $this->ffi = FFI::cdef(
                "
                typedef struct RethinkDB RethinkDB;

                RethinkDB* rethinkdb_new(const char* host, int port, const char* dbName, const char* tableName);
                bool rethinkdb_connect(RethinkDB* rdb);
                bool rethinkdb_upsert_message(RethinkDB* rdb, const char* id, const char* jsonString);
                bool rethinkdb_delete_message(RethinkDB* rdb, const char* id);
                const char* rethinkdb_get_message(RethinkDB* rdb, const char* id);
                void rethinkdb_free(RethinkDB* rdb);
                ",
                "librethink.so"  // Replace with the actual library name or path
            );
        } catch (Exception $e) {
            throw new \Exception("Failed to load FFI definition: " . $e->getMessage());
        }

        // Establish connection using the provided parameters
        $rdb = $this->ffi->rethinkdb_new($host, $port, $dbName, $tableName);
        if (!$rdb) {
            throw new \Exception("Failed to create a RethinkDB instance");
        }

        if (!$this->ffi->rethinkdb_connect($rdb)) {
            throw new \Exception("Failed to connect to RethinkDB");
        }

        return $rdb;
    }

    // Perform Upsert (Insert or Update) message
    protected function upsertMessage($rdb, $id, $jsonString) {
        if (!$rdb) {
            throw new \Exception("No valid RethinkDB connection");
        }

        $result = $this->ffi->rethinkdb_upsert_message($rdb, $id, $jsonString);
        if (!$result) {
            throw new \Exception("Failed to upsert message");
        }

        return true;
    }

    // Delete Message by ID
    protected function deleteMessage($rdb, $id) {
        if (!$rdb) {
            throw new \Exception("No valid RethinkDB connection");
        }

        $result = $this->ffi->rethinkdb_delete_message($rdb, $id);
        if (!$result) {
            throw new \Exception("Failed to delete message");
        }

        return true;
    }

    // Get Message by ID
    protected function getMessage($rdb, $id) {
        if (!$rdb) {
            throw new \Exception("No valid RethinkDB connection");
        }

        $result = $this->ffi->rethinkdb_get_message($rdb, $id);
        if (!$result) {
            throw new \Exception("Failed to get message");
        }

        return FFI::string($result); // Convert result to PHP string
    }

    // Cleanup FFI connection
    public function freeConnection($rdb) {
        if ($rdb) {
            $this->ffi->rethinkdb_free($rdb);
        }
    }
}
?>
