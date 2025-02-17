<?php
namespace Core;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

trait Url {
public Client $httpClient;

/**
 /cubos/index.php?cubo=slideshow&file=public.php
 */

protected function fetchUrl(string $url, array $options = [], int $depth = 0): string|array {
    // Prevent infinite loops
    if ($depth > 3) {
        throw new Exception("Fetch error: Too many recursive fetch calls! URL: " . $url);
    }

    // Detect self-referencing URLs
    $currentUrl = $_SERVER['REQUEST_URI'];
    if (strpos($url, $currentUrl) !== false) {
        echo "Warning: Self-referencing URL detected! Skipping fetch.<br>";
        return "";
    }

  //  echo "Debug: Fetching URL - " . htmlspecialchars($url) . " (Depth: $depth)<br>";

    $this->httpClient = new Client();
    try {
        $response = $this->httpClient->request(
            $options['method'] ?? 'GET',
            $url,
            [
                'headers' => $options['headers'] ?? [],
                'body' => $options['body'] ?? null,
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
            throw new Exception("HTTP error! Status: " . $statusCode);
        }
    } catch (GuzzleException $e) {
        throw new Exception("Fetch error: " . $e->getMessage());
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
    $this->httpClient = new Client();
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
