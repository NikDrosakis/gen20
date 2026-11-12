<?php
define('ROOT', dirname(__DIR__).'/');

if (PHP_SAPI === 'cli') {
    $_SERVER += [
        'SERVER_NAME'   => 'localhost',
        'HTTP_HOST'     => 'localhost',
        'HTTPS'         => '',
        'REQUEST_URI'   => '/',
        'QUERY_STRING'  => '',
        'SYSTEM'        => 'gaia',
    ];
}

require ROOT.'vendor/autoload.php';
use Core\Sol;
$gaia = new Sol();