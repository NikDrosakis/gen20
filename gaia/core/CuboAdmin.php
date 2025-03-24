<?php
namespace Core;
use Exception;

trait CuboAdmin {
/**
db gen_admin data received from API
tables cubo, cubo_default, cuboviews, cubo_ver
and viewed in layout and manifest Editor
- addCA
- delCA
- addMainCA
- delMainCA
- maintainCA
- backupCA

fs and db


*/
protected function addMainCA(string $cuboname, int $cuboid, string $mainame) {
    // Validate $cuboid
    if (!is_int($cuboid)) {
        echo "❌ Invalid cuboid: $cuboid (must be an integer)\n";
        return false;
    }

    // Step 1 - Create main entry in the database
    $mainid = $this->db->inse("gen_admin.cuboview", ["name" => "$cuboname.$mainame", "cuboid" => $cuboid]);

    if ($mainid) {
        $cuboDir = CUBO_ROOT . $cuboname . '/main';
        $publicFilePath = $cuboDir . '/' . $mainame . '.php';
        $publicContent = "<?php\n";
        $publicContent .= "// Auto-generated $mainame file for cubo: $cuboname\n\n";
        $publicContent .= "echo 'Welcome to $cuboname cubo main $mainame!';\n";

        // Ensure the directory exists
        if (!is_dir($cuboDir)) {
            if (!mkdir($cuboDir, 0777, true)) {
                echo "❌ Failed to create directory: $cuboDir\n";
                return false;
            }
        }

        // Write content to file
        if (file_put_contents($publicFilePath, $publicContent) === false) {
            echo "❌ Failed to write to file: $publicFilePath\n";
            return false;
        }

        echo "✅ Created file: $publicFilePath\n";
        return true;
    } else {
        echo "❌ Insert Main of $cuboname not correct\n";
        return false;
    }
}

protected function delMainCA(string $cuboname, int $cuboid, string $mainame) {
    $cuboDir = CUBO_ROOT . $cuboname . '/main';
    $publicFilePath = $cuboDir . '/' . $mainame . '.php';
    // Validate $cuboid
    if (!is_int($cuboid)) {
        echo "❌ Invalid cuboid: $cuboid (must be an integer)\n";
        return false;
    }
// Step 1 - Create main entry in the database
    $delmainid = $this->db->q("DELETE FROM gen_admin.cuboview where name='$cuboname.$mainame' AND cuboid=$cuboid");
    if(!$delmainid){
     echo "❌ Failed to delete main: $cuboname\n";
        return false;
    }

    if (file_exists($publicFilePath)) {
        if (!unlink($publicFilePath)) {
            echo "❌ Failed to delete file: $publicFilePath\n";
            return false;
        }
        echo "✅ Deleted file: $publicFilePath\n";
    } else {
        echo "⚠️ File not found: $publicFilePath\n";
    }
}

protected function addCA(string $name, array $mains=[]){

    //Step 1 -  Create folders
    //create main folder
    $cuboDir = CUBO_ROOT . $name . '/main';
    if (!mkdir($cuboDir, 0777, true)) {
        return false;
    }
    //create asset folder
    if (!mkdir(CUBO_ROOT . $name . '/asset', 0777, true)) {
        return false;
    }


    //Step 2 - write tables
    try {
        $cuboid = $this->db->inse("gen_admin.cubo",["name"=>$name]);
        echo "Database entries for `$name` inserted successfully.\n";
    } catch (PDOException $e) {
        echo "Error inserting entry for `$name`: " . $e->getMessage() . "\n";
        return false;
    }

    //Step 3 - Create public & admin file

    $cuboid=(int)$cuboid;
    if(empty($mains)){
        $this->addMainCA($name,$cuboid,"public");
        $this->addMainCA($name,$cuboid,"admin");
    }else{
        foreach($mains as $main){
            $this->addMainCA($name,$cuboid,$main);
            $this->addMainCA($name,$cuboid,$main."_admin");
        }
    }

    // Step 4 - Create manifest.yaml
    $manifestFilePath = CUBO_ROOT . $name . '/manifest.yml';
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


}

protected function delCA(string $name): bool {
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
        echo "Database entries for `$name` deleted successfully.\n";
    } catch (PDOException $e) {
        echo "Error deleting database entries for `$name`: " . $e->getMessage() . "\n";
        return false;
    }

    //TODO backup for undelete
    echo "Total deletion of Cubo `$cubo` completed successfully.\n";
    return true;
}

