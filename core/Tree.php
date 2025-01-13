<?php
namespace Core;
use PDO;
use PDOException;
use Form;
/**
 DOC
 ==
 Database-Centric Logic is created by foreign-keys in relational Maria.
 This is the core idea of the GEN20 that introduces language agnosticism starting from PHP & React Apps using Cubos
 Form is the functional level of the page. Here is the Schema.
  getBranches() shows the schema all tables with their parent and connection id

  Two Trees, the Core of GPM and the core of Public
  systems have action_task and make actions

create prototype of the public based on tree

  Ethics
  1) Table has id, sort
  2) Mysql.COMMENTS are properties that Form use, ALSO table format gives building instruction
  3) sort is necessary, img comments img-upload
  4) connected have selectG (from G array)/ENUM or selectjoin-table.rowid
 5) auto more standards
the cms is
post with parent
user with parent >
child: comment
child: subscribe

6) add language title description

TODO
====
doc standard to admin_sub admin_page and visible only to TEMPLATE.?grp tables


 */

trait Tree {
protected $pdo;
protected $branches = [];
protected $standardSchema=[
    "`id` INT UNSIGNED NOT NULL AUTO_INCREMENT",
    "`sort` INT UNSIGNED NOT NULL DEFAULT 0",
    "`img` VARCHAR(200) DEFAULT NULL COMMENT 'img-upload'",
    "`name` VARCHAR(300) NOT NULL",
    "`title` VARCHAR(200) DEFAULT NULL COMMENT 'loc'",
    "`description` TEXT DEFAULT NULL COMMENT 'loc'",
    "`status` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'selectG-status'",
    "`created` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'readonly'"
];
protected $standardPublicTables=[];  //add to integrate other website
//protected function

protected function connectTree($dbname = null) {
    try {
        // If a specific database is provided, use it; otherwise, connect without specifying a database
        $dsn = $dbname ? 'mysql:host=localhost;dbname=' . $dbname : 'mysql:host=localhost';

        // Create a new PDO instance
        $this->pdo = new PDO($dsn, 'root', 'n130177!');

        // Set the PDO error mode to exception
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Optionally return some feedback for successful connection
        // echo "Connected successfully to the MySQL server.";
    } catch (PDOException $e) {
        // Handle connection error
        echo "Connection failed: " . $e->getMessage();
    }

    return $this->pdo;
}

protected function getMariaTree(): array {
        // Connect to the server
        $this->connectTree();
        // Query to retrieve the list of databases
        $query = "SHOW DATABASES";
        $stmt = $this->pdo->query($query);
        // Fetch databases
        $databases = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $databases[] = $row['Database']; // Change 'Database' to the correct key if necessary
        }
        return $databases;
}

protected function getTablesWithDBs() {
    $this->connectTree();
    try {
        // SQL query to get all table names and their corresponding database schemas
        $sql = "SELECT TABLE_NAME, TABLE_SCHEMA
                FROM information_schema.TABLES";

        // Prepare the statement
        $stmt = $this->pdo->prepare($sql);

        // Execute the statement
        $stmt->execute();

        // Fetch all results as an associative array
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Create an associative array of tables and their databases
        $tablesWithDBs = [];
        foreach ($results as $row) {
            $tablesWithDBs[$row['TABLE_NAME']] = $row['TABLE_SCHEMA'];
        }

        return $tablesWithDBs;

    } catch (PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
        return false;
    }
}
protected function getDBfromTable($tableName) {
$table = is_array($tableName) ? $tableName['table'] : $tableName;
    $this->connectTree();
try {
        // SQL query to find the database containing the specified table
        $sql = "SELECT TABLE_SCHEMA
                FROM information_schema.TABLES
                WHERE TABLE_NAME = '$table'";
        // Prepare the statement
        $stmt = $this->pdo->prepare($sql);
        // Execute the statement
        $stmt->execute();
        // Fetch the result
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        // Display the result
        if ($result) {
            return $result['TABLE_SCHEMA'];
        } else {
            return false;
        }
    } catch (PDOException $e) {
        echo 'Connection failed: ' . $e->getMessage();
    }
}

