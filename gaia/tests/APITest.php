<?php
namespace Core\Tests;

use PHPUnit\Framework\TestCase;
use Core\API;
use Core\Gaia;
use Core\Mari; // Your actual DB class

class APITest extends TestCase
{
    private $api;
    private $originalServer;

    protected function setUp(): void
    {
        // Backup original $_SERVER
        $this->originalServer = $_SERVER;

        // Initialize Gaia with real dependencies
        $this->api = new class() extends API {
            // Override constructor to skip real DB init
            public function __construct() {
                $this->db = new Mari(); // Your actual DB class
            }
        };

        // Set test environment
        $_SERVER = array_merge($_SERVER, [
            'REQUEST_METHOD' => 'GET',
            'HTTP_HOST' => 'test.local',
            'REQUEST_URI' => '/api/v1/maria/columns',
            'HTTPS' => 'on'
        ]);
    }

    protected function tearDown(): void
    {
        // Restore original $_SERVER
        $_SERVER = $this->originalServer;
    }

    public function testMariaColumnsEndpoint()
    {
        // Set specific request parameters
        $_GET = [
            'resource' => 'maria',
            'id' => 'columns',
            'expression' => 'gen_admin.systems'
        ];

        $response = $this->api->response();

        $this->assertEquals(200, $response['status']);
        $this->assertTrue($response['success']);
        $this->assertIsArray($response['data']);
    }

    public function testInvalidResourceHandling()
    {
        $_GET = ['resource' => 'invalid'];

        $response = $this->api->response();

        $this->assertEquals(404, $response['status']);
        $this->assertStringContainsString('not found', $response['error']);
    }

    public function testPostRequestWithData()
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $_GET = ['resource' => 'maria', 'id' => 'insert'];
        $_POST = ['name' => 'test_item'];

        $response = $this->api->response();

        $this->assertEquals(200, $response['status']);
        $this->assertTrue($response['success']);
    }

    // Test protected methods via reflection
    public function testInputSanitization()
    {
        $method = new \ReflectionMethod($this->api, 'sanitizeInput');
        $method->setAccessible(true);

        $dirtyInput = "  test<script>alert(1)</script>  ";
        $clean = $method->invoke($this->api, $dirtyInput);

        $this->assertEquals('test', $clean);
    }
}