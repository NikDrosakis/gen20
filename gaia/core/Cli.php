<?php
namespace Core;

use ReflectionClass;
use Exception;
use Core\Traits\Doc;
use Core\Traits\Url;
use Core\Traits\System;
use Core\Traits\Meta;
use Core\Traits\Manifest;
use Core\Traits\Head;
use Core\Traits\Ermis;
use Core\Traits\Lang;
use Core\Traits\Tree;
use Core\Traits\Form;
use Core\Traits\Domain;
use Core\Traits\DomainZone;
use Core\Traits\DomainFS;
use Core\Traits\DomainSSL;
use Core\Traits\DomainDB;
use Core\Traits\DomainHost;
use Core\Traits\Kronos;
use Core\Traits\WS;
use Core\Traits\Action;
use Core\Traits\Template;
use Core\Traits\Media;
use Core\Traits\Filemeta;
use Core\Traits\My;
use Core\Traits\Watch;
use Core\Traits\CuboPublic;
use Core\Traits\CuboAdmin;
use Core\Cubo\Book;

class Cli extends Gaia {
use  Watch, Doc, Url, System,Meta, Manifest, Head, Ermis, Lang, Tree, Form,Domain,DomainZone,DomainFS,DomainSSL,DomainDB,DomainHost, Kronos, WS, Action, Template, Media, Filemeta, My, CuboPublic, CuboAdmin, Template,Book;

public $argv=[]; // To store the arguments passed to the script
public $argc; // Store the argument count
protected $cliDir = "/var/www/gs/cli"; // Adjust this path as needed

public function __construct() {
      parent::__construct();
}

/**
Abstract Gaia function
*/
protected function handleRequest() {
    global $argv, $argc;

    if ($this->isCliRequest()) {
        $this->router();
    } else {
        echo "THIS IS NOT CLI\n";
    }
}

/**
 Comma-separated key-value pairs (e.g., key1=value1,key2=value2).
  Standalone key-value pairs (e.g., key=value).
  Standalone parameters (e.g., param4).
 */
protected function parseArgs($params) {
    $parsedParams = [];

    // Ensure we always work with an array
    $params = is_array($params) ? $params : [$params];

    foreach ($params as $param) {
        // Skip empty parameters
        if ($param === null || $param === '') {
            continue;
        }

        // Convert to string if possible
        if (is_object($param) && method_exists($param, '__toString')) {
            $param = (string)$param;
        }

        // Handle boolean values explicitly
        if (is_string($param) && in_array(strtolower($param), ['true', 'false'], true)) {
            $parsedParams[] = strtolower($param) === 'true';
            continue;
        }

        // Process array markers
        if (is_string($param) && strpos($param, '_') === 0) {
            $arrayContent = substr($param, 1);

            // Handle empty array case
            if ($arrayContent === '') {
                $parsedParams[] = [];
                continue;
            }

            $arrayParts = [];

            // Process comma-separated array elements
            foreach (explode(',', $arrayContent) as $element) {
                $element = trim($element);
                if ($element === '') continue;

                // Handle array element key-value pairs
                if (strpos($element, '=') !== false) {
                    list($key, $value) = explode('=', $element, 2);
                    $arrayParts[trim($key)] = trim($value);
                } else {
                    $arrayParts[] = $element;
                }
            }

            $parsedParams[] = $arrayParts;
        }
        // Handle regular string parameters
        else {
            // Key-value pair
            if (is_string($param) && strpos($param, '=') !== false) {
                list($key, $value) = explode('=', $param, 2);
                $parsedParams[trim($key)] = trim($value);
            }
            // Simple string value
            else {
                $parsedParams[] = is_string($param) ? trim($param) : $param;
            }
        }
    }

    // If single non-array parameter was passed, return it directly
    if (count($parsedParams) === 1 && !isset($parsedParams[0]) && !is_array($parsedParams)) {
        return reset($parsedParams);
    }

    return $parsedParams;
}

/**
Deprecated with parseArgs
*/
protected function parseParams($params) {
    $parsedParams = [];

    foreach ($params as $param) {
        // Handle comma-separated strings
        if (strpos($param, ',') !== false) {
            $parts = explode(',', $param);

            // Check if the parts contain key-value pairs
            $isAssociative = false;
            foreach ($parts as $part) {
                if (strpos($part, '=') !== false) {
                    $isAssociative = true;
                    break;
                }
            }

            // If it's an associative array (key-value pairs)
            if ($isAssociative) {
                foreach ($parts as $part) {
                    if (strpos($part, '=') !== false) {
                        list($key, $value) = explode('=', $part, 2);
                        $parsedParams[$key] = $value;
                    } else {
                        $parsedParams[] = $part;
                    }
                }
            }
            // If it's a simple array (comma-separated values)
            else {
                // Add the entire comma-separated string as a single array element
                $parsedParams[] = $parts;
            }
        }
        // Handle standalone key-value pairs (e.g., key=value)
        elseif (strpos($param, '=') !== false) {
            list($key, $value) = explode('=', $param, 2);
            $parsedParams[$key] = $value;
        }
        // Handle standalone parameters (e.g., param4)
        else {
            $parsedParams[] = $param;
        }
    }

    return $parsedParams;
}

