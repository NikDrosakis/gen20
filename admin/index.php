<?php
define('DOMAIN',$_SERVER['SERVER_NAME']);
$servernameArray=explode('.',DOMAIN);
define('TEMPLATE', $servernameArray[0].$servernameArray[1]);
define('ADMIN_ROOT', '/var/www/gs/admin/');
require '/var/www/gs/vendor/autoload.php';
require_once __DIR__ . '/../autoload.php'; // Adjust the path based on your structure
use Core\Admin;
$gaia = new Admin();
?>

