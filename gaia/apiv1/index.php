<?php
/** @filemeta.description starting file common for PUBLIC,ADMIN,API systems with nginx and core */
/**
@filemeta.updatelog
v1 used with php7.4 with the old way with bootstrap included
v2 updated  php8.4 loades just one public class with Gaia mother abstracted
v3 installed composer and autoload to empower usability
*/

// Clean any existing output buffers
if (ob_get_level()) ob_end_clean();
ob_start();

// Allow requests from a specific origin
header("Access-Control-Allow-Origin: *");
// Allow methods like POST, GET, OPTIONS
header("Access-Control-Allow-Methods: POST, GET,PUT,DELETE, OPTIONS");
// Allow specific headers, including Content-Type
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");


// Handle preflight OPTIONS request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header("Content-Type: text/plain");
    echo '';
    exit;
}

header('Content-Type: application/json');

define('DOMAIN',$_SERVER['SERVER_NAME']);
$servernameArray=explode('.',DOMAIN);
define('TEMPLATE', $servernameArray[0].$servernameArray[1]);
define('ROOT', dirname(__DIR__).'/');
define('CUBO_ROOT', ROOT.'cubo/');
define('ADMIN_ROOT', ROOT.'admin/');
//require '/var/www/gs/vendor/autoload.php';
require_once ROOT . 'vendor/autoload.php'; // Adjust the path based on your structure
use Core\API;

try {
    $gaia = new API();
    // $gaia should internally echo JSON OR return it
    // Make sure API class uses echo json_encode($response); at the end
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'success' => false,
        'code' => 'EXCEPTION',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(), // optional, for debug
    ]);
}

ob_end_flush();
?>
