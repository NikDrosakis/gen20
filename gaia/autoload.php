<?php
define('CORE_ROOT', '/var/www/gs/');
spl_autoload_register(function ($class) {
    // Define the base directory for the namespace
    $base_dir = CORE_ROOT. 'core/';
    // Check if the class uses the Admin\Core namespace
    $prefix = 'Core\\';
    $prefix_len = strlen($prefix);
    if (strncmp($prefix, $class, $prefix_len) !== 0) {
        // The class does not use the namespace prefix
        return;
    }

    // Remove the prefix from the class name
    $relative_class = substr($class, $prefix_len);

    // Convert the namespace separators to directory separators and append with .php
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    // Check if the file exists and include it
    if (file_exists($file)) {
        require $file;
    }
});
