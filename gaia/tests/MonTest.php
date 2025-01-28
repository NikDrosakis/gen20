<?php

use PHPUnit\Framework\TestCase;
use Core\Mon;

class MonTest extends TestCase
{
    private Mon $mon;

    protected function setUp(): void
    {
        // Initialize the Mon class before each test
        $this->mon = new Mon('test_db'); // Use a test database
    }

    public function testInsert()
    {
        $result = $this->mon->inse('test_collection', ['name' => 'Test Document']);
        $this->assertInstanceOf(\MongoDB\BSON\ObjectId::class, $result);
    }

    public function testFind()
    {
        // First insert a document
        $insertedId = $this->mon->inse('test_collection', ['name' => 'Find Me']);

        // Now find the document
        $document = $this->mon->f('test_collection', ['_id' => $insertedId]);

        $this->assertIsArray($document);
        $this->assertEquals('Find Me', $document['name']);
    }

    public function testUpdate()
    {
        $insertedId = $this->mon->inse('test_collection', ['name' => 'Old Name']);
        $updated = $this->mon->q('test_collection', ['_id' => $insertedId], ['name' => 'Updated Name']);

        $this->assertTrue($updated);

        // Check if the update was successful
        $document = $this->mon->f('test_collection', ['_id' => $insertedId]);
        $this->assertEquals('Updated Name', $document['name']);
    }

    public function testFetchAll()
    {
        $this->mon->inse('test_collection', ['name' => 'Doc 1']);
        $this->mon->inse('test_collection', ['name' => 'Doc 2']);

        $documents = $this->mon->fa('test_collection');

        $this->assertCount(2, $documents);
    }

    protected function tearDown(): void
    {
        // Clean up after tests
        $this->mon->q('test_collection', []);
    }
}

