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

        $this->router();
    } else {
        echo "THIS IS NOT CLI\n";
    }
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
// Parse parameters into an associative array
$parsedParams = [];
foreach ($params as $param) {
    // Handle comma-separated key-value pairs (e.g., key=gen_admin.systems,cols=cols,key2=value2)
    if (strpos($param, ',') !== false) {
        // Split the string by commas
        $pairs = explode(',', $param);
        foreach ($pairs as $pair) {
            // Handle key-value pairs separated by '='
            if (strpos($pair, '=') !== false) {
                list($key, $value) = explode('=', $pair, 2);
                $parsedParams[$key] = $value;
            }
            // Handle standalone parameters (e.g., param4)
            else {
                $parsedParams[] = $pair;
            }
        }
    }
    // Handle key-value pairs separated by '=' (no commas)
    elseif (strpos($param, '=') !== false) {
        list($key, $value) = explode('=', $param, 2);
        $parsedParams[$key] = $value;
    }
    // Handle standalone parameters (e.g., param4)
    else {
        $parsedParams[] = $param;
    }
}

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


protected function thisCli($argv){
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
            $params = array_slice($argv, $i + 1);
            break;
        } else {
            echo "❌ No such property or method: '{$key}'\n";
            exit(1);
        }
    }

    // If it's a method, execute it
    if (isset($method) && method_exists($target, $method)) {
        $result = call_user_func_array([$target, $method], $params);

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

protected function methodCli($method, $params) {
    //var_dump($params);

    // Ensure $params is always an array
    if (!is_array($params)) {
        if (is_string($params)) {
            $params = [$params]; // Convert string to array
        } elseif (is_object($params) && method_exists($params, '__toString')) {
            $params = [(string) $params]; // Convert object to string and then to array
        } else {
            $params = (array) $params; // Force other types into an array
        }
    }

    // Parse key-value pairs in $params
    $parsedParams = [];
    foreach ($params as $param) {
        if (strpos($param, '=') !== false) {
            list($key, $value) = explode('=', $param, 2);
            $parsedParams[$key] = $value;
        } else {
            $parsedParams[] = $param;
        }
    }

    // Check if the method exists and call it with parsed parameters
    if (method_exists($this, $method)) {
        $result = call_user_func_array([$this, $method], $parsedParams);

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
