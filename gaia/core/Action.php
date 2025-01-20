<?php
namespace Core;
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
that's the return format
         $response['status']=200;
         $response['code']='R2';
         $response['error']='';
         $response['success']=true;
         $response['data']= $this->db->f("SELECT * FROM $table WHERE id=?",array($this->id));
*/
 protected function runAction(array $params = []): array{
        $action = $params['key'];
        //this is one action later execute a plan (series of actions)
        try {
            $record = $this->db->f("
                SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, systems.name as systemName, systems.apiprefix, action.*
                FROM gen_admin.action
                LEFT JOIN gen_admin.actiongrp ON actiongrp.id = action.actiongrpid
                LEFT JOIN gen_admin.systems ON systems.id = action.systemsid
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
                //upgrades or downgrades action based on result
                $this->updateStatus($record, $this->actionStatus['ALPHA_RUNNING_READY'], 'Action completed', $exeTime);
                //send message to ermis
            //   $this->connectToWebSocket();
              //  $payload = $this->createWSPayload(json_encode($result));
               // $this->sendMessage($payload);
                //$this->disconnect();

                return $result;
            } else {
                $this->updateStatus($record, $this->actionStatus['INACTIVE_WRONG_FAILED'], 'Action failed', $exeTime);
                return [
                    'status' => 500,
                    'success' => false,
                    'code' => 'LOCAL',
                    'error' => 'No result'
                ];
            }
        } catch (Exception $err) {
            return [
                'status' => 500,
                'success' => false,
                'error' => 'LOCAL',
                'code' => 'LOCAL',
                'error' => "Error processing action {$action}: " . $err->getMessage()
            ];
        }
    }

