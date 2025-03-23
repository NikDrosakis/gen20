<?php
namespace Core;
use Exception;

trait Cubo {

protected function syncFSCubo($fsPath) {
    // Scan the FS for cubo files
    $cuboFiles = glob($fsPath . '/*.json'); // Assuming JSON files for cubo data

    foreach ($cuboFiles as $file) {
        // Read the JSON file
        $cuboData = json_decode(file_get_contents($file), true);

        if ($cuboData) {
            // Check if the cubo already exists in the database
            $cuboId = $cuboData['id'] ?? null;
            $existingCubo = $this->getCuboById($cuboId);

            if ($existingCubo) {
                // Update the existing cubo
                $this->updateCubo($cuboData);
                echo "Updated cubo: {$cuboData['name']}\n";
            } else {
                // Insert a new cubo
                $this->insertCubo($cuboData);
                echo "Inserted new cubo: {$cuboData['name']}\n";
            }
        }
    }
}

protected function getCuboById($id) {
    return $this->db->f("SELECT * FROM gen_admin.cubo WHERE id = ?", [$id]);
}

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
protected function addMainCubo(string $name): bool|int {
    //Step 1 -  Create folder and files
    $cuboDir = CUBO_ROOT . $name . '/main';
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

protected function setupInDomainCubo($domain='', $name = '') {


}
/**
based on yaml

 */
protected function createYaml2Cubo($name = '') {
    $cuboDir = CUBO_ROOT . $name . '/';
    $setupPath = $cuboDir . 'manifest.yml';
      //  xecho(GLOB("$cuboDir*"));
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

    $cuboFolder = $db=='gen_admin' ? ADMIN_IMG_ROOT . $cubo . "/" : $this->CUBO_ROOT . $cubo . "/";
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
        $cubo_path = $this->CUBO_ROOT . $cubo['name'];
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


protected function renderCubo($cubo) {
    try {
        // Check if the $cubo contains a dot
        if (strpos($cubo, '.') !== false) {
            list($c, $file) = explode('.', $cubo);
            $url = SITE_URL . "cubos/index.php?cubo=$c&file=$file.php";
        } else {
            $url = SITE_URL . "cubos/index.php?cubo=$cubo&file=public.php";
        }
        // Fetch the URL with the correct cubo and file
        $response = $this->fetchUrl($url);

        // If the response is an array, return the 'data' key
        if (is_array($response) && isset($response['data'])) {
            return $response['data'];
        }

        // If the response is a string, return it directly
        if (is_string($response)) {
            return $response;
        }

        // Fallback if the response is invalid
        return "<p>Error: Invalid cubo response for '$cubo'.</p>";
    } catch (Exception $e) {
        // Log the error and return a fallback message
        error_log("Error rendering cubo '$cubo': " . $e->getMessage());
        return "<p>Error loading cubo '$cubo'.</p>";
    }
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


}