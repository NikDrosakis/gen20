<?php
namespace Core\Traits;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

/**
 * WSI Trait

DOC
====
1. connnect with Kronos

2. get generative task from service/openai

3. attems to create an endpoint list to manage

 create table in subsystems>ermis

 */
trait Kronos {

protected $kronos_connection_url='https://vivalibro.com/apy/v1/';
protected $openapi_url = 'https://vivalibro.com/apy/v1/openapi.json';
protected function runningGPY(): bool {
    //check and return
return true;
}


protected function getListKronos(): ?array {
    // URL for the OpenAPI specification

    // Initialize the Guzzle client
    $client = new Client();

    try {
        // Send a GET request to fetch the OpenAPI JSON
        $response = $client->request('GET', $this->openapi_url);

        // Decode the JSON response
        $data = json_decode($response->getBody(), true);

        // Check if the data is valid
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON response');
        }

        // Extract the list of paths (endpoints)
        if (isset($data['paths'])) {
            return $data['paths'];
        } else {
            throw new \Exception('No paths found in the OpenAPI specification');
        }
    } catch (RequestException $e) {
        echo 'HTTP Request failed: ' . $e->getMessage();
        return null;
    } catch (\Exception $e) {
        echo 'Error: ' . $e->getMessage();
        return null;
    }
}

protected function requestKronos($router_endpoint, $payload=[], $method = 'POST'): ?array {
    // Initialize the Guzzle client
    $client = new Client();

    try {
  // Prepare the options array
    $options = [
        'headers' => [
            'Authorization' => 'Bearer YOUR_API_TOKEN', // Add your authentication token here
        ],
    ];
         // For GET requests, add query parameters to the URL
            if (strtoupper($method) === 'GET') {
                // Convert payload to query string
                $query = http_build_query($payload);
                // Make the GET request
                $response = $client->request('GET', $this->kronos_connection_url . $router_endpoint . '?' . $query, $options);
            } else {
                // Assume POST as default method
                $options['json'] = $payload; // Send payload as JSON
                // Make the POST request
                $response = $client->request('POST', $this->kronos_connection_url . $router_endpoint, $options);
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

protected function testKronosRoutes(): void {
    // URL for the OpenAPI specification
    $openapi_url = 'https://vivalibro.com/apy/v1/openapi.json';

    // Initialize the Guzzle client
    $client = new Client();

    try {
        // Send a GET request to fetch the OpenAPI JSON
        $response = $client->request('GET', $openapi_url);
        $data = json_decode($response->getBody(), true);

        // Check if the data is valid
        if (json_last_error() !== JSON_ERROR_NONE || !isset($data['paths'])) {
            throw new \Exception('Invalid JSON response or no paths found');
        }

        // Iterate through each path
        foreach ($data['paths'] as $path => $methods) {
            foreach ($methods as $method => $details) {
                // Prepare request parameters based on the method
                $params = $this->prepareRequestParams($path, $details);
                $url = "https://vivalibro.com" . $path;

                // Send the request and log the response
                $this->sendRequest($client, $method, $url, $params);
            }
        }
    } catch (RequestException $e) {
        echo 'HTTP Request failed: ' . $e->getMessage();
    } catch (\Exception $e) {
        echo 'Error: ' . $e->getMessage();
    }
}

/**
 * Prepare request parameters based on the method details.
 * @param string $path
 * @param array $details
 * @return array
 */
private function prepareRequestParams(string $path, array $details): array {
    $params = [];

    // Add path parameters
    if (isset($details['parameters'])) {
        foreach ($details['parameters'] as $parameter) {
            if ($parameter['in'] === 'path') {
                // Assume a placeholder value for path parameters
                $params[$parameter['name']] = 'test-value'; // Use a relevant test value here
            } elseif ($parameter['in'] === 'query') {
                // Handle query parameters as needed
                $params[$parameter['name']] = 'test-value'; // Use a relevant test value here
            }
        }
    }

    // Add request body for POST/PUT methods
    if (isset($details['requestBody'])) {
        $params['body'] = json_encode($this->getRequestBody($details['requestBody']));
    }

    return $params;
}

/**
 * Extracts the request body structure for a given request body.
 * @param array $requestBody
 * @return array
 */
private function getRequestBody(array $requestBody): array {
    // Use default or example data for request body parameters
    if (isset($requestBody['content']['application/json']['schema']['$ref'])) {
        // Placeholder for the schema extraction logic
        // You can implement logic to generate a request body based on the schema
        return ['exampleField' => 'exampleValue']; // Adjust according to your schema
    }
    return [];
}

/**
 * Sends a request to the specified URL and logs the response.
 * @param Client $client
 * @param string $method
 * @param string $url
 * @param array $params
 */
private function sendRequest(Client $client, string $method, string $url, array $params): void {
    try {
        if (strtoupper($method) === 'GET') {
            $response = $client->request('GET', $url, ['query' => $params]);
        } else {
            $response = $client->request('POST', $url, ['json' => json_decode($params['body'], true)]);
        }

        // Log the response status and body
        echo "Testing $method $url: " . $response->getStatusCode() . PHP_EOL;
        echo $response->getBody() . PHP_EOL;
    } catch (RequestException $e) {
        echo "Failed to call $method $url: " . $e->getMessage() . PHP_EOL;
    }
}



}
