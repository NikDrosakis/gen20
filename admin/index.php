<?php
/** @filemeta.description starting file common for PUBLIC,ADMIN,API systems with nginx and core */
/** @filemeta.updatelog
v1 used with php7.4 with the old way with bootstrap included
v2 updated  php8.4 loades just one public class with Gaia mother abstracted
v3 installed composer and autoload to empower usability
*/
define('DOMAIN',$_SERVER['SERVER_NAME']);
$servernameArray=explode('.',DOMAIN);
define('TEMPLATE', $servernameArray[0].$servernameArray[1]);
define('ROOT', '/var/www/gs/');
define('ADMIN_ROOT', ROOT.'admin/');
require '/var/www/gs/vendor/autoload.php';
require_once __DIR__ . '/../autoload.php'; // Adjust the path based on your structure
use Core\Admin;
$gaia = new Admin();
?>

