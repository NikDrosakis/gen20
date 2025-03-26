<?php
namespace Core;
use Parsedown;
use Exception;
use DOMDocument;

abstract class Gaia {
protected $db;
protected $publicdb;
// protected $mon;  // This is commented out, so no need to include it.
protected $redis;
protected $resource;
protected $dom;
protected $metadata = [];
protected $parsedown;

// API
protected $response = [];
public $verb;
public $loggedin;
public $method;
public $endpoint;

// Other
public $publisherdefaultimg;
public $logo;
public $writerdefaultimg;
public $connect;
public $time;
public $agent;
public $tax; // Instantiate Taxonomy Class
public $conf;
public $confd;
public $subparent;
public $apages;
public $me;
public $src;
public $href;
public $slug;
public $fullname;
public $img;
public $WIDGETURI;
public $MAINURI;
public $LOC;
public $LIB;
public $TEMPLATE;
public $PAGECUBO;
public $ADMIN_ROOT;
public $MEDIA_ROOT;
public $SYSTEM;
public $SITE_URL;

// URL levels
public $id;
public $userid;
public $page; // 1st URL level
public $sub; // 2nd URL level
public $action;
public $mode;

public $subs;
public $icons;
public $usergrps;
public $is;
public $aconf;
public $layout_array;

public $IMG;
public $GSROOT;
public $GAIAROOT;
public $API_ROOT;
public $SITE_ROOT;
public $BUILD_ROOT;
public $MEDIA_URL;
public $PUBLIC_ROOT;
public $PUBLIC_ROOT_WEB;
public $PUBLIC_IMG_ROOT;
public $PUBLIC_IMG;
public $ADMIN_IMG_ROOT;
public $ADMIN_IMG;
public $ADMIN_URL;
public $REFERER;
public $server;
public $HTTP_HOST;
public $DOMAIN;
public $lang;
public $langprefix;
public $APPSROOT;
public $APPSPATH;
public $globs_types;
public $WIDGETLOCALPATH;
public $WIDGETPATH;
public $WIDGETLOCALURI;
public $MEDIA_ROOT_ICON;
public $CRON;
public $error;
public $authentication;
public $authen;
public $orient;
public $status;
public $privacy;
public $colorstatus;
public $phase;
public $sucolors;
public $action_status;
public $post_status;
public $bool;
public $version;
public $name;
public $greekMonths;

