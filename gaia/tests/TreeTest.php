<?php
namespace Core\Tests;

use PHPUnit\Framework\TestCase;
use Core\Traits\Tree;

class TreeTest extends TestCase
{
    protected $treeInstance;

    protected function setUp(): void
    {
        $this->treeInstance = new class() {
            use Tree;
            public $db;
        };

        // Create a mock that matches your actual DB class structure
        $this->treeInstance->db = $this->createMock(\Core\Database\MariaDB::class); // Adjust to your real DB class

        // Configure mock for show() method
        $this->treeInstance->db->method('show')
             ->willReturnCallback(function($type, $db = null) {
                 return $type === 'databases'
                     ? ['gen_localhost', 'gen_vivalibrocom']
                     : [];
             });
    }

    // ... keep your test methods ...
}