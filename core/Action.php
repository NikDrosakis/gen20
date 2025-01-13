<?php
namespace Core;
use PDO;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
/**
 Action Gaia is the beginning of Action
 Basic Difference with nodejs ermis.core.Action is that php gaia.core.Action calling endpoints



 exeActions exported to index.js:
 `Instantiate Actions |  const { exeActions } = require('./action');exeActions(app);
 Running Web Socket Server for RealTime Actions; WServer(server,app,exeActions);

--> uses Maria, Messenger
--> runs in systemsid ermis
 TODO utilize ci/cd process (through Github) example in the end
 TODO utilize the power of event driven kafka logic
 TODO utilize the power of unit testing
 TODO use the manifest.md as high level filesystem & sql standarization

@filemetacore.description Get Add Manage Resources from web

@filemetacore.features
Check standard nulls of DB and suggest to complete
Check all actiongrp if active

@filemetacore.todo
- add more NULL img actiongrp
- aDDMore resource text and bw and diff types of images
- Google Books API
- Open Library API
- LibraryThing API
- Use OpenCV, Pillow python job for kronos
*/

trait Action {
/**
the Core does not need to publish to WS just in case of realtime need
*/
use WS, Manifest;

    protected PDO $mariadmin;
    protected bool $executionRunning = false;
    protected array $actionStatus = [
        'DEPRECATED' => 0,
        'DANGEROUS' => 1,
        'MISSING_INFRASTRUCTURE' => 2,
        'NEEDS_UPDATES' => 3,
        'INACTIVE_WRONG_FAILED' => 4,
        'NEW' => 5,
        'WORKING_TESTING_EXPERIMENTAL' => 6,
        'ALPHA_RUNNING_READY' => 7,
        'BETA_WORKING' => 8,
        'STABLE' => 9,
        'STABLE_DEPENDS_OTHERS' => 10,
    ];
    protected Client $httpClient;

/**
 Filesystem action to upsert action table
 */
protected function upsertActionFromFS(){}
protected function addAction(array $key_value_array=[]){$this->db->inse("gen_admin.action",$key_value_array);}

/**
One action triggered from button
*/
 protected function runAction(array $params = []): array{
        $action = $params['key'];
        //this is one action later execute a plan (series of actions)
        try {
            $record = $this->db->f("
                SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
                FROM gen_admin.action
                LEFT JOIN gen_admin.actiongrp ON actiongrp.id = action.actiongrpid
                WHERE action.name=?
            ",[$action]);
            if (!$record) {
                return [
                    'status' => 404,
                    'success' => false,
                    'code' => 'LOCAL',
                    'error' => "Action with name {$action} not found."
                ];
            }

            $startTime = microtime(true);
            $result = $this->executeAction($record);
            $endTime = microtime(true);
            $exeTime = ($endTime - $startTime) * 1000; // in milliseconds

            if ($result) {
                $this->updateStatus($record, $this->actionStatus['ALPHA_RUNNING_READY'], 'Action completed', $exeTime);
                $record['finished'] = true;
                return [
                    'status' => 200,
                    'success' => true,
                    'code' => 'LOCAL',
                    'message' => "Action {$action} completed successfully",
                    'data' => $record,
                ];
            } else {
                $this->updateStatus($record, $this->actionStatus['INACTIVE_WRONG_FAILED'], 'Action failed', $exeTime);
                return [
                    'status' => 500,
                    'success' => false,
                    'code' => 'LOCAL',
                    'message' => "Action {$action} failed",
                    'data' => $record,
                ];
            }
        } catch (Exception $err) {
            return [
                'status' => 500,
                'success' => false,
                'code' => 'LOCAL',
                'error' => "Error processing action {$action}: " . $err->getMessage()
            ];
        }
    }

protected function fetch(string $url, array $options = []): array    {
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

        if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
            $contentType = $response->getHeaderLine('Content-Type');
            if (strpos($contentType, 'application/json') !== false) {
                return json_decode($response->getBody(), true);
            }
            return ['body' => $response->getBody()->getContents()];
        } else {
            throw new Exception("HTTP error! status: " . $response->getStatusCode() . " " . $response->getBody()->getContents());
        }
    } catch (GuzzleException $e) {
        throw new Exception("Fetch error: " . $e->getMessage());
    }
}