protected function listMariaTables($tableName): array {
    // Fetch tables from the specified database
    $table = is_array($tableName) ? $tableName['table'] : $tableName;
    $this->connectTree();
//xecho($this->db);
//xecho($params);
//die();
    $database = $this->getDB($table);
    $query = $this->pdo->query("SHOW TABLES FROM `$database`");
    return $query->fetchAll(PDO::FETCH_COLUMN);
}

protected function recognizeDatabases(): array {
    // Get all databases
    $stmt = $this->pdo->query("SHOW DATABASES");
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Define a list to hold recognized system databases
    $systemDatabases = [];
    $potentialDatabases = [];

    // Example naming conventions (you can customize this)
    $systemPrefix = 'sys_';  // Prefix for system databases
    $potentialPrefix = 'pot_';  // Prefix for potential databases

    foreach ($databases as $database) {
        // Check if the database belongs to the system
        if (strpos($database, $systemPrefix) === 0) {
            $systemDatabases[] = $database;
        } elseif (strpos($database, $potentialPrefix) === 0) {
            $potentialDatabases[] = $database;
        }
    }
    // Fetch tables for recognized system databases
    $tables = [];
    foreach ($systemDatabases as $db) {
        $tables[$db] = $this->listMariaTables($db);
    }

    return [
        'system_databases' => $systemDatabases,
        'potential_databases' => $potentialDatabases,
        'tables' => $tables
    ];
}

    protected function createStandardSchema($db,$table){
 // SQL to create the table
    $sql = "CREATE TABLE `$table` (";
    $sql .= implode(', ', $this->standardSchema);
    $sql .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    // Execute the query and handle potential errors
    try {
        $this->{$db}->exec($sql);
        echo "Table `$table` created successfully.\n";
    } catch (PDOException $e) {
        echo "Error creating table `$table`: " . $e->getMessage() . "\n";
    }
    }

protected function insertTablesIntoMetadata($database) {
    // Get the list of tables
    $tables = $this->{$database}->listTables();
    // Prepare the insert statement

    $insertQuery = "INSERT INTO metadata (name, title, description, status) VALUES (?, ?, ?, ?)";
    foreach ($tables as $table) {
        // You might want to set title and description based on your requirements
        $title = ucfirst($table); // Example title (capitalized table name)
        $description = "Description for " . $table; // Example description
        $status = 1; // Example status (set to 1 for active)
        $this->$database->q($insertQuery,[$table, $title, $description, $status]);
    }
}
// Output the results
/*  foreach ($foreignKeys as $fk) {
    echo "Child Table: " . $fk['child_table'] . ", Child Column: " . $fk['child_column'] .
         ", Parent Table: " . $fk['parent_table'] . ", Parent Column: " . $fk['parent_column'] . "\n";
         */
protected function getBranches(array $params): ?array {
 //$db= $database=='db' ? TEMPLATE : $database;
$this->connectTree();
$db = $params['db'];
         try{
            $tree="SELECT kcu.TABLE_NAME AS `child_table`,
                kcu.COLUMN_NAME AS `child_column`,
                kcu.REFERENCED_TABLE_NAME AS `parent_table`,
                kcu.REFERENCED_COLUMN_NAME AS `parent_column`
            FROM
                information_schema.KEY_COLUMN_USAGE kcu
            WHERE
                kcu.TABLE_SCHEMA = '$db'
                AND kcu.REFERENCED_TABLE_NAME IS NOT NULL";

        $res = $this->pdo->prepare($tree);
            $res->execute($params);
		if(!$res) return '';

    return $res->fetchAll(PDO::FETCH_ASSOC);

        } catch (PDOException $e) {
            echo "Database error: " . $e->getMessage();
        }
}

