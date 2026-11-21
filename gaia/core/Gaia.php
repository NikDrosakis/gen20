<?php
namespace Core;
use Parsedown;
use Exception;
use DOMDocument;
use ReflectionClass;

abstract class Gaia {
protected $db;
// protected $mon;  // This is commented out, so no need to include it.
protected $resource;
protected $dom;
protected $metadata = [];
protected $parsedown;


// API
public $redis;
public $apc;
public $publicdb;
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
public $pagelist;
public $set;
public $head;
public $my;
public $parenting_areas;
public $ini;
public $SELF_NONURL;
public $URL_PAGE;
public $QUERY_STRING;
public $GET;
public $CUBO_ROOT;
public $status_message;
public $CURRENT;
public $SELF;
public $URL_FILE;
public $URL;
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
public $ASSET_ROOT;
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
public $env;
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
public $ASSET_IMG_ROOT;
public $ASSET_IMG;
public $ASSET_URL;
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
public $action_status;
public $post_status;
public $bool;
public $version;
public $name;
public $menupages;
public $pages;
public $pagetable;
public $postid;
public $greekMonths;

    public function __construct() {
	require "_config.php";
	require "_generic.php";
    $this->db = new Mari();
    //mongo db instantiate
    //   $this->mon = new Mon('vox');
    //redis instantiate
    $this->redis=new Gredis("1");
    //apcu instanatiate
   // $this->apc=new GAPCU();
    $this->me = isset($_COOKIE['GENUID']) ? (int)$_COOKIE['GENUID'] : 0;
    //$this->my=[];
    //    if ($this->loggedin) {
    $this->my = $this->db->f("SELECT * from {$this->publicdb}.user where id=?", [$_COOKIE['GENUID']]) ?? [];
    $postid = $this->db->f("SELECT id from {$this->publicdb}.post where uri=?", [$this->page]);
    $this->postid = $postid['id'];
    $this->me = $this->my['id'];
    $this->img = "/media/" . $this->my['img'];
    //}

    $this->is = $this->db->flist("SELECT name, val from gen_admin.globs");
    $this->set = $this->db->flist("SELECT name, val from {$this->publicdb}.setup");
    //$this->head = json_encode($this->renderHeadArray(), JSON_UNESCAPED_UNICODE);

    $this->pagetable = $_SERVER['SYSTEM']=='admin' ? "gen_admin.content" : $this->publicdb.".content";
    if($_SERVER['SYSTEM']=='admin'){
    $this->menupages = $this->db->flist("SELECT name, title from {$this->pagetable} WHERE status > 0 ORDER BY sort");
    }else{
    $this->menupages = $this->db->flist("SELECT name, title from {$this->pagetable} WHERE status > 0 ORDER BY sort");
    }
    $this->pages = $this->db->flist("SELECT link, title_{$this->lang} from {$this->pagetable} WHERE status > 0 ORDER BY sort");

    $this->PAGECUBO = $this->pageCP($this->page);

   // $this->usergrps = $this->db->flist("SELECT id, name FROM {$this->publicdb}.usergrp");
   // $this->pagelist = $this->db->flist("SELECT id, name FROM {$this->publicdb}.page");
    //$this->subparent = $this->db->flist("SELECT name,parent FROM {$this->publicdb}.page");
    // Setup exception handler to catch errors in the child classes
    // Handle requests (delegated to child classes)
        $this->handleRequest();
    }

	abstract protected function handleRequest();



    protected function isCuboRequest(): bool {
        return $this->SYSTEM=== 'cubos';
    }

