<?php
namespace Core;
use Swagger\Annotations as SWG;
use ReflectionMethod;
    /*
     * API CLASS
     * */

class API extends Gaia{
	 use My;
	 use Media;
	 use Tree;
	 use Form;
	 use Domain;

protected $gpm;

   public function __construct() {
             parent::__construct();
      //       $this->gpm=new Maria('gpm');
         }

 public function handleRequest() {
if ($this->isApiRequest()) {
   // Now calls isApiRequest() from Gaia
      $this->startAPI();
   //  } else
	if ($this->isXHRRequest()) {
               $this->handleXHRRequest();

       } else if($this->isCuboRequest()){
          $this->handleCuboRequest();

        } else if($this->isWorkerRequest()){
                $this->handleWorkerRequest();
        }
//		else{
        // VL-specific normal request handling:
  //      if ($_SERVER['SYSTEM'] == 'admin') {

    //        $this->adminUI_router();
      //  }
	  //else{
         //   $this->publicUI_router();
     //      }
        }
    }
protected function class_use(){
        $methods = get_class_methods($this); // Gets class methods

        // Include methods from traits explicitly
        $traits = class_uses($this);  // Get traits used in this class
        foreach ($traits as $trait) {
            $traitMethods = get_class_methods($trait);
            if ($traitMethods) {
                foreach ($traitMethods as $traitMethod) {
                    $methods[$traitMethod] = $trait;  // Store method with trait name
                }
            }
        }
        // Capture methods from parent class
        $parentClass = get_parent_class($this);
        if ($parentClass) {
            $parentMethods = get_class_methods($parentClass);
            if ($parentMethods) {
                foreach ($parentMethods as $parentMethod) {
                    $methods[$parentMethod] = $parentClass;  // Store method with parent class name
                }
            }
        }
        return $methods;
    }