// Method to compare the current table schema with the standard schema and return modification lists
protected function compareWithStandard($table) {
    // Retrieve the current schema of the table
    $currentSchema = $this->getSchemaTable($table);

    // If the table does not exist, return an error message
    if (empty($currentSchema)) {
        echo "Table `$table` does not exist.\n";
        return [];
    }

    // Initialize arrays to store the lists
    $modificationList = [];  // For columns with different definitions
    $missingList = [];       // For missing columns
    $commonList = [];        // For extra columns not in the standard schema

    // 1. Compare each standard schema entry with the current schema
    foreach ($this->standardSchema as $standardColumn) {
        // Extract the column name and definition from the standard schema
        preg_match('/`([^`]+)`/', $standardColumn, $matches);
        $standardColumnName = $matches[1];

        if (!array_key_exists($standardColumnName, $currentSchema)) {
            // Column is missing in the current schema
            $missingList[] = "ADD COLUMN `$standardColumnName` $standardColumn";
        } elseif (trim($currentSchema[$standardColumnName]) !== trim($standardColumn)) {
            // Column exists but the definition is different
            $modificationList[] = "MODIFY COLUMN `$standardColumnName` $standardColumn";
        }
    }

    // 2. Check for extra columns in the current schema that are not in the standard schema
    foreach ($currentSchema as $currentColumn => $currentDefinition) {
        $standardColumnNames = array_map(function ($col) {
            preg_match('/`([^`]+)`/', $col, $matches);
            return $matches[1];
        }, $this->standardSchema);

        if (!in_array($currentColumn, $standardColumnNames)) {
            // Extra column in the current schema
            $commonList[] = "COMMON COLUMN `$currentColumn` exists but is not in the standard schema";
        }
    }

    // Return the modification lists
    return [
        'modificationList' => array_merge($missingList, $modificationList),
        'commonList' => $commonList,
    ];
}

// Method to apply schema modifications to the table
protected function applySchemaStandards($tableName) {
$table = is_array($tableName) ? $tableName['table'] : $tableName;
    // Get the list of modifications
    $compare = $this->compareWithStandard($table);

    // If there are no modifications, the table is up-to-date
    if (empty($compare['modificationList'])) {
        echo "Table `$table` is already up-to-date.\n";
        return;
    }
    // Prepare the ALTER TABLE SQL to apply the modifications
    $alterTableSql = "ALTER TABLE `$table` " . implode(", ", $compare['modificationList']) . ";";
    $database = $this->getDB($table);
    $maria= new Maria($database);
    // Execute the ALTER TABLE SQL
    try {
        $maria->exec($alterTableSql);
        echo "Modifications applied successfully to table `$table`.\n";
    } catch (PDOException $e) {
        echo "Error applying modifications to table `$table`: " . $e->getMessage() . "\n";
    }
}

// Method to generate a report for the table and provide an option to apply the changes
protected function compareWithStandardReport($table) {
//$table = is_array($tableName) ? $tableName['table'] : $tableName;
    // Ensure database and table are provided
    if ($table) {
        // Get the comparison result
        $compare = $this->compareWithStandard($table);

        // Initialize an array for the report output
        $report = [];

        // Report the modification list and provide an apply button
        if (!empty($compare['modificationList'])) {
            $report[] = "MODIFICATION LIST for table `$table`:\n" . implode("\n", $compare['modificationList']);
            $report[] = "<button onclick='gs.callapi.post(\"applySchemaStandards\", { table: \"$table\" })'>Apply</button>";
        }

        // Report any extra columns (common list)
        if (!empty($compare['commonList'])) {
            $report[] = "COMMON LIST for table `$table`:\n" . implode("\n", $compare['commonList']);
        }

        // If no modifications are required
        if (empty($compare['modificationList']) && empty($compare['commonList'])) {
            $report[] = "No modifications required for table `$table`.\n";
        }

        // Return the report array
        return $report;
    }
}