protected function maintainCA(): void {
    // Step 1: Scan the file system for cubo directories
    $cuboDirs = glob(CUBO_ROOT . '/*', GLOB_ONLYDIR);

    foreach ($cuboDirs as $cuboDir) {
        $cuboname = basename($cuboDir);
        echo "Checking cubo: $cuboname\n";

        // Step 2: Check if the cubo exists in the database
        $cuboid = $this->db->f("SELECT id FROM gen_admin.cubo WHERE name = ?", [$cuboname])['id'];

        if (!$cuboid) {
            // Cubo directory exists but no DB entry
            echo "❌ Cubo '$cuboname' exists in FS but not in DB. Adding to DB...\n";
            $cuboid = $this->db->inse("gen_admin.cubo", ["name" => $cuboname]);
            if (!$cuboid) {
                echo "❌ Failed to add cubo '$cuboname' to DB.\n";
                continue;
            }
            echo "✅ Added cubo '$cuboname' to DB with ID: $cuboid.\n";
        } else {
            echo "✅ Cubo '$cuboname' exists in DB with ID: $cuboid.\n";
        }

        // Step 3: Check the 'main' directory for files
        $mainDir = $cuboDir . '/main';
        if (is_dir($mainDir)) {
            $mainFiles = glob($mainDir . '/*.php');

            foreach ($mainFiles as $mainFile) {
                $mainame = basename($mainFile, '.php');
                echo "Checking main file: $mainame\n";

                // Check if the main file exists in the database
                $mainExists = $this->db->f(
                    "SELECT id FROM gen_admin.cuboview WHERE name = ? AND cuboid = ?",
                    ["$cuboname.$mainame", $cuboid]
                )['id'];

                if (!$mainExists) {
                    // Main file exists in FS but not in DB
                    echo "❌ Main file '$mainame' exists in FS but not in DB. Adding to DB...\n";
                    $mainid = $this->db->inse("gen_admin.cuboview", [
                        "name" => "$cuboname.$mainame",
                        "cuboid" => $cuboid
                    ]);
                    if (!$mainid) {
                        echo "❌ Failed to add main file '$mainame' to DB.\n";
                        continue;
                    }
                    echo "✅ Added main file '$mainame' to DB with ID: $mainid.\n";
                } else {
                    echo "✅ Main file '$mainame' exists in DB.\n";
                }
            }
        } else {
            echo "⚠️ Main directory not found for cubo '$cuboname'.\n";
        }

        // Step 4: Check the database for missing files
        $dbMains = $this->db->fa(
            "SELECT name FROM gen_admin.cuboview WHERE cuboid = ?",
            [$cuboid]
        );

        foreach ($dbMains as $dbMain) {
            $mainame = str_replace("$cuboname.", "", $dbMain['name']);
            $mainFile = $mainDir . '/' . $mainame . '.php';

            if (!file_exists($mainFile)) {
                // Main entry exists in DB but not in FS
                echo "❌ Main file '$mainame' exists in DB but not in FS. Adding to FS...\n";
                $this->addMainCA($cuboname, $cuboid, $mainame);
            }
        }
    }

    // Step 5: Check for orphaned database entries (cubos with no corresponding directory)
    $dbCubos = $this->db->fa("SELECT id, name FROM gen_admin.cubo");

    foreach ($dbCubos as $dbCubo) {
        $cuboname = $dbCubo['name'];
        $cuboid = $dbCubo['id'];
        $cuboDir = CUBO_ROOT . '/' . $cuboname;

        if (!is_dir($cuboDir)) {
            // Cubo exists in DB but not in FS
            echo "❌ Cubo '$cuboname' exists in DB but not in FS. Deleting from DB...\n";
            $this->db->q("DELETE FROM gen_admin.cubo WHERE id = ?", [$cuboid]);
            echo "✅ Deleted cubo '$cuboname' from DB.\n";
        }
    }

    echo "Maintenance completed.\n";
}

protected function backupCA(): void {
    // Define backup root directory
    $backupRoot = CUBO_BACKUP_ROOT ?? (CUBO_ROOT . '/backups');
    if (!is_dir($backupRoot)) {
        if (!mkdir($backupRoot, 0777, true)) {
            echo "❌ Failed to create backup directory: $backupRoot\n";
            return;
        }
    }

    // Create a timestamped backup directory
    $timestamp = date('Ymd_His');
    $backupDir = $backupRoot . '/' . $timestamp;
    if (!mkdir($backupDir, 0777, true)) {
        echo "❌ Failed to create backup directory: $backupDir\n";
        return;
    }
    echo "✅ Created backup directory: $backupDir\n";

    // Step 1: Backup the file system
    $cuboDirs = glob(CUBO_ROOT . '/*', GLOB_ONLYDIR);
    foreach ($cuboDirs as $cuboDir) {
        $cuboname = basename($cuboDir);
        echo "Backing up cubo: $cuboname\n";

        // Create a compressed archive of the cubo directory
        $backupFile = $backupDir . '/' . $cuboname . '.zip';
        $zip = new \ZipArchive();
        if ($zip->open($backupFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($cuboDir),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($cuboDir) + 1);
                    $zip->addFile($filePath, $relativePath);
                }
            }

            $zip->close();
            echo "✅ Backed up cubo '$cuboname' to: $backupFile\n";
        } else {
            echo "❌ Failed to create backup archive for cubo '$cuboname'.\n";
        }
    }

    // Step 2: Backup the database
    $backupSqlFile = $backupDir . '/cubo_db_backup.sql';
    $tables = ['gen_admin.cubo', 'gen_admin.cuboview']; // Add other tables if needed

    $sqlDump = '';
    foreach ($tables as $table) {
        // Get table structure
        $createTable = $this->db->q("SHOW CREATE TABLE $table")->fetchColumn(1);
        $sqlDump .= $createTable . ";\n\n";

        // Get table data
        $rows = $this->db->fa("SELECT * FROM $table");
        foreach ($rows as $row) {
            $columns = implode('`, `', array_keys($row));
            $values = implode("', '", array_map([$this->db, 'escape'], array_values($row)));
            $sqlDump .= "INSERT INTO `$table` (`$columns`) VALUES ('$values');\n";
        }
        $sqlDump .= "\n";
    }

    if (file_put_contents($backupSqlFile, $sqlDump) === false) {
        echo "❌ Failed to write SQL dump to: $backupSqlFile\n";
    } else {
        echo "✅ Backed up database to: $backupSqlFile\n";
    }

    echo "Backup completed.\n";
}

}