    protected function isCliRequest(): bool {
        return PHP_SAPI === 'cli' || $this->SYSTEM=== 'cli';
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
checks db {$this->publicdb}.page for details of admin page
if
 */
    protected function pageplan($name='') {
       $name = is_array($name) ? $name['key'] : ($name !== '' ? $name : $this->page);
         $name = $name!='' ? $name : $this->page;
         $pageplan = $this->db->f("SELECT * FROM {$this->publicdb}.page WHERE name=?",[$name]);
        if($pageplan){
           return $pageplan;
        }
        return false;
    }

/**
 * Retrieve methods from the current class, its traits, parent classes, and the database object.
 * Optionally filter by a specific namespace for classes and traits.
 *
 * @param string $namespace The namespace to filter methods (optional).
 * @return array List of methods and their associated classes/traits.
 */
protected function getClassMethods($namespace = '') {
    $methods = [];

    // Function to check if a class or trait is within the specified namespace
    $isInNamespace = function($name) use ($namespace) {
        return empty($namespace) || strpos($name, $namespace) === 0;
    };

    // Function to add methods from a given class or trait
    $addMethodsFrom = function($reflection) use (&$methods, $isInNamespace) {
        foreach ($reflection->getMethods() as $method) {
            $methodName = $method->getName();
            $declaringClass = $method->getDeclaringClass()->getName();
            if ($isInNamespace($declaringClass)) {
               $parts = explode('\\', $declaringClass);
               $name = end($parts);
                $methods[$methodName] = $name;
            }
        }
    };

    // Get methods from the current class
    $currentClass = new ReflectionClass($this);
    $addMethodsFrom($currentClass);

    // Include methods from traits used in this class
    foreach ($currentClass->getTraits() as $trait) {
        $addMethodsFrom($trait);
    }

    // Capture methods from parent classes and their traits
    $parentClass = $currentClass->getParentClass();
    while ($parentClass) {
        $addMethodsFrom($parentClass);
        foreach ($parentClass->getTraits() as $trait) {
            $addMethodsFrom($trait);
        }
        $parentClass = $parentClass->getParentClass();
    }

    // Get methods from the $this->db object if it's an object
    if (isset($this->db) && is_object($this->db)) {
        $dbClass = new ReflectionClass($this->db);
        $addMethodsFrom($dbClass);
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
    // Access global config values from gen_admin.globs
    protected function is($name = null){
        if ($name) {
            // Fetch one config by name
            $fetch = $this->db->f("SELECT val FROM gen_admin.globs WHERE name = ?", [$name]);
            return !empty($fetch) ? urldecode($fetch['val']) : false;
        }

        // Fetch all configs as an associative array
        $fetch = $this->db->fa("SELECT name, val FROM gen_admin.globs");
        if (!empty($fetch)) {
            $array = [];
            foreach ($fetch as $row) {
                $array[$row['name']] = $row['val'];
            }
            return $array;
        }

        return false;
    }


//setup table
protected function setup($name = '', $value = ''){
   $name = is_array($name) ? $name['key'] : $name;
    $table = $this->publicdb.".setup";

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
        $fetch = $this->db->fa("SELECT name, val FROM $table");
        return $fetch; // Return empty string if no result
    }
}

/**
 * Returns the code for the specified method or view.
 * @param string $methodName The name of the method or view.
 * @param string $type Either 'method' (default) or 'view'.
 * @return string The code for the method or view, or an error message.
 */
protected function cat($methodName, $type = 'method')
{
    if ($type === 'view') {
        // Convert methodName format: "cubo.view" -> ["cubo", "view"]
        [$cubo, $view] = explode('.', $methodName) + [null, null];

        if (!$cubo || !$view) {
            return "Invalid view format. Use 'cubo.view'.";
        }

        $filePath = GAIAROOT. "cubos/{$cubo}/main/{$view}.php";

        if (!file_exists($filePath)) {
            return "View file not found: {$filePath}";
        }

        return file_get_contents($filePath);
    }

    // Handle method case
    $class = new ReflectionClass($this);

    if (!$class->hasMethod($methodName)) {
        return "Method not found.";
    }

    $method = $class->getMethod($methodName);
    $filePath = $method->getFileName();

    if (!file_exists($filePath)) {
        return "Method file not found.";
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES);
    $startLine = $method->getStartLine() - 1;
    $endLine = $method->getEndLine();
    $methodCode = implode("\n", array_slice($lines, $startLine, $endLine - $startLine));

    return $methodCode;
}

/**
 * Runs a Unit Testing in a class or trait
 */
protected function test($classOrTrait) {

return "Test $classOrTrait";
}

/**
 * Returns the top comments of the selected trait or class.
 */
protected function helpClass($classOrTrait) {
    try {
        // Define the fully qualified names for trait and class
        $fqtn = "Core\\Traits\\$classOrTrait";
        $fqcn = "Core\\$classOrTrait";

        // Determine which FQN exists
        if (class_exists($fqcn)) {
            $reflection = new ReflectionClass($fqcn);
        } elseif (trait_exists($fqtn)) {
            $reflection = new ReflectionClass($fqtn);
        } else {
            return "Error: Class or Trait '$classOrTrait' does not exist.";
        }

        // Retrieve the doc comment
        $docComment = $reflection->getDocComment();
        if ($docComment === false) {
            return "No doc comment found.";
        }

        // Clean the doc comment by removing the delimiters and trimming whitespace
        $cleanDocComment = preg_replace('/^\/\*\*|\*\/$/', '', $docComment);
        $cleanDocComment = trim($cleanDocComment);

        return $cleanDocComment;
    } catch (ReflectionException $e) {
        return "Error: " . $e->getMessage();
    }
}



/**
 * Returns the top comments of the selected method or view.
 * @param string $methodName The name of the method or view (formatted as "cubo.view").
 * @param string $type Either 'method' (default) or 'view'.
 * @return string The extracted comments or an error message.
 */
protected function help($methodName, $type = 'method'){
    if ($type === 'view') {
        // Convert methodName format: "cubo.view" -> ["cubo", "view"]
        [$cubo, $view] = explode('.', $methodName) + [null, null];

        if (!$cubo || !$view) {
            return "Invalid view format. Use 'cubo.view'.";
        }

        $filePath = GAIAROOT . "cubos/{$cubo}/main/{$view}.php";

        if (!file_exists($filePath)) {
            return "View file not found: {$filePath}";
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES);

        // Extract the first block comment (assumed to be at the top)
        $docLines = [];
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (preg_match('/^\/\*\*/', $trimmed)) { // Start of comment
                $docLines[] = $trimmed;
            } elseif (!empty($docLines)) { // Inside comment
                $docLines[] = $trimmed;
                if (preg_match('/\*\/$/', $trimmed)) { // End of comment
                    break;
                }
            }
        }

        if (empty($docLines)) {
            return "No comments found in view: {$filePath}";
        }

        return implode("\n", array_map(fn($l) => preg_replace('/^\s*\* ?/', '', trim($l, "/* ")), $docLines));
    }

    // Handle method case
    if ($this instanceof \PDO && property_exists($this, 'db')) {
        $class = new ReflectionClass($this->db);
    } elseif ($this instanceof \Redis && property_exists($this, 'redis')) {
        $class = new ReflectionClass($this->redis);
    } else {
        $class = new ReflectionClass($this);
    }

    if (!$class->hasMethod($methodName)) {
        return "Method not found.";
    }

    $method = $class->getMethod($methodName);
    $filePath = $method->getFileName();

    if (!file_exists($filePath)) {
        return "Method file not found.";
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES);
    $startLine = $method->getStartLine() - 1;

    // Extract docblock
    $docLines = [];
    for ($i = $startLine - 1; $i >= 0; $i--) {
        $line = trim($lines[$i]);

        if ($line === "" || preg_match('/^(class|function|public|protected|private|#[\w]+)/', $line)) {
            break;
        }

        array_unshift($docLines, $lines[$i]);
    }

    return trim(implode("\n", array_map(fn($l) => preg_replace('/^\s*\* ?/', '', trim($l, "/* ")), $docLines)));
}


/**
Gen navigation for the unified public & admin
*/
protected function getMenu() {
    $pages = $this->db->fa("SELECT * FROM {$this->pagetable} WHERE menu = 1 AND parent = 0 ORDER BY sort");

    $apages = [];

    foreach ($pages as $page) {
        $exploded_name = explode('.', $page['name'] ?? '');
        $cubo = $exploded_name[0] ?? null;
        $second = $exploded_name[1] ?? null;

        // Skip if $cubo is missing
        if (!$cubo) continue;

        // Determine top-level key name
        $name = ($second === 'public' || !$second) ? $cubo : $second;

        // Skip if $name is empty (prevents $this->apages[''] error)
        if (!$name) continue;

        $title = $page['title'] ?? ucfirst($name);
        $icon = $page['img'] ?? 'folder-open';

        $apages[$name] = [
            "cubo" => $cubo,
            "title" => $title,
            "subs" => [],
            "icon" => $icon
        ];

        // Fetch subpages
        $subs = $this->db->fa("SELECT * FROM {$this->pagetable} WHERE parent = {$page['id']} ORDER BY sort");

        foreach ($subs as $sub) {
            $nameParts = explode('.', $sub['name'] ?? '');
            $subCubo = $nameParts[0] ?? null;
            $view = $nameParts[1] ?? null;

            // Only create submenu if both cubo and view are valid
            if (!$subCubo || !$view) continue;

            $apages[$name]['subs'][$view] = [
                "cubo" => $subCubo,
                "view" => $view,
                "icon" => $sub['img'] ?? 'file',
                "mode" => $sub['type'] ?? ''
            ];
        }
    }

    return $apages;
}



}