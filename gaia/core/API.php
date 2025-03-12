<?php
namespace Core;
use Swagger\Annotations as SWG;
use ReflectionMethod;
use Symfony\Component\Security\Core\Security;
/*
 * API CLASS
 TODO Use a library like symfony/rate-limiter or implement a simple counter in Redis.
 * */

class API extends Gaia{
	 use Action, My, Media, Tree, Form, Domain, Cubo, Lang, Manifest;
   private $security;

   public function __construct() {
             parent::__construct();
      }

 protected function handleRequest() {
    if ($this->isApiRequest()) {
        $this->log("Incoming API request: " . json_encode($_REQUEST), 'info');
        $this->startAPI();
    } elseif ($this->isXHRRequest()) {
        $this->log("Incoming XHR request: " . json_encode($_REQUEST), 'info');
        $this->handleXHRRequest();
    } elseif ($this->isCuboRequest()) {
        $this->log("Incoming Cubo request: " . json_encode($_REQUEST), 'info');
        $this->handleCuboRequest();
    } elseif ($this->isWorkerRequest()) {
        $this->log("Incoming Worker request: " . json_encode($_REQUEST), 'info');
        $this->handleWorkerRequest();
    }
    }

  protected function startAPI() {
         $response = $this->response();
        echo json_encode($response, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
     }


 protected function executeActionMethod($request): array {
   $response=[];
   if (method_exists($this, $this->id)) {
          // Use reflection to get method signature
          $reflection = new ReflectionMethod($this, $this->id);
          $parameters = $reflection->getParameters();

        if($this->method=='POST'){
          // Determine the number of parameters and their types
          if (count($parameters) == 1 && $parameters[0]->getType() && $parameters[0]->getType()->getName() === 'array') {
              // If method expects a single array parameter
              $execute = $this->{$this->id}($request);
          } else {
              // Otherwise, spread array values as arguments
             $execute = $this->{$this->id}($request);
                // Otherwise, spread array values as arguments
                       //      $execute = $this->{$this->id}(...array_values($request));
          }
         }else{
      //  $execute = $this->{$this->id}(...array_values($request));
        // Execute for non-POST requests, passing $request as a single string or array as appropriate
          $execute = $this->{$this->id}($request); // Pass as a single string
         }
     //one more step to response is to return the state of plan or the whole plan 2 more levels
     if (count($execute)==1){
          $response['data'] = $execute;
          $response["status"] = 200;
          $response["success"] = true;
          $response["code"] = 'RUN_1';
          return $response;
     }else{
          $response['data'] = $execute;
          $response["status"] = 200;
          $response["success"] = true;
          $response["code"] = 'RUN_MANY';
          return $response;
     }
     //response

      } else {
          // Method not found
          $response = [
              "status" => 403,
              "success" => false,
              "code" => 'ACTION',
              "error" => "Method not found"
          ];
      }
      return $response;
 }

 protected function log($message, $level = 'info') {
     error_log("[$level] $message");
 }
protected function sanitizeInput($input) {
    if (is_array($input)) {
        // Recursively sanitize arrays
        return array_map([$this, 'sanitizeInput'], $input);
    }
    // Do minimal sanitization, such as trimming
    return trim($input);
}
protected function parseRequest() {
    $this->method = $_SERVER['REQUEST_METHOD'];
    $this->resource = $_GET['resource'] ?? null;

    $request = [];
    switch ($this->method) {
        case 'GET':
            $request = $this->sanitizeInput($_GET);
            break;
        case 'POST':
        case 'PUT':
        case 'PATCH':
            $rawInput = file_get_contents('php://input');
            $request = $this->sanitizeInput(json_decode($rawInput, true) ?? []);
            break;
        case 'DELETE':
            $request = $this->sanitizeInput($_GET);
            break;
        default:
            $request = false;
    }

    return $request;
}
 protected function response(){
        $request = $this->parseRequest();
        //THE RESPONSE
       if (!$request){
            $execute=["status"=>418,"code"=>'M01'];
            $execute['success']=false;
       }elseif (empty($this->resource)){
            $execute['status']=200;
            $execute['success']=true;
            $execute['data']=["Welcome to API!"];
         } else {
            $token=base64_encode('nikos:130177'); //read token from db bXlzZWNyZXR0b2tlbjE3
            $executed= $this->executeAPI($request);
           }
            header("HTTP/2 $status $status_message");
            header("Content-Type: application/json; charset=UTF-8");
            $response = $executed;
            $response['status_message'] = $this->status_message[$response['status']];
            $response['method'] = $this->method;
            $response['code'] =$executed['code'];
            $response['resource'] =$this->resource;
            $response['id'] =$this->id;
            $response['request'] =$request;
            $response['data']=$executed['data'];
            return $response;
    }
/**
LOCAL METHOD - GET THE EXPECTED TYPEOF
            if (method_exists($this, $this->id)) {
                if($this->method=='POST'){
                    $execute=$this->{$this->id}(...array_values($request));
                    //or
                 //   $execute=$this->{$this->id}($request);
              }elseif($this->method=='GET'){
                    $execute = $this->{$this->id}(...array_values($request));
               //     $execute = $this->{$this->id}($request);
              }
              $response =["status"=>200,"success"=>true,"code"=>'LOCAL','data'=>$execute,'error'=>$execute['error']];
            }else{
            $response =["status"=>403,"success"=>false,"code"=>'LOCAL','data'=>$execute,'error'=>"Method {$this->id} not found"];
            }
 */
protected function executeLocalMethod($request): array {
        // Use reflection to get method signature
        $reflection = new ReflectionMethod($this, $this->id);
        $parameters = $reflection->getParameters();

        // Determine how to pass arguments based on method signature
        if ($this->method === 'POST' && count($parameters) == 1 && $parameters[0]->getType() && $parameters[0]->getType()->getName() === 'array') {
            // If method expects a single array parameter
            $execute = $this->{$this->id}($request);
        } else {
            // Otherwise, pass the request as a single argument
            $execute = $this->{$this->id}($request);
        }

        return [
            "status" => 200,
            "success" => true,
            "code" => 'EXECUTED',
            "data" => $execute,
            "error" => $execute['error'] ?? null
        ];
}

/**
 Plan Actionplan Action
 */
protected function executeBinMethod($request): array {
  $response=[];
        if($this->id!=''){
      //id icludes the extension
          if(file_exists(API_ROOT . "bin/". $this->method."/".$this->id)){
                require_once API_ROOT. "bin/". $this->method."_".$this->id;
            //any file icludes the extension is an action GET , ?file= param the absolute path
             }elseif($this->id=="getfile" && $this->method=="GET" && isset($_GET["file"])){
              $file = $this->sanitizeInput($_GET['file']);
                $data= $this->include_buffer($file);
                 $response= ['status' => 200,'success' => 'true','code' => 'D1','data' => $data];
             //action is called => get a method , like maria or admin
             }elseif($this->action!=''){

             }else{
                $response= ['status' => 403,'success' => 'true','code' => 'D0','data' => [],'error'=>''];
             }
         }else{
            foreach(glob(API_ROOT. "bin/*") as $file){
                $list[]= basename($file);
            }
            $response= ['status' => 203,'success' => 'true','code' => 'D2','data' => $list];
         }
     return $response;
}

protected function executeMariaMethod($request): array {
  $response=[];
            if($this->method=='POST'){
                $database = $this->db;
                if ($database && method_exists($database,$this->id)) {  //id is the method of the class
                    //if decoding was successful
                    $execute=$database->{$this->id}(...array_values($request));
                     $this->log("Database method executed: {$this->id}", 'info');
                    if(!$execute){
                    $response =["status"=>400,"success"=>false,"code"=>'M01','error'=>"Method not executed"];
                    }else{
                    $response =["status"=>200,"success"=>true,"code"=>'M1',"data"=> $execute,'error'=>""];
                    }
                } else {
                  $response =["status"=>419,"success"=>false,"code"=>'M2',"error"=>""];
                 }
             }elseif($this->method=='GET'){

                $database = $this->db;
                            if ($database && method_exists($database,$this->id)) {  //id is the method of the class
                                //if decoding was successful
                                $params=$request;
                                unset($params['resource']);
                                unset($params['id']);
                                unset($params['action']);
                     //                       error_log(print_r($params, true));
                                $execute=$database->{$this->id}(...array_values($params));
                                if(!$execute){
                                $response =["status"=>400,"success"=>false,"code"=>'M01','error'=>"Method not executed"];
                                }else{
                                $response =["status"=>200,"success"=>true,"code"=>'M1',"data"=> $execute,'error'=>""];
                                }
                            } else {
                                $methods=[];
                                $dbClass = get_class($this->db);
                                foreach (get_class_methods($this->db) as $method) {
                                    $methods[$method] = "$method ($dbClass)";
                                }
                              $response =["status"=>203,"data"=>$methods,"success"=>true,"code"=>'M2',"error"=>"Index of available methods"];
                              //show the list of available methods

             }
                    //$response =["status"=>204,"success"=>false,"code"=>'M02','error'=>'Empty']; //create hook params, if needed empty for now
             }
         return $response;
}
    protected function executeAPI($request) {
        $handlers = [
            'maria' => 'executeMariaMethod',
            'run' => 'executeActionMethod',
            'local' => 'executeLocalMethod',
            'bin' => 'executeBinMethod'
        ];

        if (isset($handlers[$this->resource])) {
            return $this->{$handlers[$this->resource]}($request);
        }

        return $this->formatErrorResponse(404, 'Z', 'Resource not found');
    }

public function start_Swagger() {
    // 1. Generate OpenAPI spec
    $openapiSpec = $this->getSwaggerDocs();

    // 2. Include the Swagger UI library
    echo '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">';
    echo '<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>';

    // 3. Initialize Swagger UI in JavaScript (using the specification)
    echo '<script>
            window.onload = function() {
                SwaggerUIBundle({
                    spec: ' . json_encode($openapiSpec) . ',
                    dom_id: "#swagger-ui",
                    presets: [
                        SwaggerUIBundle.presets.apis
                    ]
                });
            };
          </script>';

    // 4. Add a container for Swagger UI
    echo '<div id="swagger-ui"></div>';
}

protected function getSwaggerDocs(): ?array {
    static $cachedDocs = null;
    if ($cachedDocs !== null) {
        return $cachedDocs;
    }
    try {
        $swagger = \Swagger\scan('./apiv1');
        $swaggerFile = './apiv1/swagger.json';
        if (!file_exists($swaggerFile)) {
            $swagger->saveAs($swaggerFile);
        }
        $jsonContent = file_get_contents($swaggerFile);
        $cachedDocs = json_decode($jsonContent, true);
        return $cachedDocs;
    } catch (Exception $e) {
        error_log("Error generating or reading OpenAPI spec: " . $e->getMessage());
        return null;
    }
}
}