  protected function router() {
     global $argv, $argc;
     // Debugging: Print arguments
     $this->arrowCli($argv);
     // Extract method from arguments
     $method = $argv[2];

      if ($method == 'this') {
          $this->thisCli($argv);
          exit;
      }

      // Extract parameters (everything after the method)
      $params = array_slice($argv, 3);

    // Parse parameters into an associative array
    $parsedParams= $this->parseArgs($params);

      // Call the run method with the method and parsed params
      $this->methodCli($method, $parsedParams);

  }

  protected function shell($method) {
        // Run the shell command using shell_exec

        $command = "bash /var/www/gs/cli/com/gaia/$method.sh";
        $output = shell_exec($command);

        // If there's an issue executing the command, handle the error
        if ($output === null) {
          //  echo json_encode(['error' => 'Command execution failed']);
            return;
        }

        // Prepare the output as an array (you can modify this depending on the output format)
        $result = [
            'status' => 'success',
            'data' => $output
        ];

        // Encode the result into JSON and return it
        echo json_encode($result);
    }

/**
Traversing the arguments to find the target property, array value, or method.
Parsing the remaining arguments into parameters using parseParams.
Executing the target method with the parsed parameters
*/
protected function thisCli($argv) {
    $target = $this;
    $params = [];

    // Traverse through arguments
    for ($i = 3; $i < count($argv); $i++) {
        $key = $argv[$i];

        if (is_object($target) && property_exists($target, $key)) {
            $target = $target->{$key};  // Access property
        } elseif (is_array($target) && array_key_exists($key, $target)) {
            $target = $target[$key];  // Access array value
        } elseif (is_object($target) && method_exists($target, $key)) {
            // Next argument is a method, remaining args are parameters
            $method = $key;

            // Extract the table name (first argument after the method)
            $tableName = $argv[$i + 1] ?? null;
            if (!$tableName) {
                echo "❌ Table name is required for '{$method}' method.\n";
                exit(1);
            }

            // Parse the remaining arguments into an associative array
            $params = $this->parseArgs(array_slice($argv, $i + 2));
            break;
        } else {
            echo "❌ No such property or method: '{$key}'\n";
            exit(1);
        }
    }

    // If it's a method, execute it
    if (isset($method) && method_exists($target, $method)) {
        // Debug: Print the method name, table name, and parsed params
      //  echo "Method: {$method}\n";
       // echo "Table Name: {$tableName}\n";
       // echo "Params: " . print_r($params, true) . "\n";

        // Call the method with the table name and params
        $result = $target->{$method}($tableName, $params);

        if (is_array($result) || is_object($result)) {
            $this->arrayCli($result);  // Format structured output
        } else {
            echo $result . "\n";
        }
    } else {
        // Otherwise, just output the final value
        if (is_array($target) || is_object($target)) {
            $this->arrayCli($target);
        } else {
            echo $target . "\n";
        }
    }
}

protected function methodCli($method, $parsedParams) {

    // Check if the method exists
    if (method_exists($this, $method)) {
        // Call the method with the parsed parameters
        //$result = call_user_func_array([$this, $method], $parsedParams);
        //$result = $this->$method($parsedParams);
          $result = $this->$method(...$parsedParams);
        // If the result is an array or object, use arrayCli to format output
        if (is_array($result) || is_object($result)) {
            $this->arrayCli($result);
        } else {
            echo $result . "\n";
        }
    } else {
        echo "❌ Method not found: '{$method}'\n";
        exit(1);
    }
    return $result;
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


protected function tableCli($data) {
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

protected function arrayCli($data) {
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
    }

protected function arrowCli($data) {
    // Join array elements with ' > ' and display as a breadcrumb-like path
    echo implode(' > ', $data) . PHP_EOL;
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
