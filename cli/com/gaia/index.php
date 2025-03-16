<?php
define('DOMAIN','localhost');
define('TEMPLATE', 'localhost');
define('ROOT', dirname(dirname(__DIR__)).'/gaia/');
define('ADMIN_ROOT', ROOT.'admin/');
require ROOT.'vendor/autoload.php';
use Core\Cli;
$gaia = new Cli();
?>