/**
@context the returned output of the previous executed or [];
*/
 protected function runActionplan(array $params = []): array{
        $action = $params['key'];
        $context = $params['context'];
        //this is one action later execute a plan (series of actions)
        try {
            $record = $this->db->f("
                SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base,
                action_plan.*,plan.name
                FROM gen_admin.action_plan
                LEFT JOIN gen_admin.actiongrp ON actiongrp.id = action_plan.actiongrpid
                LEFT JOIN gen_admin.plan ON plan.id = action_plan.planid
                WHERE action_plan.name=?
            ",[$action]);


            if (!$record) {
            //if actionplan does not exist just execute the key if exist in methods
            //eg
            //errors
                unset($params['key']);
                $atLeastExecuted = $this->{$action}(...array_values($params));
                return [
                    'status' => 409,
                    'success' => true,
                    'code' => 'RUN',
                    'data' => $atLeastExecuted,
                    'error' => "Action {$action} not found. I just executed the function!"
                ];
            }

            $startTime = microtime(true);
            $result = $this->executeAction($record);
            $endTime = microtime(true);
            $exeTime = ($endTime - $startTime) * 1000; // in milliseconds

            if ($result) {
                //upgrades or downgrades action based on result
                $this->updateStatus($record, $this->actionStatus['ALPHA_RUNNING_READY'], 'Action completed', $exeTime);
                //send message to ermis
            //   $this->connectToWebSocket();
              //  $payload = $this->createWSPayload(json_encode($result));
               // $this->sendMessage($payload);
                //$this->disconnect();

                return $result;
            } else {
                $this->updateStatus($record, $this->actionStatus['INACTIVE_WRONG_FAILED'], 'Action failed', $exeTime);
                return [
                    'status' => 500,
                    'success' => false,
                    'code' => 'LOCAL',
                    'error' => 'No result'
                ];
            }
        } catch (Exception $err) {
            return [
                'status' => 500,
                'success' => false,
                'error' => 'LOCAL',
                'code' => 'LOCAL',
                'error' => "Error processing action {$action}: " . $err->getMessage()
            ];
        }
    }

/**
Runs local PHP Methods
 */
protected function runLocalMethod(array $rec): mixed {
    $allowedMethods = [
        'atest3',
        'unsplash',
        'login',
        'buildTable',
        'a1',
        'fa',
        'login_3',
        // Add more allowed methods here
    ];
    $methodName = $rec['requires'] ?? null;
    if (!$methodName) {
        error_log("Error: 'method' field is missing or empty.");
        return ['success' => false, 'error' => "'method' field is missing or empty."];
    }

 //   if (!in_array($methodName, $allowedMethods)) {
   //     error_log("Error: Method '" . $methodName . "' is not allowed.");
     //   return ['success' => false, 'error' => "Method '" . $methodName . "' is not allowed."];
    //}

    if (!method_exists($this, $methodName)  && !method_exists($this->db, $methodName)) {
        error_log("Error: Method '" . $methodName . "' does not exist.");
        return ['success' => false, 'error' => "Method '" . $methodName . "' does not exist."];
    }
//parse params
$params = json_decode($rec['params'],true) ?? $rec['params'];
//execute method
    try {
     //  $result = $this->{$methodName}(...array_values($params));
     if(method_exists($this->db, $methodName)){
        $result = $this->db->{$methodName}(...array_values($params));
     }else{
        $result = $this->{$methodName}($params);
     }

        return is_array($result) ? $result : ["data"=>$result];

    } catch (Exception $e) {
        error_log("Error executing method '" . $methodName . "': " . $e->getMessage());
        return ['success' => false, 'error' => "Error executing method '" . $methodName . "': " . $e->getMessage()];
    }
}
/**
Runs series of Actions
 */
protected function runPlan($params){
//$startTime = microtime(true);
$plan = $params['key'];
$state = $params['state'] ?? 0;
$startTime = microtime(true);
        try {
            $actionplan = $this->db->fa("select
            plan.*,
            action_plan.name as actionplanName,action_plan.id as actionplanId,
            action_plan.requires,action_plan.params,action_plan.afterstate,action_plan.output,action_plan.sort,action_plan.output_params
            from gen_admin.action_plan
            left join gen_admin.plan on action_plan.planid = plan.id
            where plan.name=? ORDER BY action_plan.sort",[$plan]);
            if (empty($actionplan)){
                return [
                    'status' => 203,
                    'success' => true,
                    'code' => 'LOCAL',
                    'error' => "Plan {$plan} empty."
                ];
            }elseif (!$actionplan) {
                return [
                    'status' => 404,
                    'success' => false,
                    'code' => 'LOCAL',
                    'error' => "Action with name {$plan} not found."
                ];
            } else {
            $steps = count($actionplan); //step is integer starting from zero
            $pipeline=[];
            $context=[];
            //iterate actions through plan

             foreach($actionplan as $i => $action){
  if ($i < $state) {
        continue;
    }
             $res = $this->runActionplan(["key" => $action['actionplanName'],"context" => $context]);
              $pipeline[$i] = $action;
              $pipeline[$i]['output'] = $res;
                        $endTime = microtime(true);
                        $exeTime = ($endTime - $startTime) * 1000; // in milliseconds
              $pipeline[$i]['exe_time'] = $exeTime;
              $pipeline[$i]['steps'] = $steps;
              //create the event of output
              $output_params = json_decode($action['output_params'],true);
              $output_params['output'] = $res;
              //create the data output
              $pipeline[$i]['data'] = $action['output'] ? $this->{$action['output']}($output_params) : "json";
              if($action['afterstate']=='halt' || $action['afterstate']=='completed'){
              return $pipeline;
              }

             }

            //count success
             //upgrades or downgrades plan based on result
       //     $this->updatePlanStatus($actionplan, $this->actionStatus['ALPHA_RUNNING_READY'], 'Action completed', $exeTime);
            return $pipeline;
        }
        } catch (Exception $err) {
            return [
                'status' => 500,
                'success' => false,
                'error' => 'LOCAL',
                'code' => 'LOCAL',
                'error' => "Error processing action {$plan}: " . $err->getMessage()
            ];
        }
}

protected function createWSPayload(array $rec, array $res): array{
          return [
            'system' => $_SERVER['SYSTEM'] ?? '*',  // The target system for the message
            'execute' => $rec['execute']??'', // JavaScript command to be executed in the browser
            'cast' => $res['cast']??'all',      // Target audience: 'one', 'many', or 'all'
            'type' => $res['type']??'N',      // 'N' for notification or other types
            'verba' => $res,     // Dynamically formatted text
            'domaffects' => $res['domaffects']??'*',                // Default empty; can be updated dynamically if needed
            'domappend' => $res['domappend'] ?? '' // DOM class to append
        ];
}


protected function fetchUrl(string $url, array $options = []): array{
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
    //    echo "Status Code: {$statusCode}\n";

        if ($statusCode >= 200 && $statusCode < 300) {
            $contentType = $response->getHeaderLine('Content-Type');
         //   echo "Content-Type: {$contentType}\n";

            if (strpos($contentType, 'application/json') !== false) {
                $body = json_decode($response->getBody(), true);
              //  echo "Response Body: " . json_encode($body) . "\n";
                return $body;
            }

            // Handle non-JSON responses
            return ['body' => $response->getBody()->getContents()];
        } else {
            throw new Exception("HTTP error! Status: " . $statusCode . " " . $response->getBody()->getContents());
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

        $actions = $this->db->fa("
            SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
            FROM action
            LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
            WHERE action.systemsid in (0,3)
            ORDER BY action.sort
        ");
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

protected function getActionStatusCounts(){
    $queryParts = [];
    foreach ($this->actionStatus as $key => $val) {
        $queryParts[] = "COUNT(CASE WHEN status = {$val} THEN 1 END) as {$key}";
    }
    $query = "SELECT " . implode(', ', $queryParts) . " FROM action WHERE systemsid in(0,3)";
    return $this->db->f($query);
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

protected function executeAction(array $rec): ?array{
    try {
        switch ($rec['type']) {
            case 'local':
                return $this->runLocalMethod($rec);
            case 'apint':
                return $this->runExternalRecource($rec);
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
                 return $this->runLocalMethod($rec);
        }
    } catch (Exception $error) {
        echo "✗  Error executing action: " . $error->getMessage() . "\n";
        return false;
    }
}


protected function updatePlanStatus(array $rec, int $newStatus, string $log = '', float $exeTime = 0.01): string {
$update_array= ['status' => $newStatus, 'log' => $log, 'exe_time' => $exeTime, 'name' => $rec['name']];
    try {
        $stmt = $this->db->upsert("gen_admin.plan",$update_array);
                return "Action {$rec['id']} set to status {$newStatus}";
   } catch (Exception $err) {
        return "✗  Error updating action status: " . $err->getMessage() . "\n";
    }
}

protected function updateStatus(array $rec, int $newStatus, string $log = '', float $exeTime = 0): string {
$update_array= ['status' => $newStatus, 'log' => $log, 'exe_time' => $exeTime, 'name' => $rec['name']];
    try {
        $stmt = $this->db->upsert("gen_admin.action",$update_array);
                return "Action {$rec['id']} set to status {$newStatus}";
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
                $response = $this->fetchUrl($url, [
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
function renderBody(array $rec): string {
    // Check if the body params are available in the 'params' field
    if (isset($rec['params']) && !empty($rec['params'])) {
        // Decode the JSON body params
        // Fix: Add double quotes to keys in the JSON string
        $jsonString = preg_replace('/([a-zA-Z0-9_]+):/i', '"$1":', $rec['params']);
        $bodyParams = json_decode($jsonString, true);
        // Handle JSON decode errors
        if ($bodyParams === null && json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error decoding JSON params: " . json_last_error_msg());
            return ""; // or return a default value or error message
        }
        if ($bodyParams === null) {
            error_log("Error decoding JSON params: json_decode returned null");
            return "";
        }
        // Get the keys for replacement from the 'keys' field
        $keyValuePairs = [];
        if (isset($rec['keys'])) {
            foreach (explode(',', $rec['keys']) as $pair) {
                if (strpos($pair, '=') !== false) {
                    [$key, $value] = explode('=', $pair, 2);
                    $keyValuePairs[$key] = $value;
                }
            }
        }
        // Iterate through the body params and replace variables with actual values
        array_walk_recursive($bodyParams, function (&$value) use ($keyValuePairs) {
            if (is_string($value)) {
                // If the value contains curly braces, replace with the actual value from $keyValuePairs
                if (preg_match('/\{([^}]+)\}/', $value, $matches)) {
                    $varName = $matches[1];
                    if (isset($keyValuePairs[$varName])) {
                        $value = $keyValuePairs[$varName];
                    }
                }
            }
        });

        // Return the rendered JSON body as a string
        return json_encode($bodyParams);
    }

    return ""; // Return empty string if params is not set or empty
}
 protected function parseHeader(string $headerString): array {
        $headers = [];
        $headerString = trim($headerString);
        if (strpos($headerString, '{') === 0 && strrpos($headerString, '}') === strlen($headerString) - 1) {
            $headerString = substr($headerString, 1, -1);
            $pairs = explode(',', $headerString);
            foreach ($pairs as $pair) {
                $pair = trim($pair);
                if (strpos($pair, ':') !== false) {
                    [$key, $value] = explode(':', $pair, 2);
                    $key = trim(str_replace(['"', "'"], '', $key));
                    $value = trim(str_replace(['"', "'"], '', $value));
                    $headers[$key] = $value;
                }
            }
        }
        return $headers;
    }

    protected function parseUrl(string $url): array {
        $parsedUrl = parse_url($url);
        $queryParams = [];
        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $queryParams);
        }
        return [
            'scheme' => $parsedUrl['scheme'] ?? null,
            'host' => $parsedUrl['host'] ?? null,
            'path' => $parsedUrl['path'] ?? null,
            'query' => $queryParams
        ];
    }

    protected function replacePlaceholders( $data, array $keyValuePairs, string $placeholderRegex = '/\{\{([^}]+)\}\}/'):  mixed {
         if (is_string($data)) {
            return preg_replace_callback($placeholderRegex, function ($matches) use ($keyValuePairs) {
                $varName = $matches[1];
                if (isset($keyValuePairs[$varName])) {
                    return $keyValuePairs[$varName];
                }
                return $matches[0]; // Return original if not found
            }, $data);
        } elseif (is_array($data)) {
            array_walk_recursive($data, function (&$value) use ($keyValuePairs, $placeholderRegex) {
                if (is_string($value)) {
                    $value = preg_replace_callback($placeholderRegex, function ($matches) use ($keyValuePairs) {
                        $varName = $matches[1];
                        if (isset($keyValuePairs[$varName])) {
                            return $keyValuePairs[$varName];
                        }
                        return $matches[0]; // Return original if not found
                    }, $value);
                }
            });
            return $data;
        }
        return $data;
    }
    protected function buildUrl($url) {
        return (isset($url['scheme']) ? $url['scheme'] . '://' : '')
        . (isset($url['user']) ? $url['user'] . (isset($url['pass']) ? ':' . $url['pass'] : '') . '@' : '')
        . (isset($url['host']) ? $url['host'] : '')
        . (isset($url['port']) ? ':' . $url['port'] : '')
        . (isset($url['path']) ? $url['path'] : '')
        . (isset($url['query']) ? '?' . http_build_query($url['query']) : '')
        . (isset($url['fragment']) ? '#' . $url['fragment'] : '');
    }
    protected function renderHead(array $rec): array {
        // Get api keys from actiongrp.keys
        $keyValuePairs = [];
        if (isset($rec['keys'])) {
            $keyValuePairs = json_decode($rec['keys'], true);
            if ($keyValuePairs === null && json_last_error() !== JSON_ERROR_NONE) {
                error_log("Error decoding JSON keys: " . json_last_error_msg());
                $keyValuePairs = []; // Reset to empty array on error
            }
        }

        // Handle header replacement
        if (isset($rec['header']) && !empty($rec['header'])) {
            $headerString = $rec['header'];
            $headers = $this->parseHeader($headerString);
            $headers = $this->replacePlaceholders($headers, $keyValuePairs);
            return $headers;
        }

        return []; // Return empty array if header is not set or empty
    }

    protected function renderKeys(array $rec): string {
        // Get api keys from actiongrp.keys
        $keyValuePairs = [];
        if (isset($rec['keys'])) {
            $keyValuePairs = json_decode($rec['keys'], true);
            if ($keyValuePairs === null && json_last_error() !== JSON_ERROR_NONE) {
                error_log("Error decoding JSON keys: " . json_last_error_msg());
                $keyValuePairs = []; // Reset to empty array on error
            }
        }

        // Handle URL replacement
        $rawurl = $rec['url'];
        try {
            $url = $this->parseUrl($rawurl);
            $url['query'] = $this->replacePlaceholders($url['query'], $keyValuePairs);
            return $this->buildUrl($url);
        } catch (Exception $e) {
            return "✗  Error in render keys: " . $e->getMessage() . " " . $rawurl . " " . json_encode($rec) . "\n";
            return $rawurl;
        }
    }
/*
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
*/
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

/**
Gaia Admin for external resources
*/
protected function runExternalRecource(array $rec){
    try {
        $method = $rec['method'];

        // when relying on other APIs than gaia calls, then internally using systems.apiprefix
        if ($rec['apext'] || in_array($rec['systemName'], ['apiv1', 'vivalibrocom', 'admin'])) {
            $rawurl = $rec['url'];
            $url = $this->renderKeys($rec);
        } else {
            $url = $this->G['SITE_URL'].$rec['apiprefix'] . $rec['grpName'] . $rec['endpoint'];
        }
        // renders URL with API keys
        $rec['endpoint_rendered'] = $url;
        if (in_array($method,['GET','POST','PUT','DELETE'])) {
            // Log the request for debugging
            //echo "--> Processing {$method} request to: {$url}\n";
            try {
                $options = ['method' => $method];

                if ($method === 'POST') {
                    // Prepare the body data for POST requests
                    // $bodyData = $this->renderKeysString(json_encode($rec['body'] ?? []), $rec);
                    $bodyData = $this->renderBody($rec);
                    $options['headers'] =$this->renderHead($rec);
                    $options['body'] = $bodyData;
                }

                // Perform the request
                $response = $this->fetchUrl($url, $options);

                // Return the response if successful
                return $response;
            } catch (Exception $err) {
                // Handle any exceptions during the API request
                echo "✗  Processing {$method} request: " . $err->getMessage() . "\n";
                return false;
            }
        } else {
            // Handle unsupported methods
            echo "✗  Unsupported HTTP method: {$method}\n";
            return false;
        }
    } catch (Exception $err) {
        // Handle errors when constructing the API route
        echo "✗  Building API route: " . $err->getMessage() . "\n";
        return false;
    }
}

protected function runInternalRecource(array $rec): bool {
    // when relying on other APIs than gaia calls, then internally using systems.apiprefix
    if (in_array($rec['systemName'], ['apiv1', 'vivalibrocom', 'admin'])) {
        $rawurl = $rec['endpoint'];
    } else {
        $rawurl = $rec['apiprefix'] . $rec['endpoint'];
    }
    try {
       $method = $rec['method'];
       $path = $rec['apiprefix'].$rec['endpoint'];
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

public function upsertAction(array $actionGrpData, array $actionData): array|bool{
    try {
        $name = $actionGrpData['name'];
        $description = $actionGrpData['description'];
        $base = $actionGrpData['base'];
        $meta = $actionGrpData['meta'] ?? null;

        $actionGrpId = $this->db->inse("gen_admin.actiongrp",['name' => $name, 'description' => $description, 'base' => $base, 'meta' => $meta]);
        if (!$actionGrpId) {
            throw new Exception('Error inserting actiongrp');
        }

        $actionId = $this->db->inse("gen_admin.action",['name' => $actionData['name'],
                                                               'systemsid' => $actionData['systemsid'] ?? 3,
                                                               'actiongrpid' => $actionGrpId,
                                                               'endpoint' => $actionData['endpoint'],
                                                   ]);
        return [
            'actiongrpid' => $actionGrpId,
            'actionid' => $actionId,
        ];
    } catch (Exception $error) {
        return "Error adding action: " . $error->getMessage() . "\n";
    }
}

}