protected function generateFkReport(string $table,string $column) {

 $this->connectTree();
    $query = "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME
              FROM information_schema.KEY_COLUMN_USAGE
              WHERE REFERENCED_TABLE_NAME = '$table'
              AND REFERENCED_COLUMN_NAME = '$column'";

		$res = $this->pdo->prepare($query);
            $res->execute($params);
		if(!$res) return '';
    $foreignKeys = $res->fetchAll(PDO::FETCH_ASSOC);

   // $foreignKeys = $this->$db->fa($query); // Fetch all related foreign keys

   if(!empty($foreignKeys)) {foreach ($foreignKeys as $fk) {
        echo "Foreign Key Constraint: {$fk['CONSTRAINT_NAME']} in table {$fk['TABLE_NAME']} on column {$fk['COLUMN_NAME']}\n";
    }}
}
/***
   [0] => Array
         (
             [COLUMN_NAME] => id
             [COLUMN_TYPE] => int(11)
             [IS_NULLABLE] => NO
             [COLUMN_DEFAULT] =>
             [COLUMN_KEY] => PRI
             [EXTRA] => auto_increment
             [COLUMN_COMMENT] =>
         )
 */
protected function getSchemaTable($tableName): ?array {
xecho($tableName);
$table = is_array($tableName) ? $tableName['table'] : $tableName;
    // Fetch all columns from the query result
    $database=$this->getDB($table);
    $maria= new Maria($database);
    try {
        $columns = $maria->tableMeta($table);
        $schema = [];
        // Map the column details to a schema definition
        foreach ($columns as $column) {
            $columnName = $column['COLUMN_NAME'];
            $columnType = $column['COLUMN_TYPE'];
            // Check for nullability
            $isNullable = ($column['IS_NULLABLE'] === 'NO') ? 'NOT NULL' : 'DEFAULT NULL';

            // Set default value, ensuring it does not result in duplicate DEFAULT
            $default = '';
            if ($column['COLUMN_DEFAULT'] !== null) {
                // Use 'DEFAULT' only if the column is not already NULL
                if ($column['COLUMN_DEFAULT'] === 'NULL') {
                    $default = 'DEFAULT NULL';
                } else {
                    $default = "DEFAULT '{$column['COLUMN_DEFAULT']}'";
                }
            }
            // Set comment if it exists
            $comment = !empty($column['COLUMN_COMMENT']) ? "COMMENT '{$column['COLUMN_COMMENT']}'" : '';
            // Build the column definition string
            $columnDefinition = trim("$columnType $default $comment");
            $schema[$columnName] = trim($columnDefinition); // Trim to avoid extra spaces
        }
        return $schema;
    } catch (PDOException $e) {
        echo "Error retrieving schema for table `$table` in database `$database`: " . $e->getMessage() . "\n";
        return null; // Return null if an error occurs
    }
}

protected function buildSchema($tableName): string {
  // Fetch column information from information_schema
$table = is_array($tableName) ? $tableName['table'] : $tableName;
   $db=$this->getDB($table);
   $maria= new Maria($db);
   try {
    $columns = $maria->tableMeta($table);
    // Start building the HTML table
    $tableHtml = '<div class="table-container">';
    $tableHtml .= '<h2>Table Schema: ' . htmlspecialchars($table) . '</h2>';
    $tableHtml .= '<table class="styled-table">';
    $tableHtml .= '<thead><tr>';
    $tableHtml .= '<th>Column Name</th>';
    $tableHtml .= '<th>Type</th>';
    $tableHtml .= '<th>Null</th>';
    $tableHtml .= '<th>Default</th>';
    $tableHtml .= '<th>Key</th>';
    $tableHtml .= '<th>Extra</th>';
    $tableHtml .= '<th>Comment</th>';
    $tableHtml .= '</tr></thead>';
    $tableHtml .= '<tbody>';

    // Loop through each column and build the table rows
    foreach ($columns as $column) {
        $tableHtml .= '<tr>';
        $tableHtml .= '<td>' . htmlspecialchars($column['COLUMN_NAME']) . '</td>';
        $tableHtml .= '<td>' . htmlspecialchars($column['COLUMN_TYPE']) . '</td>';
        $tableHtml .= '<td>' . htmlspecialchars($column['IS_NULLABLE']) . '</td>';
        $tableHtml .= '<td>' . htmlspecialchars($column['COLUMN_DEFAULT'] ?? 'NULL') . '</td>';
        $tableHtml .= '<td>' . htmlspecialchars($column['COLUMN_KEY']) . '</td>';
        $tableHtml .= '<td>' . htmlspecialchars($column['EXTRA']) . '</td>';
        $tableHtml .= '<td>' . htmlspecialchars($column['COLUMN_COMMENT']) . '</td>';
        $tableHtml .= '</tr>';
    }

    // Close the table
    $tableHtml .= '</tbody></table></div>';
    return $tableHtml; // Return the HTML table
      } catch (PDOException $e) {
            echo "Error retrieving schema for table `$table` in database `$db`: " . $e->getMessage() . "\n";
            return null; // Return null if an error occurs
        }
}



