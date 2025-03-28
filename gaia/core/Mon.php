<?php
namespace Core;
use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\Driver\Exception\Exception;
/**
TODO Solve undefined MongoDB\Client
*/
class Mon {
    protected $uri="mongodb://dros:130177@127.0.0.1:27017/?authMechanism=SCRAM-SHA-1&authSource=admin";
    protected $client;
    protected $db;

    public function __construct(string $dbName) {
       try {
           $this->client = new Client($this->uri);
       } catch (Exception $e) {
           echo "Failed to connect to MongoDB: " . $e->getMessage();
       }
        $this->db = $this->client->selectDatabase($dbName);
    }
    // List all collections in the database
    protected function listCollections(): array {
        try {
            $collections = $this->db->listCollections();
            return array_map(fn($collection) => $collection->getName(), iterator_to_array($collections));
        } catch (Exception $e) {
            echo "MongoDB error occurred while listing collections: " . $e->getMessage();
            return [];
        }
    }
  // Fetch multiple documents
    protected function fa(string $collectionName, array $filter = []): array|bool
    {
        try {
            $collection = $this->db->selectCollection($collectionName);
            $cursor = $collection->find($filter);

            $documents = iterator_to_array($cursor);
            return !empty($documents) ? $documents : false;
        } catch (Exception $e) {
            echo "MongoDB error occurred: " . $e->getMessage();
            return false;
        }
    }

    // Fetch rows (one column) or key-value pairs (two columns)
    protected function fl(string|array $fields, string $collectionName, array $filter = []): array|bool
    {
        try {
            $projection = [];

            // Single field projection
            if (is_string($fields)) {
                $projection = [$fields => 1];
            }
            // Couple list projection (key-value pairs)
            elseif (is_array($fields) && count($fields) == 2) {
                $projection = [$fields[0] => 1, $fields[1] => 1];
            }

            $collection = $this->db->selectCollection($collectionName);
            $cursor = $collection->find($filter, ['projection' => $projection]);

            $result = [];
            if (is_string($fields)) {
                foreach ($cursor as $doc) {
                    $result[] = $doc[$fields];
                }
            } elseif (count($fields) == 2) {
                foreach ($cursor as $doc) {
                    $result[$doc[$fields[0]]] = $doc[$fields[1]];
                }
            }

            return !empty($result) ? $result : false;
        } catch (Exception $e) {
            echo "MongoDB error occurred: " . $e->getMessage();
            return false;
        }
    }
    // Insert a document into a collection
    protected function inse(string $collectionName, array $document): ObjectId|bool|null
    {
        try {
            $collection = $this->db->selectCollection($collectionName);
            $result = $collection->insertOne($document);

            // Return the inserted ID if successful
            return $result->getInsertedId() ?: true;
        } catch (Exception $e) {
            if ($e->getCode() == 11000) {
                echo "Duplicate entry found. Entry was not added.";
            } else {
                echo "MongoDB error occurred: " . $e->getMessage();
            }
            return false;
        }
    }

    // Update a document in a collection
    protected function q(string $collectionName, array $filter, array $update): bool
    {
        try {
            $collection = $this->db->selectCollection($collectionName);
            $result = $collection->updateOne($filter, ['$set' => $update]);

            return $result->getModifiedCount() > 0;
        } catch (Exception $e) {
            echo "MongoDB error occurred: " . $e->getMessage();
            return false;
        }
    }

    // Fetch a single document based on a query
    protected function f(string $collectionName, array $filter): array|bool
    {
        try {
            $collection = $this->db->selectCollection($collectionName);
            $result = $collection->findOne($filter);

            return $result ? $result->getArrayCopy() : false;
        } catch (Exception $e) {
            echo "MongoDB error occurred: " . $e->getMessage();
            return false;
        }
    }

}
