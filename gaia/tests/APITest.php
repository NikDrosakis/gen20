<?php
namespace Core\Tests;

use PHPUnit\Framework\TestCase;
use Core\API;
use ReflectionMethod;

class APITest extends TestCase
{
    protected $api;

    protected function setUp(): void
    {
        // Initialize the API class
        $this->api = new API();
    }

    /**
     * Test the sanitizeInput method.
     */
    public function testSanitizeInput()
    {
        $input = '<script>alert("XSS");</script>';
        $sanitized = $this->api->sanitizeInput($input);
        $this->assertEquals('&lt;script&gt;alert(&quot;XSS&quot;);&lt;/script&gt;', $sanitized);

        $arrayInput = ['<script>alert("XSS");</script>', 'safe input'];
        $sanitizedArray = $this->api->sanitizeInput($arrayInput);
        $this->assertEquals(
            ['&lt;script&gt;alert(&quot;XSS&quot;);&lt;/script&gt;', 'safe input'],
            $sanitizedArray
        );
    }

    /**
     * Test the parseRequest method for GET requests.
     */
    public function testParseGetRequest()
    {
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET = ['resource' => 'test', 'param' => 'value'];

        $request = $this->api->parseRequest();
        $this->assertEquals(['resource' => 'test', 'param' => 'value'], $request);
    }

    /**
     * Test the parseRequest method for POST requests.
     */
    public function testParsePostRequest()
    {
        $_SERVER['REQUEST_METHOD'] = 'POST';
        $rawInput = json_encode(['key' => 'value']);
        file_put_contents('php://input', $rawInput);

        $request = $this->api->parseRequest();
        $this->assertEquals(['key' => 'value'], $request);
    }

    /**
     * Test the executeDynamicMethod method.
     */
    public function testExecuteDynamicMethod()
    {
        // Use reflection to test a protected method
        $method = new ReflectionMethod(API::class, 'executeDynamicMethod');
        $method->setAccessible(true);

        $request = ['param' => 'value'];
        $result = $method->invokeArgs($this->api, ['testMethod', $request]);

        $this->assertEquals(403, $result['status']);
        $this->assertEquals('METHOD_NOT_FOUND', $result['code']);
    }

    /**
     * Test the executeLocalMethod method.
     */
    public function testExecuteLocalMethod()
    {
        // Use reflection to test a protected method
        $method = new ReflectionMethod(API::class, 'executeLocalMethod');
        $method->setAccessible(true);

        $request = ['param' => 'value'];
        $result = $method->invokeArgs($this->api, [$request]);

        $this->assertEquals(203, $result['status']);
        $this->assertEquals('LOCAL', $result['code']);
    }

    /**
     * Test the executeMariaMethod method.
     */
    public function testExecuteMariaMethod()
    {
        // Use reflection to test a protected method
        $method = new ReflectionMethod(API::class, 'executeMariaMethod');
        $method->setAccessible(true);

        $request = ['param' => 'value'];
        $result = $method->invokeArgs($this->api, [$request]);

        $this->assertEquals(419, $result['status']);
        $this->assertEquals('M2', $result['code']);
    }

    /**
     * Test the executeBinMethod method.
     */
    public function testExecuteBinMethod()
    {
        // Use reflection to test a protected method
        $method = new ReflectionMethod(API::class, 'executeBinMethod');
        $method->setAccessible(true);

        $request = [];
        $result = $method->invokeArgs($this->api, [$request]);

        $this->assertEquals(203, $result['status']);
        $this->assertEquals('D2', $result['code']);
    }

    /**
     * Test the executeAPI method.
     */
    public function testExecuteAPI()
    {
        // Use reflection to test a protected method
        $method = new ReflectionMethod(API::class, 'executeAPI');
        $method->setAccessible(true);

        $request = ['resource' => 'nonexistent'];
        $result = $method->invokeArgs($this->api, [$request]);

        $this->assertEquals(404, $result['status']);
        $this->assertEquals('Z', $result['code']);
    }
}