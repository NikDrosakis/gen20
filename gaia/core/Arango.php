<?php
namespace Core;

use ArangoDBClient\Connection;
use ArangoDBClient\Collection;
use ArangoDBClient\Document;
use ArangoDBClient\Database;
use ArangoDBClient\Cursor;
use ArangoDBClient\Key;
use ArangoDBClient\Exception;

/**
 * Trait for basic CRUD operations in ArangoDB
 */
trait Arango
{
    protected $connection;
    protected $database;

    public function __construct()
    {
        $this->connection = new Connection([
            'endpoint' => 'tcp://127.0.0.1:8529', // ArangoDB server URL
            'authUser' => 'root',                // Database username
            'authPasswd' => 'n130177!',          // Database password
            'database' => '_system',             // Database name
        ]);
        $this->database = new Database($this->connection);
    }

    /**
     * Create a new document in the specified collection.
     *
     * @param string $collectionName The collection name
     * @param array $data The data to insert
     * @return mixed The document object or false on failure
     */
    public function createDocument(string $collectionName, array $data)
    {
        try {
            $collection = new Collection($this->connection);
            $document = new Document();
            $document->set($data);
            $collection->insert($document);
            return $document;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Read a document by its key.
     *
     * @param string $collectionName The collection name
     * @param string $key The document key
     * @return mixed The document object or false if not found
     */
    public function readDocument(string $collectionName, string $key)
    {
        try {
            $collection = new Collection($this->connection);
            $document = $collection->getDocument($key);
            return $document;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Update an existing document by key.
     *
     * @param string $collectionName The collection name
     * @param string $key The document key
     * @param array $data The data to update
     * @return bool True on success, false on failure
     */
    public function updateDocument(string $collectionName, string $key, array $data)
    {
        try {
            $collection = new Collection($this->connection);
            $document = $collection->getDocument($key);
            $document->set($data);
            $collection->update($document);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Delete a document by key.
     *
     * @param string $collectionName The collection name
     * @param string $key The document key
     * @return bool True on success, false on failure
     */
    public function deleteDocument(string $collectionName, string $key)
    {
        try {
            $collection = new Collection($this->connection);
            $document = $collection->getDocument($key);
            $collection->delete($document);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Execute a custom AQL query.
     *
     * @param string $query The AQL query
     * @param array $bindVars The bind variables
     * @return Cursor The query result cursor
     */
    public function executeQuery(string $query, array $bindVars = [])
    {
        try {
            $cursor = $this->connection->executeQuery($query, $bindVars);
            return $cursor;
        } catch (Exception $e) {
            return false;
        }
    }
}
