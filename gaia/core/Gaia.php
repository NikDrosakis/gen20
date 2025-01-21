<?php
namespace Core;
use Parsedown;
use DOMDocument;

abstract class Gaia {
 use Tree;
	 protected $db;
	 protected $publicdb;
     protected $mon;
	protected $redis;

	 protected $gsolr;
	 protected $resource;
	protected $dom;
    protected $metadata= [];
	protected $parsedown;
//api
    protected $response = [];
    public $verb;
    public $method;
    public $endpoint;
//other
    public $connect;
    public $agent;
    public $tax; //instantiate Taxonomy Class
    public $conf;
    public $confd;
    public $apages;
    public $G;
    public $me;
    public $fullname;
    public $img;
    public $WIDGETURI;
    public $MAINURI;
    public $LOC;
    public $LIB;
    public $IMG;
    public $TEMPLATE ;
    public $ADMIN_ROOT;
    public $CUBO_ROOT;
    public $MEDIA_ROOT;
    public $SYSTEM;
    public $SITE_ROOT;
    public $SITE_URL;
//url levels
    public $id;
    public $userid;
    public $page; //1st url level
    public $sub; //2nd url level
    public $action;
    public $mode;

    public $subs;
    public $icons;
    public $usergrps;
    public $is;	
    public $aconf;
    public $layout_array;
    public $notification_file= "/var/www/gs/cubos/notificationweb/public.php";
    public $chat_file= "/var/www/gs/admin/compos/chat_panel.php";

