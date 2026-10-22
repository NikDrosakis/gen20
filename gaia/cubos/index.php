<?php
// Allow requests from a specific origin
header("Access-Control-Allow-Origin: http://localhost:3000");
// Allow methods like POST, GET, OPTIONS
header("Access-Control-Allow-Methods: POST, GET,PUT,DELETE, OPTIONS");
// Allow specific headers, including Content-Type
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');
define('DOMAIN', $_SERVER['SERVER_NAME']);
$servernameArray=explode('.',DOMAIN);
define('TEMPLATE', $servernameArray[0].$servernameArray[1]);
define('ROOT', dirname(__DIR__).'/');
define('ADMIN_ROOT', ROOT.'admin/');
define('CUBO_ROOT', ROOT.'cubos/');
require ROOT.'vendor/autoload.php';
//require_once __DIR__ . '/../autoload.php'; // Adjust the path based on your structure
use Core\CuboInstance;
$gaia = new CuboInstance();