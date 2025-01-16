<?php
/**
DOC
====
introducing Solarium

TODO
====
v.1 start using in server render
*/
namespace Core;
use Solarium\Client;
use Solarium\Exception\HttpException;
/**
correct with solr
*/
class GSolr {

    protected $client;
    protected $core;
    protected $endpoint='http://localhost:8983/solr';

    public function __construct(string $core) {
        $this->core = $core;
        $this->client = new Client();
        $this->client->setEndpoint($this->endpoint . $core);
    }

    // Index a document
    public function indexDocument(array $data): bool {
        try {
            $update = $this->client->createUpdate();
            $doc = $update->createDocument($data);
            $update->addDocument($doc);
            $update->addCommit();
            $this->client->update($update);
            return true;
        } catch (HttpException $e) {
            echo "Error indexing document: " . $e->getMessage();
            return false;
        }
    }

    // Search for documents
    public function search(string $query): array {
        try {
            $select = $this->client->createSelect();
            $select->setQuery($query);
            $resultset = $this->client->select($select);
            return $resultset->getDocuments();
        } catch (HttpException $e) {
            echo "Error searching documents: " . $e->getMessage();
            return [];
        }
    }

    // List collections (cores)
    public function listCollections(): array {
        // This assumes you have a proper way to get the list of collections from Solr
        // You may need to implement this based on your Solr setup
        return []; // Placeholder
    }

    // Delete a document by ID
    public function deleteDocument(string $id): bool {
        try {
            $update = $this->client->createUpdate();
            $update->addDeleteById($id);
            $update->addCommit();
            $this->client->update($update);
            return true;
        } catch (HttpException $e) {
            echo "Error deleting document: " . $e->getMessage();
            return false;
        }
    }

    // Other useful methods can be added as needed
}