public function actionLoop(): void
{
    if ($this->executionRunning) {
        echo "🏃‍♂️ Loop is already running\n";
        return;
    }
    $this->executionRunning = true;

    try {
        $preLoopCounts = $this->getActionStatusCounts();
        echo "Pre-Loop Status Counts:\n";
        print_r($preLoopCounts);

        $stmt = $this->db->prepare("
            SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
            FROM action
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
            WHERE action.systemsid in (0,3)
            ORDER BY action.sort
        ");
        $stmt->execute();
        $actions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$actions || empty($actions)) {
            echo "✗  No pending actions. Waiting...\n";
        } else {
            $processResult = $this->processActions($actions);
            echo "📊 {$processResult['success']}/{$processResult['total']} --> {$processResult['percentage']} %success\n";
            $postLoopCounts = $this->getActionStatusCounts();
            echo "🏁 Post-Loop Status Counts:\n";
            print_r($postLoopCounts);
        }
    } catch (Exception $err) {
        echo "✗  Error in main loop: " . $err->getMessage() . "\n";
    } finally {
        $this->executionRunning = false;
    }
}

protected function processActions(array $actions): array
{
    $total = 0;
    $success = 0;
    $statusStats = array_fill_keys(array_keys($this->actionStatus), 0);

    foreach ($actions as $rec) {
        $total++;
        try {
            $startTime = microtime(true);
            $result = $this->executeAction($rec);
            $endTime = microtime(true);
            $exeTime = ($endTime - $startTime) * 1000; // in milliseconds

            if ($result === true) {
                $statusStats[$this->actionStatus['ALPHA_RUNNING_READY']]++;
                $success++;
                $this->updateStatus($rec, $this->actionStatus['ALPHA_RUNNING_READY'], 'Action completed', $exeTime);
            } else {
                $statusStats[$this->actionStatus['INACTIVE_WRONG_FAILED']]++;
                $this->updateStatus($rec, $this->actionStatus['INACTIVE_WRONG_FAILED'], 'Action failed', $exeTime);
            }
        } catch (Exception $err) {
            $statusStats[$this->actionStatus['NEEDS_UPDATES']]++;
            echo "✗  Error processing action {$rec['id']}: " . $err->getMessage() . "\n";
            $this->updateStatus($rec, $this->actionStatus['NEEDS_UPDATES'], $err->getMessage());
        }
    }

    $percentage = $total === 0 ? 0 : round(($success / $total) * 100, 2);
    return ['total' => $total, 'success' => $success, 'statusStats' => $statusStats, 'percentage' => $percentage];
}

