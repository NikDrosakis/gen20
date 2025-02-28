<?php
namespace Core;
use Exception;
use Imagick;
use Symfony\Component\Yaml\Yaml;
/**
 /cubos/[CuboName]/
 ├── [CuboName].php            # Main class file for the Cubo
 ├── main/                     # Directory for main PHP pages
 │   ├── [main1].php           # Each main corresponds to a key in `manifest.yml.mains`
 │   ├── [main2].php
 ├── manifest.yml              # YAML file defining Cubo mains and metadata
 ├── setup.yml                 # Optional: Predefined setup configurations
 ├── sql/                      # Directory for SQL scripts
 │   ├── c_[table1].sql
 │   ├── c_[table2].sql
 ├── output_[CuboName].png     # Optional: Related output/image assets
 ├── tax.json                  # Optional: JSON for taxonomy or configuration
 └── template.pug              # Optional: Templating file

gen_admin.cubo:

Stores high-level details about each Cubo.
Example:
php
Copy
Edit
['name' => 'book', 'tables' => 'cat,lib,...', 'mains' => 'book,categories,...']
publicdb.maingrp:

Groups the mains of a Cubo.
Insert with cuboid and name from manifest.yml.
publicdb.main:

Individual mains for each Cubo, linked to maingrp.
publicdb.maincubo:

Links individual mains with Cubo-level metadata.
Example:
php
Copy
Edit
['mainid' => $mainId, 'area' => 'm', 'cuboid' => $cuboId, 'name' => 'book']
{$this->publicdb}.main:

Stores links to admin functionality for each Cubo.
Ensure admin link generation aligns with:
php
Copy
Edit


 created in gen_admin.cubo where is the main mapping of the module
 passed in mains and maincubo
to maingrp has the group of mains defaults,
schema
----------
gen_admin.cubo  setup
publicdb.maingrp routes group (linked with cubo)
publicdb.main: a cubo may have one or multiple mains (linked with maingrp, links)
publicdb.links the menu links  (linked with linkgrp, parent)
publicdb.linksgrp just a new menu
publicdb.maincubo: THE CONSTRUCTION layout with all the cubos build in each page
{$this->publicdb}.maingrp
{$this->publicdb}.main
------------
1) default is a cubo with login, 404 etc
2) main(s) are pages by default contains cubo.mains at the m area
3) cubo is a resource

- admin>layout UI for building mains
- construction in the maincubo
- json in main.mainplan

cubos with main cubo => cubo.mains if null just a module in layout construction

cubo --> maingrp --> main (instance of cubo in )--> links (menuid)-->linkgrp (menu) --> maincubo (construction)
either have links
required admin.php main maingrp=5
πέρα απ'το Cubo class που έχει ολα τα διαχειριστικά, βολεύει κάθε Cubo να έχει δικό του

Δημουργία -> σβήσιμο createCubo, setupCubo, totalDeleteCubo

*/