    public function __construct() {
	require "_config.php";
	require "_generic.php";

    $this->db = new Mari();
    //mongo db instantiate
    //   $this->mon = new Mon('vox');
    //redis instantiate
    $this->redis=new Gredis("1");

    $this->publicdb = "gen_".TEMPLATE;
    $this->loggedin = !empty($_COOKIE['GSID']);
    $this->ini = ini_get_all();
    $this->me = $_COOKIE['GSID'] ?? 0;
    $this->my=[];
    if ($this->loggedin) {
    $this->my = $this->db->f("SELECT * from {$this->publicdb}.user where id=?", [$_COOKIE['GSID']]);
    $this->me = $this->my['id'];
    $this->img = "/media/" . $this->my['img'];
    }
    $this->is = $this->db->flist("SELECT name, val from gen_admin.globs");
    $this->set = $this->db->flist("SELECT name, val from {$this->publicdb}.setup");
    $this->usergrps = $this->db->flist("SELECT id, name FROM {$this->publicdb}.usergrp");
    $this->pagelist = $this->db->flist("SELECT id, name FROM {$this->publicdb}.maingrp");
    $this->subparent = $this->db->flist("SELECT main.name, maingrp.name as parent
    FROM {$this->publicdb}.main
    LEFT JOIN {$this->publicdb}.maingrp on main.maingrpid=maingrp.id");

     // Handle requests (delegated to child classes)
        $this->handleRequest();
    }
	abstract protected function handleRequest();

    protected function isCuboRequest(): bool {
        return $this->SYSTEM=== 'cubos';
    }

    protected function isCliRequest(): bool {
        return $this->SYSTEM=== 'cli';
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
    try {
        $file = is_array($file) ? ($file['key'] ?? '') : $file;

        if (!file_exists($file)) {
            throw new Exception("File not found: $file");
        }

        // Get the file extension
        $extension = pathinfo($file, PATHINFO_EXTENSION);

        switch ($extension) {
            case 'php':
                if (ob_get_level()) {
                    ob_end_clean(); // Clears existing buffer
                }
                ob_start();
                include $file;
                $output = ob_get_clean(); // Capture the output
                flush(); // Ensure all output is flushed
                return $output;

            case 'md':
                $buffer = file_get_contents($file);
                $parsedown = new Parsedown();
                return $parsedown->text($buffer);

            case 'html':
            case 'json':
                return file_get_contents($file);

            default:
                return file_get_contents($file);
        }
    } catch (Exception $e) {
        return "Error: " . $e->getMessage();
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
checks db {$this->publicdb}.main for details of admin page
if
 */
    protected function mainplan($name='') {
       $name = is_array($name) ? $name['key'] : ($name !== '' ? $name : $this->page);
        if ($this->SYSTEM=='admin'){
         $name = $name!='' ? $name : $this->page;
         $mainplan = $this->db->f("SELECT * FROM {$this->publicdb}.main WHERE name=?",[$name]);
        } elseif($this->SYSTEM==TEMPLATE || $this->SYSTEM=="api"){
         $name = $name!='' ? $name : $this->page;
         $mainplan = $this->db->f("SELECT * FROM {$this->publicdb}.main WHERE name=?",[$name]);
        }
        if($mainplan){
           return $mainplan;
        }
        return false;
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

protected function getThis() {
return $this;
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

	protected function delRecordFile(string $query, array $params, string $path): void{
	$this->db->q($query,$params);
	unlink($path);
	}

	//globs table
	protected function is(string $name): bool|string{
		$fetch = $this->db->f("SELECT val FROM gen_admin.globs WHERE name=?", array($name));
		if (!empty($fetch)) {
			return urldecode($fetch['val']);
		} else {
			return false;
		}
	}
//setup table
protected function setup($name = '', $value = ''){
   $name = is_array($name) ? $name['key'] : $name;
    $table = "{$this->publicdb}.setup";

    if (strpos($name, '*') !== false) {
             // Fetch all values with names starting with the given pattern
             $fetch = $this->db->flist("SELECT val FROM  $table WHERE tag LIKE '$name%'");
             return $fetch !== false ? $fetch : ''; // Return empty string if no result

    }elseif($value !== '') {
        // Update the value for the given name
        $fetch = $this->db->q("UPDATE $table SET val=? WHERE name=?", [$value, $name]);
        return $fetch !== false; // Return true or false depending on the success

   }elseif($name !='' && $value=='') {
           // Fetch a single value for the given name
           $fetch = $this->db->f("SELECT val FROM $table WHERE name=?", [$name]);
           return $fetch !== false ? urldecode($fetch['val']) : ''; // Return empty string if no result

    } elseif ($name === '' && $value ==='') {
        // Fetch all name-value pairs from setup
        $fetch = $this->db->flist("SELECT name, val FROM $table");
        return $fetch; // Return empty string if no result
    }

}


/**
navigation
*/
protected function navigate() {
    // Fetch data from the database
    $pages = $this->db->fa("SELECT * FROM {$this->publicdb}.maingrp ORDER BY sort");

    // Initialize the navigation structure
    $this->apages = [];

    // Populate the navigation structure
    foreach ($pages as $page) {
        // Extract relevant details
        $slug = $page['name']; // Assuming 'name' corresponds to the desired slug
        $title = ucfirst($page['name']);
        $icon = $page['img']; // Assuming 'img' corresponds to the icon

        // Check if the parent key (like "manage") exists, otherwise create it
        if (!isset($this->apages[$slug])) {
            $this->apages[$slug] = [
                "title" => $title,
                "subs" => [],
                "icon" => $icon
            ];
        }
        // Add sub-navigation if applicable
         $subs = $this->db->fa("SELECT * FROM {$this->publicdb}.main order by sort");
         if(!empty($subs)){
         foreach ($subs as $sub) {
         if($sub['maingrpid']==$page['id']){

          [$cuboname, $main] = explode('.',$sub['name']) + [null, null];
            $this->apages[$slug]['subs'][$sub['name']] = [
                "cubo" => $cuboname,
                "slug" => $sub['name'],
                "main" => $main,
                "icon" => $sub['img'],
                "mode" => $sub['type'] ?? ''
            ];
         }
         }
        }
}
    return $this->apages;
}

}