protected function getActionStatusCounts(): array
{
    $queryParts = [];
    foreach ($this->actionStatus as $key => $val) {
        $queryParts[] = "COUNT(CASE WHEN status = {$val} THEN 1 END) as {$key}";
    }
    $query = "SELECT " . implode(', ', $queryParts) . " FROM action WHERE systemsid in(0,3)";
    $stmt = $this->db->query($query);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

protected function getNextIntervalTime(array $actions): int
{
    $intervalTimes = array_filter(array_column($actions, 'interval_time'), function ($t) {
        return $t > 0;
    });
    if (empty($intervalTimes)) {
        return 10;
    }
    return min($intervalTimes);
}

protected function executeAction(array $rec): bool
{
    try {
        switch ($rec['type']) {
            case 'apint':
                return $this->runInternalRecource($rec);
            case 'apext':
                return $this->runExternalRecource($rec);
            case 'generate':
            case 'ai':
                return $this->buildAI($rec);
            case 'N':
                return $this->buildN($rec);
            case 'fs':
                return true;
            default:
                echo "✗  Unknown type '{$rec['type']}' for action ID {$rec['id']}.\n";
                return false;
        }
    } catch (Exception $error) {
        echo "✗  Error executing action: " . $error->getMessage() . "\n";
        return false;
    }
}


public function updateEndpointParams(string $endpoint, array $params, string $name): string
{
    try {
        $stringifiedParams = json_encode($params);
        $stmt = $this->db->upsert("UPDATE action SET params = :params, endpoint = :endpoint WHERE actiongrp.name = :name");
        $stmt->execute(['params' => $stringifiedParams, 'endpoint' => $endpoint, 'name' => $name]);
        return "✓ Updated action table with: params = {$stringifiedParams}, endpoint = {$endpoint}\n";
    } catch (Exception $e) {
        return "Error while reading, parsing file or updating db: " . $e->getMessage() . "\n";
    }
}

protected function updateStatus(array $rec, int $newStatus, string $log = '', float $exeTime = 0): string {
$update_array= ['status' => $newStatus, 'log' => $log, 'exe_time' => $exeTime, 'name' => $rec['name']];
    try {
        $stmt = $this->db->upsert("gen_admin.action",$update_array);
        return "💾 Action {$rec['id']} set to status {$newStatus}";
    } catch (Exception $err) {
        return "✗  Error updating action status: " . $err->getMessage() . "\n";
    }
}

protected function parseJsdoc(string $comment) {
    $params = null;
    try {
        if (preg_match('/@params\s+({[\s\S]*?})/', $comment, $matches)) {
            try {
                $params = json_decode($matches[1], true);
            } catch (Exception $parseError) {
                return "Invalid JSON after @params tag: {$matches[1]}\n";
                $params = [];
            }
        }
    } catch (Exception $e) {
        return "Error while parsing params: " . $e->getMessage() . "\n";
    }
    return $params;
}

protected function scanRoutes(array $routes, string $prefix = ''): array
{
    $mappings = [];
    if ($routes) {
        foreach ($routes as $route) {
            if (isset($route['methods']) && isset($route['path'])) {
                $methods = implode(',', array_map('strtoupper', $route['methods']));
                $path = $prefix . $route['path'];
                $keys = $route['keys'] ?? 'default-key';
                $params = $route['params'] ?? [];
                $mappings[] = [
                    'method' => $methods,
                    'path' => $path,
                    'keys' => $keys,
                    'params' => $params,
                ];
            }
        }
    }
    return $mappings;
}

protected function checkRouteHealth(array $rec): bool
{
    $healthEndpoint = 'health';
    $pingEndpoint = 'ping';
    $endpoints = [$healthEndpoint, $pingEndpoint];

    foreach ($endpoints as $endpoint) {
        $host = $rec['base'] . $endpoint;
        try {
            return "--> Checking health at: {$host}\n";
            $response = $this->fetch($host);
            if (isset($response['body'])) {
                return "✓ Health Check OK: {$host}\n";
                return true;
            } else {
                return "✗ Health Check Failed: {$host} status: " . json_encode($response) . "\n";
            }
        } catch (Exception $error) {
            return "✗ Health Check Error for: {$host} " . $error->getMessage() . "\n";
        }
    }
    return false;
}

protected function buildRoute(array $rec): bool
{
    $routerPath = "services/{$rec['grpName']}/routes.php";
    if (file_exists($routerPath)) {
        try {
            $routes = include $routerPath;
            if ($routes) {
                return "✓  {$rec['grpName']} routed.\n";
                $routeMappings = $this->scanRoutes($routes, "/ermis/v1/{$rec['grpName']}");
                return !empty($routeMappings);
            } else {
                return "✗  Error: No valid router exported from {$routerPath}\n";
                return false;
            }
        } catch (Exception $error) {
            return "✗  Error loading route {$routerPath}: " . $error->getMessage() . "\n";
            return false;
        }
    } else {
        return "✗  Invalid path for action group: {$rec['grpName']}\n";
        return false;
    }
}

protected function buildAI(array $rec): bool
{
    try {
        [$method, $rawurl] = explode(',', $rec['endpoint']);
        $url = $this->renderKeys($rawurl, $rec);

        if ($method === 'POST') {
            return "--> Processing AI POST request to: {$url}\n";
            try {
                $payload = json_decode($rec['payload'] ?? '{}', true);
                $response = $this->fetch($url, [
                    'method' => 'POST',
                    'headers' => ['Content-Type' => 'application/json'],
                    'body' => json_encode($payload),
                ]);
                return "{$rec['name']} AI responded with data: " . json_encode($response) . "\n";
                return true;
            } catch (Exception $fetchError) {
                return "✗  Error processing AI POST request: " . $fetchError->getMessage() . "\n";
                return false;
            }
        } else {
            return "✗  Unsupported HTTP method for AI: {$method}\n";
            return false;
        }
    } catch (Exception $err) {
        return "✗  Error building AI route: " . $err->getMessage() . "\n";
        return false;
    }
}

protected function renderKeys(string $rawurl, array $rec): string
{
    $keyValuePairs = [];
    if (isset($rec['keys'])) {
        foreach (explode(',', $rec['keys']) as $pair) {
            if (strpos($pair, '=') !== false) {
                [$key, $value] = explode('=', $pair, 2);
                $keyValuePairs[$key] = $value;
            }
        }
    }
    try {
        $url = parse_url($rawurl);
        if (isset($url['query'])) {
            parse_str($url['query'], $queryParams);
            foreach ($queryParams as $key => $value) {
                if (strpos($value, '{') === 0 && strpos($value, '}') === strlen($value) - 1) {
                    $varName = substr($value, 1, -1);
                    if (isset($keyValuePairs[$varName])) {
                        $queryParams[$key] = $keyValuePairs[$varName];
                    }
                }
            }
            $url['query'] = http_build_query($queryParams);
        }
        return $this->buildUrl($url);
    } catch (Exception $e) {
        return "✗  Error in render keys: " . $e->getMessage() . " " . $rawurl . " " . json_encode($rec) . "\n";
        return $rawurl;
    }
}

protected function buildUrl(array $urlParts): string
{
    $url = '';
    if (isset($urlParts['scheme'])) {
        $url .= $urlParts['scheme'] . '://';
    }
    if (isset($urlParts['host'])) {
        $url .= $urlParts['host'];
    }
    if (isset($urlParts['port'])) {
        $url .= ':' . $urlParts['port'];
    }
    if (isset($urlParts['path'])) {
        $url .= $urlParts['path'];
    }
    if (isset($urlParts['query'])) {
        $url .= '?' . $urlParts['query'];
    }
    if (isset($urlParts['fragment'])) {
        $url .= '#' . $urlParts['fragment'];
    }
    return $url;
}

protected function getResourcesParams(array $request): ?array
{
    if (!$request) {
        return null;
    }
    $params = [
        'query' => $request['query'] ?? [],
        'headers' => $request['headers'] ?? [],
        'cookies' => $request['cookies'] ?? [],
    ];
    return $params;
}

protected function renderKeysString(string $text, array $data): string
{
    $rendered = $text;
    preg_match_all('/{{(.*?)}}/', $text, $matches);
    foreach ($matches[0] as $index => $keyMatch) {
        $key = trim($matches[1][$index]);
        $value = array_reduce(explode('.', $key), function ($obj, $k) {
            return $obj && isset($obj[$k]) ? $obj[$k] : '';
        }, $data);
        $rendered = str_replace($keyMatch, $value, $rendered);
    }
    return $rendered;
}

protected function runExternalRecource(array $rec): bool
{
    try {
        [$method, $rawurl] = explode(',', $rec['endpoint']);
        $url = $this->renderKeys($rawurl, $rec);
        $data = null;
        if ($method === 'GET' || $method === 'POST') {
            return "--> Processing {$method} request to: {$url}\n";
            try {
                $options = ['method' => $method];
                if ($method === 'POST') {
                    $bodyData = $this->renderKeysString(json_encode($rec['body'] ?? []), $rec);
                    $options['headers'] = ['Content-Type' => 'application/json'];
                    $options['body'] = $bodyData;
                    return $bodyData;
                }
                $response = $this->fetch($url, $options);
                return "✓ {$rec['name']} Responsed with data\n";
                return json_encode($response, JSON_PRETTY_PRINT) . "\n";
                return true;
            } catch (Exception $err) {
                return "✗  Processing {$method} request: " . $err->getMessage() . "\n";
                return false;
            }
        } else {
            return "✗  Unsupported HTTP method: {$method}\n";
            return false;
        }
    } catch (Exception $err) {
        return "✗  Building API route: " . $err->getMessage() . "\n";
        return false;
    }
}

protected function runInternalRecource(array $rec): bool {

//route resource
        $this->buildRoute($rec);

    if (isset($rec['requires'])) {
        try {
            $requiredModule = include $rec['requires'];
            if (is_callable($requiredModule)) {
                $requiredModule();
            } else {
                return "Error loading required module {$rec['requires']}: Module is not a function\n";
            }
        } catch (Exception $requireError) {
            return "Error loading required module {$rec['requires']}: " . $requireError->getMessage() . "\n";
        }
    }
    try {
        [$method, $path] = explode(',', $rec['endpoint']);
        if ($method !== 'GET') {
            return "✗  Unsupported HTTP method: {$method}\n";
        }
        if (!$path) {
            return "✗  Path not defined {$path}\n";
        }
        return "--> Processing internal GET request to: {$path}\n";
        $file = "services/{$rec['grpName']}/docs/index.html";
        if (file_exists($file)) {
            $params = $this->getResourcesParams($_GET);
            $rec['action'] = array_merge($rec, ['params' => $params]);
            return "--> Params: " . json_encode($params) . "\n";
            $stmt = $this->db->prepare("UPDATE action SET action = :action WHERE id = :id");
            $stmt->execute(['action' => json_encode($rec['action']), 'id' => $rec['id']]);
            return "✓ Updated system {$rec['id']} with params: " . json_encode($rec['action']['params']) . "\n";
            readfile($file);
            return true;
        } else {
            return "File not found\n";
        }
    } catch (Exception $err) {
        return "✗  Building API route: " . $err->getMessage() . "\n";
    }
}

protected function buildChat(array $rec): bool
{
    return "Processing Chat #{$rec['id']}; \n";
}

protected function buildStream(array $rec): bool
{
    return "Processing Stream #{$rec['id']}; \n";
}

protected function buildAuthentication(array $rec): bool
{
    return "Processing Authenticate #{$rec['id']}; \n";
}

protected function buildN(array $rec): bool
{
    try {
        if (isset($rec['statement']) || isset($rec['execute'])) {
            // Implement Messenger logic here
            // $this->messenger->publishMessage($rec);
        }
        return true;
    } catch (Exception $error) {
        return "✗  Processing action N: " . $error->getMessage() . "\n";
        return false;
    }
}

public function upsertAction(array $actionGrpData, array $actionData): array|bool
{
    try {
        $name = $actionGrpData['name'];
        $description = $actionGrpData['description'];
        $base = $actionGrpData['base'];
        $meta = $actionGrpData['meta'] ?? null;

        $stmt = $this->db->prepare("INSERT INTO actiongrp (name, description, base, meta) VALUES (:name, :description, :base, :meta)");
        $stmt->execute(['name' => $name, 'description' => $description, 'base' => $base, 'meta' => $meta]);
        $actionGrpId = $this->db->lastInsertId();

        if (!$actionGrpId) {
            throw new Exception('Error inserting actiongrp');
        }

        $stmt = $this->db->prepare("INSERT INTO action (name, systemsid, actiongrpid, endpoint) VALUES (:name, :systemsid, :actiongrpid, :endpoint)");
        $stmt->execute([
            'name' => $actionData['name'],
            'systemsid' => $actionData['systemsid'] ?? 3,
            'actiongrpid' => $actionGrpId,
            'endpoint' => $actionData['endpoint'],
        ]);
        $actionId = $this->db->lastInsertId();

        if (!$actionId) {
            throw new Exception('Error inserting action');
        }

        return [
            'actiongrpid' => $actionGrpId,
            'actionid' => $actionId,
        ];
    } catch (Exception $error) {
        return "Error adding action: " . $error->getMessage() . "\n";
    }
}

}