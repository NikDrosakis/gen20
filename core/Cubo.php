<?php
namespace Core;
use Exception;
use Imagick;
use Symfony\Component\Yaml\Yaml;

trait Cubo {

  protected function getLinks() {
            return $this->db->fa("SELECT * FROM links WHERE linksgrpid=1 ORDER BY sort");
    }

protected function updateCuboImg($table = '',$current_name = '') {
$cubo = is_array($current_cubo) ? $current_cubo['key'] : $current_cubo;
$db=explode('.',$table)[0];

    $cuboFolder = $db=='gen_admin' ? ADMIN_IMG_ROOT . $cubo . "/" : $this->G['CUBO_ROOT'] . $cubo . "/";
    $publicFilePath = $cuboFolder . "public.php";

    // Validate Cubo folder and file
    if (!file_exists($publicFilePath)) {
        throw new Exception("Cubo file not found: " . $publicFilePath);
    }

    // Generate the HTML output
    $htmlOutputPath = $cuboFolder . "render.html";
    $html = $this->include_buffer($publicFilePath);

    if (empty($html)) {
        throw new Exception("Failed to load HTML from: " . $publicFilePath);
    }

    // Save the rendered HTML to a file
    file_put_contents($htmlOutputPath, $html);

    // Define output image path
    $outputImagePath = $cuboFolder . 'output_' . $cubo . '.png';

    // Use wkhtmltoimage to convert HTML to PNG
    $command = escapeshellcmd("wkhtmltoimage --quality 90 $htmlOutputPath $outputImagePath");
    exec($command, $output, $resultCode);

    if ($resultCode !== 0) {
        throw new Exception("Error executing wkhtmltoimage: " . implode("\n", $output));
    }

    // Update the database with the new image path
    $this->db->q("UPDATE $table SET img = ? WHERE name = ?", [$outputImagePath, $cubo]);

    return "Image successfully saved as $outputImagePath";
}


    protected function getCuboBuffer(): array {
        $buffer = array();
        $sel = array();
   		$query='SELECT * FROM cubos ORDER BY valuability DESC';
   		$sel=$this->admin->fa($query);
   		$count = count($this->admin->fa($query));
           // Create buffer for output
   		$params['statuses']=[0=>'archived',1=>'deprecated',2=>'pending',3=>'active'];
           $buffer['count'] = $count;
           $buffer['list'] = $sel;
           $buffer['html'] = $this->include_buffer(ADMIN_ROOT."main/cubos/cubos_buffer.php", $sel,$params);
           return $buffer;
       }

   // Retrieve all cubos
    protected function getCubos(): array {
        return $this->admin->fa('SELECT * FROM cubos');
    }
    // Retrieve  cubos buffer

    // Retrieve a single cubos by ID
    protected function getCubo(int $id): array {
        return $this->admin->f('SELECT * FROM cubos WHERE id = ?',[$id]);
    }

    // Retrieve cubos logs
    protected function getCuboLogs(int $widgetId): array {
        return $this->admin->fa('SELECT * FROM cubo_logs WHERE widget_id =? ',[$widgetId]);
    }
    // Retrieve cubos logs
    protected function test(): array {
	return ["my"=>'love'];
	}
    protected function getSystemLogsBuffer(): ?array {
       $buffer = array();
        $sel = array(); 
		$query='SELECT systems.*,system_logs.* FROM systems left join system_logs ON systems.id=system_logs.systemsid ';
		$selsystems=$this->admin->fa($query);
			for($i=0;$i<count($selsystems);$i++) { 
				$sel[$selsystems[$i]["systemsid"]][]=$selsystems[$i];
			}      
        // Create buffer for output		
        $buffer['count'] = count($selsystems);
        $buffer['list'] = $sel;
    //    $buffer['html'] = $this->include_buffer(ADMIN_ROOT."main/admin/system_buffer.php", $sel);
        return $buffer;
    }

    // Add a new widget log entry
    protected function addCuboLog(int $widgetId, string $action, string $summary): int {
        return $this->admin->inse('cubo_logs',['widget_id'=>$widgetId, 'action'=>$action, 'summary'=>$summary]);
    }

