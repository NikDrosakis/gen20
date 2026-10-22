<?php
use Core\Gen;
define('DOMAIN', $_SERVER['SERVER_NAME']);
$servernameArray = explode('.', DOMAIN);
if (!empty($servernameArray)) {
    $template = $servernameArray[0].$servernameArray[1];
    define('TEMPLATE', $template);
       define('ROOT', dirname(dirname(__DIR__)).'/');
    define('ADMIN_ROOT', ROOT . 'admin/');
    // Ensure the autoload file is included first
    require ROOT.'vendor/autoload.php';
    $gaia = new Gen();
} else {
    echo "Run bash install.sh";
}
?>

