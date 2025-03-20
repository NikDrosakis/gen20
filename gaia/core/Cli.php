<?php
namespace Core;

class Cli extends Gaia {
use  System, Url, System,Meta, Manifest, Head, Ermis, Lang, Tree, Form, Domain, Kronos, WS, Action, Template, Media, Filemeta, My, Cubo, Template,Book;
    public $argv=[]; // To store the arguments passed to the script
    public $argc; // Store the argument count
    protected $cliDir = "/var/www/gs/cli"; // Adjust this path as needed

    public function __construct() {
      parent::__construct();
      }

protected function handleRequest() {
    global $argv, $argc;

    if ($this->isCliRequest()) {
        // Debugging: Print arguments
        print_r($argv);

        // Ensure we have enough arguments (at least 2: command and method)
        if ($argc < 3) {
            echo "Usage: php cli/index.php <command> <method> [params...]\n";
            exit(1);
        }

        // Extract method from arguments
        $method = $argv[2]; // The method (e.g., 'buildTable')

        // Extract parameters (everything after the method)
        $params = array_slice($argv, 3);

        // Parse parameters into an associative array
        $parsedParams = [];
        foreach ($params as $param) {
            if (strpos($param, '=') !== false) {
                list($key, $value) = explode('=', $param, 2);
                $parsedParams[$key] = $value;
            }
        }

        // Debugging: Show extracted method and parameters
    //    echo "Method: $method\n";
//        echo "Params: " . print_r($parsedParams, true) . "\n";

        // Call the run method with the method and parsed params
        $this->runCli($method, $parsedParams);
    } else {
        echo "THIS IS NOT CLI\n";
    }
}

protected function runCli($method, $params)
{
    // Ensure $params is always an array
    if (!is_array($params)) {
        // If $params is a string, treat it as an array with one element
        if (is_string($params)) {
            $params = [$params];
        } elseif (is_object($params) && method_exists($params, '__toString')) {
            // Handle object-to-string conversion
            $params = [(string) $params];
        } else {
            // For other types, we might need to wrap them in an array or throw an error
            $params = (array) $params;
        }
    }

    // Check if the method exists and is callable
    if (!method_exists($this, $method)) {
        throw new \BadMethodCallException("Method '$method' does not exist in " . get_class($this));
    }

    // Call the method with the parameters as a single array argument
    return $this->{$method}($params);
}

    protected function execute(string $filePath, string $method, string $param): void {
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);

        echo "Executing: $filePath\n"; // Debugging: Show the file being executed

        switch ($ext) {
            case "sh":
                passthru("bash $filePath $method $param"); // For shell scripts, pass method and param
                break;
            case "php":
                passthru("php $filePath $method $param"); // For PHP scripts, pass method and param
                break;
            default:
                echo "Unsupported file type.\n";
                exit(1);
        }
    }

protected function buildTableCli($data) {
    if (empty($data)) {
        echo "⚠️ No data to display.\n";
        return;
    }

    // Extract headers dynamically
    $headers = array_keys($data[0]);

    // Calculate column widths
    $widths = [];
    foreach ($headers as $header) {
        $widths[$header] = strlen($header);
    }
    foreach ($data as $row) {
        foreach ($row as $key => $value) {
            $widths[$key] = max($widths[$key], strlen($value));
        }
    }

    // Generate format string dynamically
    $format = "|";
    foreach ($headers as $header) {
        $format .= " %-" . $widths[$header] . "s |";
    }
    $format .= "\n";

    // Print headers
    vprintf($format, $headers);
    echo str_repeat("-", array_sum($widths) + (count($headers) * 3)) . "\n";

    // Print rows
    foreach ($data as $row) {
        vprintf($format, $row);
    }
}

protected function testCli() {
    echo "test gaia cli";
}

protected function chartCli($label, $value, $max = 100) {
    $bar = str_repeat("█", ($value / $max) * 20);
    printf("%-10s [%s] %d%%\n", $label, $bar, $value);
}

protected function ask($question) {
    // If a question is passed as a command-line argument, use it; otherwise, prompt the user
    if (!$question) {
        echo "Please provide a question: ";
        $question = trim(fgets(STDIN));  // Read from stdin if no argument provided
    }

    echo $question . " ";
    return trim(fgets(STDIN));  // Get the response from user input
}


}
