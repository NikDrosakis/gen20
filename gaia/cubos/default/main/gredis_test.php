<?php
namespace Core;
use Redis;
use RedisException;

// ... (Your Gredis class from previous examples) ...
// Test the RediSearch integration
$redis = new Gredis(); // Create a Gredis instance
if ($redis->redis_running) { // Check if Redis is connected
    // 1. Create an index
    $indexName = 'myTestIndex';
    $schema = ['title', 'TEXT', 'WEIGHT', 5, 'content', 'TEXT', 'tags', 'TAG'];
    if ($redis->createIndex($indexName, $schema)) {
        echo "Index '$indexName' created successfully!\n";
    } else {
        echo "Error creating index '$indexName'\n";
    }

    // 2. Add some documents
    $doc1 = ['title' => 'Redis Search Test', 'content' => 'Testing RediSearch with PHP', 'tags' => 'redis,search,php,test'];
    $doc2 = ['title' => 'Another Test Document', 'content' => 'More test data for RediSearch', 'tags' => 'test,document,redisearch'];

    $redis->hMSet('doc1', $doc1);  // Use hMSet to add the document as a hash
    $redis->hMSet('doc2', $doc2);

    // 3. Search the index
    $query = 'test';
    $searchResults = $redis->search($indexName, $query);

    if ($searchResults) {
        echo "Search results for '$query':\n";
        print_r($searchResults);

        // Example: Accessing specific fields from the results
        $numResults = $searchResults[0];
        for ($i = 1; $i <= $numResults; $i++) {
          $docId = $searchResults[($i * 2) -1]; // document ID
           $fields = $searchResults[$i * 2]; //fields array
           echo "Document ID: " . $docId . "\n";
            echo "Title: " . $fields['title'] . "\n";
           // Access other fields as needed
        }


    } else {
        echo "No results found for '$query'\n";
    }


    // 4. Drop the index (optional cleanup)
    $redis->rawCommand('FT.DROPINDEX', $indexName);
    echo "Index '$indexName' dropped.\n";

} else {
    echo "Redis connection failed.\n";
}