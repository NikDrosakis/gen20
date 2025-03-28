<?php
/** @filemeta.description starting file common for PUBLIC,ADMIN,API systems with nginx and core */
/**
@filemeta.updatelog
v1 used with php7.4 with the old way with bootstrap included
v2 updated  php8.4 loades just one public class with Gaia mother abstracted
v3 installed composer and autoload to empower usability
*/
// Allow requests from a specific origin
header("Access-Control-Allow-Origin: *");
// Allow methods like POST, GET, OPTIONS
header("Access-Control-Allow-Methods: POST, GET,PUT,DELETE, OPTIONS");
// Allow specific headers, including Content-Type
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');
define('DOMAIN',$_SERVER['SERVER_NAME']);
$servernameArray=explode('.',DOMAIN);
define('TEMPLATE', $servernameArray[0].$servernameArray[1]);
define('ROOT', dirname(__DIR__).'/');
define('ASSET_ROOT', ROOT.'asset/');
define('CUBO_ROOT', ROOT.'cubo/');
//require '/var/www/gs/vendor/autoload.php';
require_once ROOT . 'vendor/autoload.php'; // Adjust the path based on your structure
use Core\API;
$gaia = new API();
?>
