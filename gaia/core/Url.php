<?php
namespace Core;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
//use Exception;

trait Url {
public $httpClient;

protected function fetchUrl(string $url, array $options = []) {
    $this->httpClient = new Client();

    try {
        // Διατήρησε τα $_GET στο URL και μην τα βάζεις στο body
        if (!empty($_GET)) {
            $queryString = http_build_query($_GET);
            $url .= (strpos($url, '?') === false ? '?' : '&') . $queryString;
        }

        // Αν το method είναι GET, αφαιρούμε το body
        if (($options['method'] ?? 'GET') === 'GET') {
            unset($options['body']);
        }

        $response = $this->httpClient->request(
            $options['method'] ?? 'GET',
            $url,
            [
                'headers' => $options['headers'] ?? [],
            ]
        );

        $statusCode = $response->getStatusCode();
        if ($statusCode >= 200 && $statusCode < 300) {
            $contentType = $response->getHeaderLine('Content-Type');

            if (strpos($contentType, 'application/json') !== false) {
                return json_decode($response->getBody(), true);
            }

            return $response->getBody()->getContents();
        } else {
            return ["error" => "HTTP error! Status: $statusCode"];
        }
    } catch (GuzzleException $e) {
        return ["error" => "Fetch error: " . $e->getMessage()];
    }
}

protected function insertUrl(string $url, array $data, array $options = []): array
{
    $this->httpClient = new Client();
    try {
        $response = $this->httpClient->request(
            'POST',
            $url,
            [
                'headers' => array_merge(
                    ['Content-Type' => 'application/json'],
                    $options['headers'] ?? []
                ),
                'json' => $data, // Automatically encodes JSON body
            ]
        );

        $statusCode = $response->getStatusCode();

        if ($statusCode >= 200 && $statusCode < 300) {
            $contentType = $response->getHeaderLine('Content-Type');

            if (strpos($contentType, 'application/json') !== false) {
                return json_decode($response->getBody(), true);
            }

            return ['body' => $response->getBody()->getContents()];
        } else {
            throw new Exception("HTTP error! Status: " . $statusCode . " " . $response->getBody()->getContents());
        }
    } catch (GuzzleException $e) {
        throw new Exception("Insert error: " . $e->getMessage());
    }
}

protected function updateUrl(string $url, array $data, array $options = []): array
{
    $this->httpClient = new Client();
    try {
        $response = $this->httpClient->request(
            'PUT',
            $url,
            [
                'headers' => array_merge(
                    ['Content-Type' => 'application/json'],
                    $options['headers'] ?? []
                ),
                'json' => $data, // Automatically encodes JSON body
            ]
        );

        $statusCode = $response->getStatusCode();

        if ($statusCode >= 200 && $statusCode < 300) {
            return json_decode($response->getBody(), true);
        }

        throw new Exception("HTTP error! Status: " . $statusCode . " " . $response->getBody()->getContents());
    } catch (GuzzleException $e) {
        throw new Exception("Update error: " . $e->getMessage());
    }
}

protected function deleteUrl(string $url, array $options = []): array
{
   // $this->httpClient = new Client();
    try {
        $response = $this->httpClient->request(
            'DELETE',
            $url,
            [
                'headers' => $options['headers'] ?? [],
            ]
        );

        $statusCode = $response->getStatusCode();

        if ($statusCode >= 200 && $statusCode < 300) {
            return json_decode($response->getBody(), true);
        }

        throw new Exception("HTTP error! Status: " . $statusCode . " " . $response->getBody()->getContents());
    } catch (GuzzleException $e) {
        throw new Exception("Delete error: " . $e->getMessage());
    }
}


}