    public function __construct() {
	include "_config.php";
	include "_generic.php";
        /*****
         * START MARIADB in ABSTRACTED GAIA
         *****/
         //xecho(TEMPLATE);
          $this->G['publicdb'] = $this->publicdb = "gen_".TEMPLATE;
         $this->db = new Mari();
            //mongo db instantiate
              $this->mon = new Mon('vox');
                //solr instantiate
               // $this->gsolr = new GSolr('solr_vivalibro');
                //redis instantiate
                $this->redis=new Gredis("1");


        $this->G['loggedin'] = !empty($_COOKIE['GSID']);
        $this->G['me'] = $_COOKIE['GSID'];
        if ($this->G['loggedin']) {
            $this->G['my'] = $this->db->f("SELECT * from {$this->publicdb}.user where id=?", [$_COOKIE['GSID']]);
            $this->me = $this->G['my']['id'];
            $this->img = "/media/" . $this->G['my']['img'];
        }
		//$this->G['is'] = $this->redis->get("is");
		//if(!$this->G['is']){        
        $this->G['is'] = $this->db->flist("SELECT name, val from gen_admin.globs");
        $this->G['set'] = $this->db->flist("SELECT name, val from {$this->publicdb}.setup");
		//$this->redis->set("is",$this->G['is']);
		//}
        $this->G['usergrps'] = $this->db->flist("SELECT id, name FROM {$this->publicdb}.usergrp");

//all $this->G to local variables
        foreach ($this->G as $gkey => $gval) {
		if (property_exists($this, $gkey)) {
			$this->$gkey = $gval;
		}
        }

        $this->G['pagelist'] = $this->db->flist("SELECT id, name FROM gen_admin.admin_page");
        $this->G['subparent'] = $this->db->flist("SELECT admin_sub.name, admin_page.name as parent
        FROM gen_admin.admin_sub
        LEFT JOIN gen_admin.admin_page on admin_sub.admin_pageid=admin_page.id");

        if ($this->G['SYSTEM']=='admin'){
        $this->G['has_maria'] = $this->has_maria($this->sub);
        } elseif($this->G['SYSTEM']==$this->G['TEMPLATE']){
        $this->G['has_maria'] = $this->has_maria($this->page);
        }
       // Handle requests (delegated to child classes)
        $this->handleRequest();
    }
	abstract protected function handleRequest();


    protected function isCuboRequest(): bool {
        return $this->SYSTEM=== 'cubos';
    }

    protected function isWorkerRequest(): bool {
        return isset($_GET['isWorkerRequest']) && $_GET['isWorkerRequest'] === 'true';
    }
    protected function isXHRRequest(): bool {
            return (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
                   strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest');
    }
    // API Interaction Methods
     protected function isApiRequest(): bool {
            // Check if the request is made to the /api path
            return strpos($_SERVER['REQUEST_URI'], '/api') === 0;
    }

//https://vivalibro.com/cubos/index.php?cubo=menuweb&file=public.php
protected function handleCuboRequest(): void {
    // Define the root directory for cubos
    $cubosRoot = CUBO_ROOT;
    // Retrieve and sanitize the file path parameters
    $cubo = basename($_GET['cubo'] ?? '');
    $file = basename($_GET['file'] ?? '');
    // Construct the full file path
    $filePath = $cubosRoot . '/' . $cubo . '/' . $file;
    // Check if the file exists and is within the expected directory
    if (file_exists($filePath) && strpos(realpath($filePath), realpath($cubosRoot)) === 0) {
        include $filePath;
    } else {
        // Handle the error if the file is not found or is not valid
        http_response_code(404);
        echo '<div class="error">File not found or access denied.</div>';
    }
}
/*
Using non blocking features of web worker
to be updated to $_post AND json content
 */
  protected function handleWorkerRequest():void{
   try {
          // Start output buffering with gzip compression if supported
           $buffer='';
          ob_start();
          // Not necessary params
         $a = $_REQUEST['a'] ?? null;
        $b = $_REQUEST['b'] ?? $_GET['b'] ?? null;
        $c = $_REQUEST['c'] ?? $_GET['c'] ?? null;
        $d = $_REQUEST['d'] ?? $_GET['d'] ?? null;
        $file = isset($_REQUEST['file']) ? $_REQUEST['file'].".php":  ($this->SYSTEM=='admin' ? $this->ADMIN_ROOT."xhr.php" : $this->SITE_ROOT."ajax.php");
        $loop = isset($_REQUEST['loop']) ? json_decode($_REQUEST['loop'],true): '';

          // Include the specified file
          if (file_exists($file . '.php')) {
              include $file . '.php';
          } else {
              $buffer = "File not found: " . htmlspecialchars($file);
          }
          // Capture HTML content
          $buffer = ob_get_clean();
      } catch (Exception $e) {
          // Handle exception and set error in buffer
          $buffer = $e->getMessage();
      }
      //HTML content
    header('Content-Type: text/html');
    echo $buffer;
    }

protected function renderCubo(string $name): string {
         $cubo = $this->db->fa('SELECT * FROM gen_admin.cubo WHERE name=?',[$name]);
         $uri=CUBO_ROOT.$name."/public.php";
         return $this->include_buffer($uri);
}
/**
page & subpage metadata
create list of metadata to Action
*/
protected function getPageMetatags(): array {
    // Initialize an empty string for concatenation
    $metaString = $this->page;

    // Check if the system is 'admin'
    if ($this->SYSTEM == 'admin') {
        // ADMIN SYSTEM
        if (!empty($this->sub)) {
            // ADMIN SUBPAGE
            $metaString .= ',' . $this->sub;

            // Add metadata based on the type of admin subpage
            if ($this->db_sub['type'] == 'table') {
                $db = $_SERVER['SYSTEM']=='admin' ? "gen_admin" : $this->publicdb;
                $meta = $this->db->f("SELECT meta FROM {$db}.metadata WHERE name = ?", [$this->sub]);
            } else {
                $meta = $this->db->f("SELECT meta FROM gen_admin.admin_sub WHERE name = ?", [$this->sub]);
            }

            // Append comma-separated meta if found
            if ($meta) {
                $metaString .= ',' . $meta['meta'];
            }
        } else {
            // MAIN ADMIN PAGE
            $meta = $this->db->f("SELECT meta FROM gen_admin.admin_page WHERE name = ?", [$this->page]);
            if ($meta) {
                $metaString .= ',' . $meta['meta'];
            }
        }
    } else {
        // PUBLIC SYSTEM
             $db = $_SERVER['SYSTEM']=='admin' ? "gen_admin" : $this->publicdb;
        if (!empty($this->page)) {
            // PUBLIC PAGE
            $meta = $this->db->f("SELECT meta FROM {$this->publicdb}.main WHERE name = ?", [$this->page]);
        } else {
            // PUBLIC MAIN PAGE
            $meta = $this->db->f("SELECT meta FROM {$db}.metadata WHERE name = ?", [$this->page]);
        }

        // Append comma-separated meta if found
        if ($meta) {
            $metaString .= ',' . $meta['meta'];
        }
    }

    // Explode by commas, trim each tag, filter out empty elements, and wrap in HTML
    $tags = array_filter(array_map('trim', explode(',', $metaString)));
    return $tags;
}



/**
Render metadata of all levels
 */
protected function renderMetadata(): array {
    // 1st level metadata
    $firstLevel = $this->G['is']['meta_title_en'] ?? null;

    // 2nd level metadata
    $secondLevel = $this->getPageMetadata();

    // 3rd level metadata
    $thirdLevel = $this->metadata;

    // Collect all metadata into a single array
    $res = [];

    // Add each level of metadata if it exists
    if ($firstLevel) {
        $res[] = $firstLevel;
    }
    if (!empty($secondLevel)) {
        $res = array_merge($res, (array) $secondLevel); // Ensure it's an array and merge
    }
    if (!empty($thirdLevel)) {
        $res = array_merge($res, (array) $thirdLevel);
    }

    // Return comma-separated metadata or a default message
    return $res;
}

protected function md_decode(string $markdownContent): string{
    $parsedown = new Parsedown();
    $htmlContent = $parsedown->text($markdownContent);
    return $htmlContent;
}
protected function parse_systems_md($systems_content) {
    // Split content by lines
    $lines = explode(PHP_EOL, $systems_content);

    $systems = [];
    $current_system = '';

    foreach ($lines as $line) {
        $line = trim($line);

        // If the line is a headline (system title)
        if (strpos($line, '##') === 0) {
            // Extract the title
            $current_system = trim(substr($line, 2));
            $systems[$current_system] = []; // Initialize with empty array
        }

        // If the line is a system description (starts with a number and a parenthesis)
        elseif (preg_match('/^\d+\)/', $line)) {
            if (!empty($current_system)) {
                // Extract system description (split by ':')
                list($system_name, $system_description) = explode(':', $line, 2);
                $systems[$current_system][] = [
                    'name' => trim($system_name),
                    'description' => trim($system_description)
                ];
            }
        }
    }

    return $systems;
}
/**
add switch-on param
*/
protected function include_buffer(string $file, array $sel = [], array $params = []) {
    // Get the file extension
    $extension = pathinfo($file, PATHINFO_EXTENSION);
    // Handle PHP files with output buffering
    if ($extension === 'php') {
        if (ob_get_level()) {
            ob_end_clean(); // Clears existing buffer
        }
        ob_start();
        // Include the file
        include $file;

        $output = ob_get_clean(); // Capture the output
        flush(); // Ensure all output is flushed
        return $output;
    }

    // Handle Markdown files
    elseif ($extension === 'md') {
        $buffer = file_get_contents($file);
        $parsedown = new Parsedown();
        return $parsedown->text($buffer);
    }

    // Handle HTML files
    elseif ($extension === 'html') {
        $buffer = file_get_contents($file);
        return $buffer;
    }

    // Handle JSON files
    elseif ($extension === 'json') {
        $buffer = file_get_contents($file);
        return $buffer;
    }

    // Default: return raw content for unsupported formats
    else {
        return file_get_contents($file);
    }
}
/**
Handle XHR request.
*/
     protected function handleXHRRequest(): void {
        // Example: Route the request to a specific method based on a parameter
        $a = $_REQUEST['a'] ?? null;
        $b = $_POST['b'] ?? $_GET['b'] ?? null;
        $c = $_POST['c'] ?? $_GET['c'] ?? null;
        $d = $_POST['d'] ?? $_GET['d'] ?? null;
        // CUSTOM FILE ELSE DEFAULT AJAX.PHP FOR PUBLIC AND XHR FOR ADMIN
        $file = isset($_REQUEST['file']) ? $_REQUEST['file'].".php":  ($this->SYSTEM=='admin' ? $this->ADMIN_ROOT."xhr.php" : $this->SITE_ROOT."ajax.php");

		if ($file && file_exists($file)) {

        try {
            include $file;
        } catch (Exception $e) {
            error_log("Error including file: " . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()]);
        }
        } else {
            error_log("File not found: " . $file);
            echo json_encode(['error' => "File not found: " . $file]);
        }
    }

/**
db-centric
checks db gen_admin.admin_sub for details of admin page
if
 */
    protected function has_maria(string $name='') {
        if ($this->G['SYSTEM']=='admin'){
         $name = $name!='' ? $name : $this->sub;
         $has_maria = $this->db->f("SELECT has_maria FROM gen_admin.admin_sub WHERE name=?",[$name])['has_maria'];
        } elseif($this->G['SYSTEM']==$this->G['TEMPLATE']){
         $name = $name!='' ? $name : $this->page;
         $has_maria = $this->db->f("SELECT has_maria FROM {$this->publicdb}.main WHERE name=?",[$name])['has_maria'];
        }
        if($has_maria){
           return $has_maria;
        }else{
        return false;
        }
    }
    protected function catch_errors(){
          //CATCH PHP FATAL ERROR
            set_error_handler(function($errno, $errstr, $errfile, $errline) {
                if (error_reporting() & $errno) {
                    // Handle fatal errors (E_ERROR, E_PARSE, etc.)
                    if (in_array($errno, [E_ERROR, E_PARSE, E_COMPILE_ERROR, E_CORE_ERROR])) {
                        error_log("Fatal Error: [$errno] $errstr - File: $errfile, Line: $errline");
                        http_response_code(500); // Send a 500 Internal Server Error
                        // Optionally, include a minimal error message in the response:
                        echo "An error has occurred. Please try again later.";
                      //  exit; // Stop further execution
                    } else {
                        // ... handle other error types ...
                        echo "I try hard other cases.";
                    }
                }
            });
    }

protected function getClassMethods() {
    $methods = [];

    // Get methods from the current class
    $currentClass = get_class($this);
    foreach (get_class_methods($currentClass) as $method) {
        $methods[$method] = "$method ($currentClass)";
    }

    // Include methods from traits used in this class
    $traits = class_uses($this);
    foreach ($traits as $trait) {
        foreach (get_class_methods($trait) as $traitMethod) {
            $methods[$traitMethod] = "$traitMethod ($trait)";
        }
    }

    // Capture methods from parent classes and their traits
    $parentClass = get_parent_class($this);
    while ($parentClass) {
        foreach (get_class_methods($parentClass) as $method) {
            if (!isset($methods[$method])) {
                $methods[$method] = "$method ($parentClass)";
            }
        }

        // Include methods from traits used in the parent class
        $parentTraits = class_uses($parentClass);
        foreach ($parentTraits as $parentTrait) {
            foreach (get_class_methods($parentTrait) as $traitMethod) {
                if (!isset($methods[$traitMethod])) {
                    $methods[$traitMethod] = "$traitMethod ($parentTrait)";
                }
            }
        }

        // Move up to the next parent
        $parentClass = get_parent_class($parentClass);
    }

    // Get methods from the $this->db object if it's an object
    if (isset($this->db) && is_object($this->db)) {
        $dbClass = get_class($this->db);
        foreach (get_class_methods($this->db) as $method) {
            $methods[$method] = "$method ($dbClass)";
        }
    }

    // Sort methods alphabetically by method name
    ksort($methods);

    return $methods;
}


	//globs table
	public function is(string $name): bool|string{
		$fetch = $this->db->f("SELECT val FROM gen_admin.globs WHERE name=?", array($name));
		if (!empty($fetch)) {
			return urldecode($fetch['val']);
		} else {
			return false;
		}
	}
//setup table
public function setup($name = '', $value = ''): bool|string {
$table="{$this->publicdb}.setup";
    if ($value !== '') {
        // Update the value for the given name
        $fetch = $this->db->q("UPDATE $table SET val=? WHERE name=?", [$value, $name]);
        return $fetch !== false; // Return true or false depending on the success
   }elseif ($name == '') {
                // Fetch all name-value pairs from setup
                $fetch = $this->db->flist("SELECT name, val FROM $table");
                return $fetch !== false ? $fetch : '';
    } elseif (strpos($name, '*') !== false) {
        // Fetch all values with names starting with the given pattern
        $fetch = $this->db->flist("SELECT val FROM $table WHERE name LIKE ?", [str_replace('*', '%', $name)]);
        return $fetch !== false ? $fetch : '';
    } else {
        // Fetch a single value for the given name
        $fetch = $this->db->f("SELECT val FROM $table WHERE name=?", [$name]);
        return $fetch !== false ? urldecode($fetch['val']) : '';
    }
}

}