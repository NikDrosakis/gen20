<?php
define('ROOT', dirname(dirname(dirname(__DIR__))).'/gaia/');
require ROOT.'vendor/autoload.php';
use Core\Cli;
$gaia = new Cli();