  protected function startAPI() {
         $response = $this->response();
        echo json_encode($response, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
     }

protected function testapi($params=[]): array{
    return ["status"=>200,"success"=>TRUE,"code"=>'TEST','error'=>'tESTEmpty','data'=>['data test']]; //create hook params, if needed empty for now
}

 protected function response(){
       $this->method = $_SERVER['REQUEST_METHOD'];
       $this->resource = $_GET['resource'] ?? null;
        foreach($_REQUEST as $key =>$value){
            $this->G[$key]=$value;
        }

       $response = array();
       $execute = array();
       //THE REQUEST
       if($this->method=='GET'){
            $request = $_GET;

        } elseif($this->method=='POST'){
        // Decode the JSON data from raw input
            $rawinput = file_get_contents('php://input');
            if(!is_json($rawinput)){
            $request=false;
            }else{
            $request = json_decode($rawinput, true);
            }

        } else {
            $request = false;  // Unsupported HTTP method
        }

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
            $response['success'] = $executed['success'];
            $response['status'] = $executed['status'];
            $response['error'] = $executed['error'];
            $response['status_message'] = $this->G['status_message'][$response['status']];
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
         $response = [
             "status" => 200,
             "success" => true,
             "code" => 'LOCAL',
             "data" => $execute,
             "error" => $execute['error'] ?? null
         ];
     } else {
         // Method not found
         $response = [
             "status" => 403,
             "success" => false,
             "code" => 'LOCAL',
             "error" => "Method {$this->id} not found"
         ];
     }
     return $response;
}
/*
primary executes A) maria methods IN post
    B) REST logic /resource=table/id/
    --- extend to webhooks and clevel resources for Kafka use
    C) files if exist in apiv1/bin folder/method/
    3rd LEVEL supported in nginx TODO...
*/
    protected function executeAPI($request)   {
//A maria fast methods gs.maria.[anydatabase].fa
//                     gs.maria.[this->id].[this->action]
      $response=[];
     if($this->resource=="maria" || $this->resource=="admin"){
            if($this->method=='POST'){
                $database = $this->resource=='maria' ? $this->db : $this->admin;
                if ($database && method_exists($database,$this->id)) {  //id is the method of the class
                    //if decoding was successful
                    $execute=$database->{$this->id}(...array_values($request));
                    if(!$execute){
                    $response =["status"=>400,"success"=>false,"code"=>'M01','error'=>"Method not executed"];
                    }else{
                    $response =["status"=>200,"success"=>true,"code"=>'M1',"data"=> $execute,'error'=>""];
                    }
                } else {
                  $response =["status"=>419,"success"=>false,"code"=>'M2',"error"=>""];
                 }
             }elseif($this->method=='GET'){
             $response =["status"=>204,"success"=>false,"code"=>'M02','error'=>'Empty']; //create hook params, if needed empty for now
             }
//B CALL ANY METHOD resource/id ? params&hooks
     }elseif($this->resource=='classuse'){
     $execute=$this->class_use();
    $response =["status"=>200,"success"=>true,"code"=>'V','data'=>$execute,'error'=>$execute['error']];

     }elseif($this->resource=='viewport'){
      $methods = get_class_methods($this);
                 $methodDetails = [];
                 foreach ($methods as $method) {
                     $reflection = new \ReflectionMethod($this, $method);
                     $declaringClass = $reflection->getDeclaringClass()->getName();
                     $methodDetails[$method] = $declaringClass;
                 }
             $execute=$methodDetails;
    	//     $execute = $this->localMethod($request);
    	//     $execute = get_class_methods($this);
            $response =["status"=>200,"success"=>true,"code"=>'V','data'=>$execute,'error'=>$execute['error']];
            //$response =["status"=>200,"success"=>true,"code"=>'V','data'=>["mydata"],'error'=>['noerror']];

//TERASTIO get the expect typeof $params
     }elseif($this->resource =='local'){
       $response= $this->executeLocalMethod($request);

//C REST TYPE resource/id ? params&hooks
     }elseif(in_array($this->resource,$this->db->listTables())){
         $table= $this->resource;
         if($this->id==""){
             $response['status']=200;
             $response['code']='R1';
             $response['error']='';
             $response['success']=true;
             $response['data']= $this->db->fa("SELECT * FROM $table LIMIT 20");
         }else{
         $response['status']=200;
         $response['code']='R2';
         $response['error']='';
         $response['success']=true;
         $response['data']= $this->db->f("SELECT * FROM $table WHERE id=?",array($this->id));
         }
//C FILE IN api/bin with $data variable of the the return ,gets files in bin, or any file
      }elseif($this->resource=="bin" && $this->id!=''){
      //id icludes the extension
          if(file_exists(APIROOT . "bin/". $this->method."/".$this->id)){
                require_once APIROOT. "bin/". $this->method."/".$this->id;
            //any file icludes the extension is an action GET , ?file= param the absolute path
             }elseif($this->id=="getfile" && $this->method=="GET" && isset($_GET["file"])){
             $file=urldecode($_GET["file"]);
                $data= $this->include_buffer($file);
                 $response= ['status' => 200,'success' => 'true','code' => 'F1','data' => $data];
             //action is called => get a method , like maria or admin
             }elseif($this->action!=''){

             }else{
                $response= ['status' => 403,'success' => 'true','code' => 'F0','data' => [],'error'=>''];
             }
     }else{
           $response['status']=419;
         $response['code']='Z';
         $response['success']=false;
          $response['error']='';
     }
        return $response;
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

 public function getSwaggerDocs(): ?array {
        try {
            $swagger = \Swagger\scan('./apiv1');

            // 1. Generate the swagger.json file (if it doesn't exist)
            $swaggerFile = './apiv1/swagger.json';
            if (!file_exists($swaggerFile)) {
                $swagger->saveAs($swaggerFile);
            }
            // 2. Read the swagger.json file
            $jsonContent = file_get_contents($swaggerFile);

            // 3. Decode the JSON content into an array
            $openapiSpec = json_decode($jsonContent, true);

            return $openapiSpec;
        } catch (Exception $e) {
            // Handle errors (log, throw exception, etc.)
            error_log("Error generating or reading OpenAPI spec: " . $e->getMessage());
            return null;
        }
    }
}