    // Update a widget
    protected function updateCubo(int $id, array $data): bool {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }
        $sql = 'UPDATE cubos SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return $this->admin->q($sql,[$id]);
    }

    // Add a new widget
    protected function addCubo(array $data): bool {
        $keys = array_keys($data);
        $columns = implode(', ', $keys);
        $placeholders = ':' . implode(', :', $keys);
        $sql = "INSERT INTO cubos ($columns) VALUES ($placeholders)";
        return $this->admin->q($sql);
    }
// metric.php sub
protected function addMetric(array $params = []): ?array {
    // SQL query to fetch the required data
    $sql = "SELECT s.name, DATE_FORMAT(tr.created, '%Y-%m-%d') AS week, tr.progress_level
            FROM task_report tr
            JOIN systems s ON tr.systemsid = s.id
            WHERE tr.created BETWEEN '2024-07-05' AND '2024-09-08'
            ORDER BY tr.created";

    // Execute the query
    $res = $this->admin->fa($sql);
    $data = ['res' => []]; // Initialize with 'res' key

    // Check if there are results and structure them accordingly
    if (count($res) > 0) {
        foreach ($res as $row) {
            // Append the week's progress level under a single 'res' key
            $data['res'][] = [
                "name" => $row["name"], // Include the name for context
                "week" => $row["week"],
                "progress" => $row["progress_level"]
            ];
        }
    }

    return $data; // Return the structured data with a single key
}

    // Delete a widget
    protected function deleteCubo(int $id): bool {
        return $this->admin->q('DELETE FROM cubos WHERE id =?',[$id]);
    }

    // Example of using proc_open() for shell execution and logging
    protected function runShellCommand(string $command): array {
        $descriptors = [
            0 => ['pipe', 'r'],  // STDIN
            1 => ['pipe', 'w'],  // STDOUT
            2 => ['pipe', 'w']   // STDERR
        ];

        // Open the process
        $process = proc_open($command, $descriptors, $pipes);

        if (!is_resource($process)) {
            throw new \Exception('Could not start process.');
        }

        // Get the output and error streams
        $output = stream_get_contents($pipes[1]);
        fclose($pipes[1]);

        $errorOutput = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        // Close the process and get the exit code
        $returnCode = proc_close($process);

        // Log the command and the results
        $this->logShellExecution($command, $output, $errorOutput, $returnCode);

        return [
            'output' => $output,
            'error' => $errorOutput,
            'status' => $returnCode
        ];
    }

    // Log shell command executions for auditing purposes
    protected function logShellExecution(string $command, string $output, string $error, int $status): void {
        $logData = [
            'command' => $command,
            'output' => $output,
            'error' => $error,
            'status' => $status,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        file_put_contents('/var/log/admin_shell_log.txt', json_encode($logData, JSON_PRETTY_PRINT), FILE_APPEND);
    }

    // Example: Update a widget using shell commands (for demo)
    protected function updateWidgetWithShell(int $id, array $data): bool {
        // Perform some update logic
        $updateStatus = $this->updateWidget($id, $data);

        // Run shell command (example)
        $command = 'echo "Widget ' . $id . ' updated"';
        $result = $this->runShellCommand($command);

        // Check for any shell errors
        if ($result['status'] !== 0) {
            throw new \Exception('Shell command failed: ' . $result['error']);
        }

        return $updateStatus;
    }

    // Other methods (existing)...
    protected function createNewCubo(string $name, string $description, string $ideally): bool|int {
        // Create folder and public.php as in the previous code...
        $cuboDir = CUBO_ROOT . $name . '/';

        if (!mkdir($cuboDir, 0777, true)) {
            return false;
        }

        // Define the path for the public.php file
        $filePath = $cuboDir . 'public.php';
        $content = "<?php\n";
        $content .= "// Auto-generated public.php file for cubo: $name\n\n";
        $content .= "echo 'Welcome to the $name cubo!';\n";

        if (file_put_contents($filePath, $content) === false) {
            return false;
        }

        // Insert cubo into the database
        $data = [
            'systemsid' => 1,
            'name' => $name,
            'description' => $description,
            'created' => date('Y-m-d H:i:s')
        ];
        $insert = $this->admin->inse("cubos", $data);

        // Run shell command to set permissions (example)
        $command = 'chmod -R 755 ' . escapeshellarg($cuboDir);
        $result = $this->runShellCommand($command);

        if ($result['status'] !== 0) {
            throw new \Exception('Permission setting failed: ' . $result['error']);
        }

        return $insert;
    }
protected function getUsers() {
        return $this->db->fa("SELECT * FROM user");
    }

    protected function postlist(){

        $orderby = !empty($_COOKIE['orderby']) ? $_COOKIE['orderby'] : "post.sort";
        //pagination
        //$pagin=$bot->is('pagin'); //pagination num of result for each page
        $pagin=12; //pagination num of result for each page
        $limit= " LIMIT ".(($_GET['page'] - 1) * $pagin).",$pagin";

        $q=!empty($_GET['q']) ? $_GET['q']: '';
        $qq=$q!="" ? "WHERE post.title LIKE '%$q%'
            OR user.name LIKE '%$q%'
            OR tax.name LIKE '%$q%' "
            :"";

        $sub= isset($_GET['sub']) ? $_GET['sub']:'';
        $taxQ= $sub!="" ? "WHERE tax.name='$sub'":"";
        $query= "SELECT post.*,tax.name as taxname,user.name as username FROM post
        LEFT JOIN user ON post.uid=user.id LEFT JOIN tax ON post.taxid=tax.id $taxQ GROUP BY post.id ORDER BY $orderby";

        $sel= $db->fa("$query $limit");
        $buffer['count']= count($db->fa($query));
        if(empty($_COOKIE['list_style']) || $_COOKIE['list_style']=='table'){
            $buffer['html']=include_buffer($this->G['SITE_ROOT']."post_loop_table.php",$sel);
        }elseif($_COOKIE['list_style']=='archieve'){
            $buffer['html']=include_buffer($this->G['SITE_ROOT']."post_loop_archive.php",$sel);
        }
        return json_encode($buffer);

        }

        // Method to retrieve comments for a specific type and ID
       protected function getComments($type = 'book') {
            $sel = $this->db->fa("SELECT comment.*, CONCAT(user.firstname, ' ', user.lastname) AS fullname, user.img
              FROM comment
              LEFT JOIN user ON comment.uid=user.id
              WHERE comment.type=? AND comment.typeid=? AND comment.reply_id=0
              ORDER BY comment.created DESC", [$type, $_GET['id']]);
            // Insert replies into comments
            if (!empty($sel)) {
                foreach ($sel as $i => $comment) {
                    $sel[$i]['replies'] = $this->db->fa("SELECT comment.*, CONCAT(user.firstname,' ',user.lastname) AS fullname, user.img
                                                         FROM comment
                                                         LEFT JOIN user ON comment.uid=user.id
                                                         WHERE comment.reply_id=?
                                                         ORDER BY comment.created DESC", [$comment['id']]);
                }
            }

            return $sel;
        }


    protected function getMaincubo() {
        return $this->db->fa("SELECT * from cubo order by name");
    }
    protected function getMaincuboBypage(string $page): bool|array {

      $list=[];
        $fetch = $this->db->fa("SELECT maincubo.area, cubo.name as cubo
        FROM maincubo
        left join main on main.id=maincubo.mainid
        left join cubo on cubo.id=maincubo.cuboid
        where main.name=?",[$page]);
            if (!empty($fetch)) {
                    foreach ($fetch as $row) {
                        $list[$row['area']][] = $row['cubo'];
                    }
                    return $list;
                } else {
                    return false;
                }
    }


//yaml methods

protected function loadConfig($filePath) {
    return Yaml::parseFile($filePath);
}

protected function executeSQL($query) {
    $pdo = new PDO("mysql:host=localhost;dbname=yourdb", "root", "password");
    $pdo->exec($query);
}

protected function sendWsNotification($message) {
    $wsUrl = "ws://localhost:3000";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $wsUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $message);
    curl_exec($ch);
    curl_close($ch);
}

protected function executeCuboAction($action) {
    $config = loadConfig(__DIR__ . '/../configs/cubo_example.yml');

    switch ($action) {
        case 'setup':
            executeSQL($config['setup']['sql']);
            echo "Setup Complete: " . $config['description'];
            sendWsNotification($config['notifications']['ws']);
            break;
        case 'update':
            executeSQL($config['update']['sql']);
            echo $config['update']['message'];
            sendWsNotification($config['notifications']['ws']);
            break;
        case 'uninstall':
            executeSQL($config['uninstall']['sql']);
            echo $config['uninstall']['message'];
            break;
        default:
            echo "Invalid action.";
    }
}



}

