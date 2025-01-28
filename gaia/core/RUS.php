<?php
namespace Core;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
/**
 * Trait for connecting to RUS WebSocket API
  intending to use ffi Rust
 */
trait RUS {
protected $rus_connection_url='https://vivalibro.com/rus/v1/endpoint';

    protected function connectGPY() {
        // Initialize the Guzzle client
        $client = new Client();

        try {
            // Make the request to the API endpoint
            $response = $client->request('GET', $rus_connection_url);

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
