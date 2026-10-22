<?php
define('DOMAIN',$_SERVER['SERVER_NAME']);
$servernameArray=explode('.',DOMAIN);
define('TEMPLATE', $servernameArray[0].$servernameArray[1]);
define('ROOT', dirname(__DIR__).'/');
define('CUBO_ROOT', ROOT.'cubo/');
//require '/var/www/gs/vendor/autoload.php';
require_once ROOT . 'vendor/autoload.php'; // Adjust the path based on your structure
use Core\Gen;
$gaia = new Gen();

?>