trait Cubo {

/**
reading manifest.yaml from fs cubos/[cubo]/manifest.yaml
 cubo installation if cubo.mains
  1) cubo.sql not null foreach cubo.mains as main... mysql > sql/[main].sql and an sql folder sql in publicdb
  2) cubo.mains not null gen_admin.links include cubos/[cubo]/admin.php page

 Moreover if cubo.main NOT EMPTY
 -----------------------------------------
  1) $this->db->inse($this->publicdb.".maingrp",array); array= cuboid=cubo.id, name=cubo.name  return [insertedid]
  2) foreach yaml.mains as  $this->db->inse($this->publicdb.".main",array); array= maingrpid=[insertedid], name=cubo.main return []insertedmainid]
cubo.name > yaml.maykey split _ 0
  3) check if has links if checked $this->db->inse($this->publicdb.".links",array); array= links.title= ucFirst(cubo.name)
  4) foreach yaml.mains  $this->db->inse($this->publicdb.".maincubo",array); array=maincubo.mainid=[insertedmainid],maincubo.area='m', maincubo.cuboid=yaml.id, maincubo.name=cubo.name
 */

protected function addHeaderCubo(string $cubo){
        $title = implode(' ', array_map('ucfirst', explode('.', $cubo)));
return "<h3>
                                         <input id='{$cubo}_panel' class='red indicator'>
                                         <a href='/$cubo'><span class='glyphicon glyphicon-edit'></span>$title</a>
                                         <button onclick='gs.dd.init()' class='bare toggle-button'>🖱️</button>
                                     </h3>";
}

protected function include_cubofile(string $file){
$file = is_array($file) ? $file['key'] : $file;

    $extension = pathinfo(CUBO_ROOT.$file, PATHINFO_EXTENSION);
    // Handle PHP files with output buffering
    if ($extension === 'php') {
        if (ob_get_level()) {
            ob_end_clean(); // Clears existing buffer
        }
        ob_start();
        // Include the file
        include CUBO_ROOT.$file;

        $output = ob_get_clean(); // Capture the output
        flush(); // Ensure all output is flushed
        return $output;
    }
}
 /**
  A manifest.yml is started in a new folder with the basic configuration files
  */
protected function createCubo(string $name): bool|int {
    //Step 1 -  Create folder and files
    $cuboDir = CUBO_ROOT . $name . '/';
    if (!mkdir($cuboDir, 0777, true)) {
        return false;
    }

    //Step 2 -  Create public.php
    $publicFilePath = $cuboDir . 'public.php';
    $publicContent = "<?php\n";
    $publicContent .= "// Auto-generated public.php file for cubo: $name\n\n";
    $publicContent .= "echo 'Welcome to the $name cubo!';\n";
    if (file_put_contents($publicFilePath, $publicContent) === false) {
        return false;
    }

    //Step 3 -  Create admin.php
    $adminFilePath = $cuboDir . 'admin.php';
    $adminContent = "<?php\n";
    $adminContent .= "// Auto-generated admin.php file for cubo: $name\n\n";
    $adminContent .= "echo 'Admin panel for the $name cubo.';\n";
    if (file_put_contents($adminFilePath, $adminContent) === false) {
        return false;
    }

// Step 4 - Create manifest.yaml
$manifestFilePath = $cuboDir . 'manifest.yml';

// Initialize YAML content
$manifestContent = "{$name}_cubo:\n";
$manifestContent .= "  mains:\n";
$manifestContent .= "    # Add your main files here (indented correctly)\n";
$manifestContent .= "  sql:\n";
$manifestContent .= "    # Add your SQL files here (indented correctly)\n";

// Write to the YAML file
if (file_put_contents($manifestFilePath, $manifestContent) === false) {
    echo "Error: Unable to create manifest file at $manifestFilePath\n";
    return false;
}


    //Step 5 -  Run shell command to set permissions
    $command = 'chmod -R 755 ' . escapeshellarg($cuboDir);
    $result = $this->runShellCommand($command);
    if ($result['status'] !== 0) {
        throw new Exception('Permission setting failed: ' . $result['error']);
    }

    return $result;
}

/**
After edited the manifest.yml file & the sql files are created
 @setupCubo all db mains & sql installation
 */
protected function setupCubo($name = '') {
    $cuboDir = CUBO_ROOT . $name . '/';
    $setupPath = $cuboDir . 'manifest.yml';
        xecho(GLOB("$cuboDir*"));
    // Check if manifest.yml exists
    if (!file_exists($setupPath)) {
        throw new Exception("Setup file not found for cubo: $name");
    }
    // Parse manifest.yml
    $setup = yaml_parse_file($setupPath);
    $cuboName = $name; // Use the cubo name directly

    //step 1: setup cubo table into the database
        $sqls=!empty($setup['sql']) ? implode(',',$setup['sql']):'';
        $mains=!empty($setup['main']) ? implode(',',$setup['main']):'';
        $data = [
            'name' => $name,
            'tables' => $sqls,
            'mains' => $mains
        ];
     $cuboId = $this->db->inse("gen_admin.cubo", $data);

    // Step 2: Process SQL scripts
if (!empty($setup['sql'])) {
    foreach ($setup['sql'] as $sqlFile) {
        $sqlFilePath = $cuboDir . 'sql/' . $sqlFile . '.sql';
        // Ensure the file exists before running the MySQL command
        if (file_exists($sqlFilePath)) {
           $returnVar= $this->db->runSqlFile($sqlFilePath);
            // Check for command success
            if ($returnVar !== 0) {
                echo "Error running SQL script: $sqlFilePath\n";
            } else {
                echo "Successfully ran SQL script: $sqlFilePath\n";
            }
        } else {
            echo "SQL file not found: $sqlFilePath\n";
        }
    }
}

// Step 3: Process Main PHP files
if (!empty($setup['main'])) {
    foreach ($setup['main'] as $mainFile) {
        $mainFilePath = $cuboDir . $name . '/main/' . $mainFile . '.php';

        // Create the file with an example if it doesn't already exist
        if (!file_exists($mainFilePath)) {
            $exampleContent = "<?php\n\n// Example content for $mainFile\n";
            $exampleContent .= "// Generated on " . date('Y-m-d H:i:s') . "\n\n";
            file_put_contents($mainFilePath, $exampleContent);

            echo "Created file: $mainFilePath\n";
        } else {
            echo "File already exists: $mainFilePath\n";
        }
    }
}
    // Step 4: Insert cubo metadata into `maingrp`
    $maingrpData = [
        'cuboid' => $cuboId, // Assuming a cubo ID has been created
        'name' => $cuboName,
        'description' => $setup['description'] ?? ''
    ];
    $maingrpGrpId = $this->db->inse("$this->publicdb.maingrp", $maingrpData);
    if($maingrpGrpId){
    echo "Inserted maincubo $maingrpGrpId";
    }

    // Step 5: Insert `mains` components into `main` table
    if (!empty($setup['mains'])) {
        foreach ($setup['mains'] as $main) {
            $mainData = [
                'maingrpid' => $maingrpGrpId,
             'manifest' => "m:\\n -\"$main\"",
                'name' => $main
            ];
            $insertedMainId = $this->db->inse("$this->publicdb.main", $mainData);

            // Step 4: Insert into `maincubo` table for each main
            $mainCuboData = [
                'mainid' => $insertedMainId,
                'area' => 'm',
                'cuboid' => $insertedGrpId,
                'name' => $cuboName
            ];
            $insertedMaincuboId = $this->db->inse("$this->publicdb.maincubo", $mainCuboData);
            if($insertedMaincuboId){
            echo "Inserted maincubo $insertedMaincuboId";
            }
        }
    }

// Step 6: Insert to admin/cubo navigation & mainplan of running in admin
    $adminFilePath = $cuboDir . 'admin.php';
    if (file_exists($adminFilePath)) {
    // Step 5: Insert links for admin.php if it exists
        $linksData = [
            'maingrpid' => 5,
            'name' => $name,
            'title' => ucfirst($name),
            'manifest' => "m:\\n -renderCubo:\"$name./admin.php\"",
        ];
        $mainId = $this->db->inse("{$this->publicdb}.main", $linksData);
            if($mainId){
                    echo "Inserted main $mainId";
                    }
    }

    return true; // Return success
}

protected function totalDeleteCubo(string $name): bool {
    // Validate input
    if (empty($name)) {
        echo "Error: Cubo name cannot be empty.\n";
        return false;
    }

    // Directory paths
    $cuboDir = CUBO_ROOT."$name/";

    // Step 1: Delete files and directories
    if (is_dir($cuboDir)) {
        if (!delTree($cuboDir)) {
            echo "Error: Failed to delete directory $cuboDir.\n";
            return false;
        }
        echo "Directory $cuboDir deleted successfully.\n";
    } else {
        echo "Directory $cuboDir does not exist.\n";
    }

    // Step 2: Delete related database entries
    try {
        $this->db->q("DELETE FROM gen_admin.cubo WHERE name = ?", [$name]);
        $this->db->q("DELETE FROM {$publicdb}.maingrp WHERE name = ?", [$name]);
        $this->db->q("DELETE FROM gen_admin.maincubo WHERE name = ?", [$name]);
        $this->db->q("DELETE FROM {$this->publicdb}.main WHERE name = ?", [$name]);

        echo "Database entries for `$name` deleted successfully.\n";
    } catch (PDOException $e) {
        echo "Error deleting database entries for `$name`: " . $e->getMessage() . "\n";
        return false;
    }

    // Step 3: Drop the database (if applicable)
    try {
        if ($this->drop("$name", 'table')) {
            echo "Database `$name` dropped successfully.\n";
        } else {
            echo "Failed to drop table `$name`.\n";
        }
    } catch (InvalidArgumentException $e) {
        echo "Error: " . $e->getMessage() . "\n";
        return false;
    } catch (PDOException $e) {
        echo "Database error: " . $e->getMessage() . "\n";
        return false;
    }

    echo "Total deletion of Cubo `$cubo` completed successfully.\n";
    return true;
}

//check if cubo has
protected function checkUpdateCubo($table = '',$name = '') {
//fs

//sql

}


protected function getLinks() {
            return $this->db->fa("SELECT * FROM {$this->publicdb}.links WHERE linksgrpid=2 ORDER BY sort");
    }

protected function updateCuboImg($table = '',$name = '') {
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
    $query='SELECT * FROM cubo ORDER BY valuability DESC';
    $sel=$this->db->fa($query);
    $count = count($this->db->fa($query));
       // Create buffer for output
    $params['statuses']=[0=>'archived',1=>'deprecated',2=>'pending',3=>'active'];
       $buffer['count'] = $count;
       $buffer['list'] = $sel;
       $buffer['html'] = $this->include_buffer(ADMIN_ROOT."main/cubos/cubos_buffer.php", $sel,$params);
       return $buffer;
   }


/**
 * Adds a 'files' key to each cubo with a file list from glob(CUBO_ROOT.'cubo.name/*')
 */
protected function getCubos(): array
{
    $cubos = $this->db->fa('SELECT * FROM gen_admin.cubo');
    if (!is_array($cubos)) {
        return [];
    }
    foreach ($cubos as &$cubo) {
        $cubo_path = $this->G['CUBO_ROOT'] . $cubo['name'];
        $file_list = glob($cubo_path . '/*');
        if ($file_list === false) {
           $file_list = [];
        }
          //Convert file list from full path to just file name.
    //     $base_name_list = array_map(function($path) {
      //        return basename($path);
       // }, $file_list);
        $cubo['files'] = $file_list;
    }
    return $cubos;
}

