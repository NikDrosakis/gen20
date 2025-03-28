<?php
namespace Core;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
//use Exception;

trait Url {
public $httpClient;

/**
 TODO cubo method `gen god getUrl [url]` to replace fetchUrl
 */
protected function getUrl(string $url, array $options = []) {

}
protected function fetchUrl(string $url, array $options = []) {
    $this->httpClient = new Client();
    try {
        // Preserve $_GET parameters in the URL
        if (!empty($_GET)) {
            $queryString = http_build_query($_GET);
            $url .= (strpos($url, '?') === false ? '?' : '&') . $queryString;
        }

        // If the request is GET, remove body from options
        if (($options['method'] ?? 'GET') === 'GET') {
            unset($options['body']);
        }

        // Execute HTTP request
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
            $body = $response->getBody()->getContents();

            if (strpos($contentType, 'application/json') !== false) {
                $decodedBody = json_decode($body, true);
                return $decodedBody;
            }
            return $body;
        } else {
            return ["error" => "HTTP error! Status: $statusCode"];
        }
    } catch (GuzzleException $e) {
        return ["error" => "Fetch error: " . $e->getMessage()];
    }
}

protected function fetchExtUrl(string $url, array $options = []) {
    $this->httpClient = new Client();
    $cacheKey = 'cubo_' . md5($url . json_encode($options)); // Unique cache key

    // Try fetching from Redis cache
    $cachedResponse = $this->redis->get($cacheKey);
    if ($cachedResponse !== false) {
        return $cachedResponse;
    }

    try {
        if (!empty($_GET)) {
            $queryString = http_build_query($_GET);
            $url .= (strpos($url, '?') === false ? '?' : '&') . $queryString;
        }

        // If it's a GET request, remove the body
        if (($options['method'] ?? 'GET') === 'GET') {
            unset($options['body']);
        }

        // Fix: Use 'json' instead of manually encoding the body
        $requestOptions = [
            'headers' => $options['headers'] ?? [],
        ];
        if (isset($options['body'])) {
            $requestOptions['json'] = json_decode($options['body'], true); // Proper JSON encoding
        }

        $response = $this->httpClient->request(
            $options['method'] ?? 'GET',
            $url,
            $requestOptions
        );

        $statusCode = $response->getStatusCode();
        if ($statusCode >= 200 && $statusCode < 300) {
            $contentType = $response->getHeaderLine('Content-Type');
            $body = $response->getBody()->getContents();

            if (strpos($contentType, 'application/json') !== false) {
                $decodedBody = json_decode($body, true);
                $this->redis->set($cacheKey, $decodedBody, 1000); // Store JSON response in Redis
                return $decodedBody;
            }

            $this->redis->set($cacheKey, $body, 1000);
            return $body;
        } else {
            return ["error" => "HTTP error! Status: $statusCode"];
        }
    } catch (GuzzleException $e) {
        return ["error" => "Fetch error: " . $e->getMessage()];
    }
}


protected function fetchUrlOld(string $url, array $options = []) {
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

protected function insertUrl(string $url, array $data, array $options = []): array{
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

protected function updateUrl(string $url, array $data, array $options = []): array{
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

protected function deleteUrl(string $url, array $options = []): array{
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