///<-------------useful until here



















    protected function buildPublicPrototype() {
        $prototype_public_version= "0.42";
        $coresWithChildren= [
        "user"=>["comment","subscribe","media"],
        "post"=>["tax","media"]
        ];

    }

    protected function createPrototypeDatabase() {
        $dbName = "temp_prototype_db";

        // Create the database
        $this->db->exec("CREATE DATABASE IF NOT EXISTS $dbName");
        $this->db->exec("USE $dbName");

        // Call the method that defines core public schema
        $this->corePublicBranchSchema();

        // Create the core parents schema
        $coreParents = ["user", "post", "media", "tax"];
        foreach ($coreParents as $table) {
            $this->db->exec($this->corePublicParentSchema($table."grp"));
        }

        // Create children of cores
       // $coresWithChildren = [
         //   "user" => ["comment", "subscribe", "media"],
           // "post" => ["tax", "media"]
        //];

        //foreach ($coresWithChildren as $parent => $children) {
          //  foreach ($children as $child) {
            //    $this->db->exec($this->corePublicParentSchema($child));
            //}
        //}

        echo "Prototype database structure created successfully!";
    }

    protected function createDatabase($name){

    $version= "gs_core_42";
    $coresWithChildren= [
        "user"=>["comment","subscribe","media"],
        "post"=>["tax","media"]
        ];
    $coreParents= ["user","post","media","tax"];
    $this->corePublicBranchSchema();

//create children of cores
    foreach($coresWithChildren as $table){
    $this->corePublicParentSchema($table."grp");
    }
//create parents
    foreach($coreParents as $table){

    }

    }

    protected function corePublicParentSchema($table){
      $this->db->exec("
    CREATE TABLE `$table` IF NOT EXISTS (
      `id` INT UNSIGNED NOT NULL,
      `sort` INT DEFAULT `0`,
      `img` varchar(200) DEFAULT NULL COMMENT 'img-upload',
      `name` varchar(300) NOT NULL,
      `title` varchar(200) DEFAULT NULL,
      `description` text DEFAULT NULL,
      `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'selectG-status'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ");
    }
    protected function corePublicBranchSchema(){
    $this->db->exec("
    CREATE TABLE `user` IF NOT EXISTS (
      `id` int(11) UNSIGNED NOT NULL COMMENT 'auto',
      `usergrpid` smallint(5) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectjoin-usergrp.name',
      `mongoid` varchar(255) DEFAULT NULL,
      `libid` int(10) UNSIGNED NOT NULL DEFAULT 0,
      `img` varchar(100) DEFAULT NULL COMMENT 'img-upload',
      `name` varchar(100) DEFAULT NULL,
      `pass` varchar(100) DEFAULT NULL COMMENT 'hidden',
      `fullname` varchar(200) DEFAULT NULL,
      `firstname` varchar(100) DEFAULT NULL,
      `lastname` varchar(100) DEFAULT NULL,
      `title` varchar(300) DEFAULT NULL,
      `bio` mediumtext DEFAULT NULL,
      `url` varchar(100) DEFAULT NULL,
      `email` varchar(100) DEFAULT NULL,
      `city` mediumint(8) UNSIGNED NOT NULL DEFAULT 0,
      `tel` varchar(300) DEFAULT NULL,
      `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'selectG-status',
      `phase` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'selectG-phase',
      `display` tinyint(1) UNSIGNED NOT NULL DEFAULT 1,
      `lang` char(2) NOT NULL DEFAULT 'en' COMMENT 'selectG-langs',
      `auth` varchar(50) DEFAULT NULL,
      `sp` varchar(100) DEFAULT NULL COMMENT 'hidden',
      `privacy` tinyint(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectG-privacy',
      `last_login` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'readonly',
      `registered` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
      `modified` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
      `edited` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `post` IF NOT EXISTS (
  `id` int(10) UNSIGNED NOT NULL COMMENT 'auto',
  `mongoid` varchar(255) DEFAULT NULL,
  `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `userid` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectjoin-user.name',
  `taxid` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'selectjoin-tax.name',
  `uri` varchar(100) DEFAULT NULL,
  `img` varchar(200) DEFAULT NULL COMMENT 'img-upload',
  `title` varchar(200) DEFAULT NULL,
  `subtitle` varchar(200) DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `content` mediumtext DEFAULT NULL,
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'selectG-status',
  `postgrpid` tinyint(3) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectjoin-postgrp.name',
  `created` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'readonly',
  `modified` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly',
  `published` datetime DEFAULT NULL COMMENT 'readonly'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    ");

    }
    protected function mainCuboBranchSchema(){
    $this->db->exec("
            CREATE TABLE `main` (
              `id` int(11) UNSIGNED NOT NULL COMMENT 'auto',
              `name` varchar(255) NOT NULL,
              `img` varchar(255) DEFAULT NULL COMMENT 'img-upload',
              `title` varchar(255) DEFAULT NULL,
              `uri` varchar(255) DEFAULT NULL,
              `modified` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

            CREATE TABLE `cubo` (
              `id` int(10) UNSIGNED NOT NULL COMMENT 'auto',
              `sort` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
              `img` varchar(200) DEFAULT NULL COMMENT 'img-upload',
              `name` varchar(255) NOT NULL,
              `description` text DEFAULT NULL,
              `todo` text DEFAULT NULL,
              `version` decimal(5,2) UNSIGNED DEFAULT 0.00,
              `status` tinyint(1) UNSIGNED DEFAULT 0 COMMENT 'selectG-status',
              `has_admin` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
              `valuability` tinyint(3) DEFAULT 0,
              `flag` tinyint(1) DEFAULT 0,
              `ideally` text DEFAULT NULL,
              `layout_views` int(11) NOT NULL COMMENT 'readonly',
              `total_duration` int(11) NOT NULL COMMENT 'readonly',
              `created` datetime DEFAULT current_timestamp() COMMENT 'readonly',
              `modified` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'readonly'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

            CREATE TABLE `maincubo` (
              `id` int(11) UNSIGNED NOT NULL COMMENT 'auto',
              `mainid` int(11) UNSIGNED DEFAULT 0 COMMENT 'selectjoin-main.name',
              `cuboid` int(11) UNSIGNED DEFAULT 0 COMMENT 'selectjoin-cubo.name',

            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        ");
    }
    protected function addBranch($parentId, $branch) {
        // Logic to add a branch under the specified parent
                $defaultColumnsCores=[
                "id"=>"INT COMMENT `auto`",
                "sort"=>"INT",
                "img"=>"VARCHAR(150) COMMENT `img-upload`",
                "name"=>"VARCHAR(300)",
                "description"=>"TEXT",
                "created"=>"DATETIME",
                "modified"=>"DATETIME"
                ];
        //give customs from newFormBuild();

    }

    protected function buildPublicTree() {
        // Logic to transform flat data into a nested tree structure
    }
    protected function buildAdminTree() {
        // Logic to transform flat data into a nested tree structure
    }


}