    // Retrieve cubos logs
    protected function getCuboLogs(int $widgetId): array {
        return $this->db->fa('SELECT * FROM gen_admin.cubo_logs WHERE widget_id =? ',[$widgetId]);
    }
    // Retrieve cubos logs
    protected function test(): array {
	return ["my"=>'love'];
	}
    protected function getSystemLogsBuffer(): ?array {
       $buffer = array();
        $sel = array(); 
		$query='SELECT systems.*,system_ver.* FROM gen_admin.systems left join system_ver ON systems.id=system_ver.systemsid ';
		$selsystems=$this->db->fa($query);
			for($i=0;$i<count($selsystems);$i++) { 
				$sel[$selsystems[$i]["systemsid"]][]=$selsystems[$i];
			}      
        // Create buffer for output		
        $buffer['count'] = count($selsystems);
        $buffer['list'] = $sel;
    //    $buffer['html'] = $this->include_buffer(ADMIN_ROOT."main/admin/system_buffer.php", $sel);
        return $buffer;
    }
    // Update a widget
    protected function updateCubo(int $id, array $data): bool {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[] = "$key = :$key";
        }
        $sql = 'UPDATE gen_admin.cubo SET ' . implode(', ', $fields) . ' WHERE id = ?';
        return $this->db->q($sql,[$id]);
    }

    // Add a new widget
    protected function addCubo(array $data): bool {
        $keys = array_keys($data);
        $columns = implode(', ', $keys);
        $placeholders = ':' . implode(', :', $keys);
        $sql = "INSERT INTO cubos ($columns) VALUES ($placeholders)";
        return $this->db->q($sql);
    }

    // Delete a widget
    protected function deleteCubo(string $name): bool {
        return $this->db->q('DELETE FROM gen_admin.cubos WHERE name =?',[$id]);
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

protected function renderCubo($cubo){
    // Check if the $cubo contains a slash
    if (strpos($cubo, '.') !== false) {
        $file = explode('.', $cubo)[1];
        $c = explode('.', $cubo)[0];
        $url = SITE_URL . "cubos/index.php?cubo=$c&file=$file.php";
    }else{

        $url = SITE_URL . "cubos/index.php?cubo=$cubo&file=public.php";
    }

    // Fetch the URL with the correct cubo and file (public.php by default)
    return $this->fetchUrl($url);
}


/**
 * Renders a section containing multiple cubos.
 */
protected function renderCubos($pc, $area){
    echo "<div id=\"$area\">";
        if (!empty($pc[$area]) && is_array($pc[$area])) {  // 🔹 Ensure it's an array
            foreach ($pc[$area] as $cubo) {
                echo "<div class=\"cubo\">";
                try {
                    //$this->safeInclude(CUBO_ROOT . $cubo . "/public.php", "Error loading $cubo");
                    //$this->safeInclude(CUBO_ROOT . $cubo . "/public.php", "Error loading $cubo");
                    $this->renderCubo($cubo);
                } catch (\Throwable $e) {
                    echo "<!-- Error: " . $e->getMessage() . " -->";
                }
                echo "</div>";
            }
        }
    echo "</div>";
}


    protected function buildCubo(string $name){
      $cubo= $this->getCubo($name);
      if(!$cubo['mains']){
      include CUBO_ROOT.$name."/public.php";
      }else{
      include CUBO_ROOT.$name."/mains/$name.php";
      }
    }
    // Other methods (existing)...

protected function getUsers() {
        return $this->db->fa("SELECT * FROM {$this->publicdb}.user");
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
              FROM {$this->publicdb}.comment
              LEFT JOIN user ON comment.uid=user.id
              WHERE comment.type=? AND comment.typeid=? AND comment.reply_id=0
              ORDER BY comment.created DESC", [$type, $_GET['id']]);
            // Insert replies into comments
            if (!empty($sel)) {
                foreach ($sel as $i => $comment) {
                    $sel[$i]['replies'] = $this->db->fa("SELECT comment.*, CONCAT(user.firstname,' ',user.lastname) AS fullname, user.img
                                                         FROM {$this->publicdb}.comment
                                                         LEFT JOIN user ON comment.uid=user.id
                                                         WHERE comment.reply_id=?
                                                         ORDER BY comment.created DESC", [$comment['id']]);
                }
            }
            return $sel;
        }

protected function getMaincubo($pageName = '') {
    $page = is_array($pageName) ? $pageName['key'] : ($pageName !== '' ? $pageName : $this->page);
    $list = [];

    // Ensure we fetch multiple rows
    $fetch = $this->db->fa("SELECT maincubo.area,maincubo.method, maincubo.name as cubo
        FROM {$this->publicdb}.maincubo
        LEFT JOIN {$this->publicdb}.main ON main.id = maincubo.mainid
        WHERE main.name = ?", [$page]);

    if (!empty($fetch) && is_array($fetch)) {
        foreach ($fetch as $row) {
            $list[$row['area']][$row['method']] = $row['cubo'];
        }
    }
    return $list;
}



//yaml methods

protected function loadConfig($filePath) {
    return Yaml::parseFile($filePath);
}

protected function sendWsNotification($message) {
    $wsUrl = "wss://".$_SERVER['SERVER_NAME'].":3010/?userid=1";
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
            $this->db->exec($config['setup']['sql']);
            echo "Setup Complete: " . $config['description'];
            sendWsNotification($config['notifications']['ws']);
            break;
        case 'update':
            $this->db->exec($config['update']['sql']);
            echo $config['update']['message'];
            sendWsNotification($config['notifications']['ws']);
            break;
        case 'uninstall':
            $this->db->exec($config['uninstall']['sql']);
            echo $config['uninstall']['message'];
            break;
        default:
            echo "Invalid action.";
    }
}



}

