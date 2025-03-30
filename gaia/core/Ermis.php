<?php
namespace Core;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

/**
 * Ermis Trait for connecting to WebSocket API
 use maria.gpm to save data
 create table in subsystems>ermis
 */
trait Ermis {
protected $ermis_connection_url='https://vivalibro.com/ermis/v1/';

    protected function runningErmis(): bool {
    //check and return
    return true;
    }

    protected function getListErmis() {
    return "array all methods routers and requests";
    }

    protected function testErmisRoutes() {
    return "return a list of runnign & not";
    }

protected function requestErmis($router_endpoint, $payload=[], $method = 'POST'): ?array {
    // Initialize the Guzzle client
    $client = new Client();

    try {
        // Prepare the options array
        $options = [];

        // For GET requests, add query parameters to the URL
        if (strtoupper($method) === 'GET') {
            // Convert payload to query string
            $query = http_build_query($payload);
            // Make the GET request
            $response = $client->request('GET', $this->ermis_connection_url . $router_endpoint . '?' . $query);
        } else {
            // Assume POST as default method
            $options['json'] = $payload; // Send payload as JSON
            // Make the POST request
            $response = $client->request('POST', $this->ermis_connection_url . $router_endpoint, $options);
        }

        // Decode the JSON response
        $data = json_decode($response->getBody(), true);

        // Check if the data is valid
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON response');
        }

        return $data;
    } catch (RequestException $e) {
        // Handle HTTP request errors
        echo 'HTTP Request failed: ' . $e->getMessage();
        return null;

    } catch (\Exception $e) {
        // Handle any other exceptions
        echo 'Error: ' . $e->getMessage();
        return null;
    }
}

}
