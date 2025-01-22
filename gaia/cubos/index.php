<?php
define('DOMAIN',$_SERVER['SERVER_NAME']);
$servernameArray=explode('.',DOMAIN);
define('TEMPLATE', $servernameArray[0].$servernameArray[1]);
define('ROOT', dirname(__DIR__).'/');
define('ADMIN_ROOT', ROOT.'admin/');
define('CUBO_ROOT', ROOT.'cubos/');
require ROOT.'vendor/autoload.php';
//require_once __DIR__ . '/../autoload.php'; // Adjust the path based on your structure
use Core\CuboInstance;
$gaia = new CuboInstance();