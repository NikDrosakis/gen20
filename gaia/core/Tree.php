<?php
namespace Core;
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
doc standard to alinks alinksgrp and visible only to TEMPLATE.?grp tables
 */

trait Tree {
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

protected function listMariaTables($tableName): array {
   $db = $tableName['table'];
    // Fetch tables from the specified database

    //$db = explode('.',$table)[0];
    $query = $this->db->show("tables",$db);
    return $query;
}

protected function recognizeDatabases(): array {
    // Get all databases
    $databases = $this->db->show("databases");

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
        $tables[$db] = $this->db->show("tables",$db);
    }

    return [
        'system_databases' => $systemDatabases,
        'potential_databases' => $potentialDatabases,
        'tables' => $tables
    ];
}

protected function insertTablesIntoMetadata($database) {
    // Get the list of tables
    $tables = $this->db->show("tables",$database);
    // Prepare the insert statement

    $insertQuery = "INSERT INTO ${publicdb}.metadata (name, title, description, status) VALUES (?, ?, ?, ?)";
    foreach ($tables as $table) {
        // You might want to set title and description based on your requirements
        $title = ucfirst($table); // Example title (capitalized table name)
        $description = "Description for " . $table; // Example description
        $status = 1; // Example status (set to 1 for active)
        $this->db->q($insertQuery,[$table, $title, $description, $status]);
    }
}
// Output the results
/*  foreach ($foreignKeys as $fk) {
    echo "Child Table: " . $fk['child_table'] . ", Child Column: " . $fk['child_column'] .
         ", Parent Table: " . $fk['parent_table'] . ", Parent Column: " . $fk['parent_column'] . "\n";
         */
protected function getBranches(array $params): ?array {
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

        $res = $this->db->fa($tree);            
		if(!$res) return '';

    return $res;

        } catch (Exception $e) {
            echo "Database error: " . $e->getMessage();
        }
}
// Method to compare the current table schema with the standard schema and return modification lists
protected function compareWithStandard($table) {
    // Retrieve the current schema of the table
    $currentSchema = $this->db->getSchemaTable($table);

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
    // Get the list of modifications
    $compare = $this->compareWithStandard($tableName);

    // If there are no modifications, the table is up-to-date
    if (empty($compare['modificationList'])) {
        echo "Table `$tableName` is already up-to-date.\n";
        return;
    }
    // Loop through each modification and apply the schema changes
    foreach ($compare['modificationList'] as $modification) {
        try {
            // Alter the table by applying each modification
            $this->db->alter($tableName, $modification);
            echo "Modification applied successfully to table `$tableName`: $modification.\n";
        } catch (Exception $e) {
            echo "Error applying modification to table `$tableName`: " . $e->getMessage() . "\n";
        }
    }
}

// Method to generate a report for the table and provide an option to apply the changes
protected function compareWithStandardReport($table): ?array {
    // Ensure database and table are provided
    if ($table) {
        // Get the comparison result
        $compare = $this->compareWithStandard($table);

        // Initialize an array for the report output
        $report = [];

// Report the modification list and provide an apply button
if (!empty($compare['modificationList'])) {
    $report[] = "MODIFICATION LIST for table `$table`:\n" . implode("\n", $compare['modificationList']);
    $report[] = "<button onclick='gs.api.post(\"applySchemaStandards\", { table: \"$table\" })'>Apply</button>";
}

// Report any extra columns (common list)
if (!empty($compare['commonList'])) {
    $report[] = "COMMON LIST for table `$table`". implode("\n", $compare['commonList']);
}

// If no modifications are required
if (empty($compare['modificationList']) && empty($compare['commonList'])) {
    $report[] = "No modifications required for table `$table`";
}

        // Return the report array
        return $report;
    }
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
protected function table(array $assoc): string {
    try {
        if (empty($assoc) || !is_array($assoc)) {
            return 'Input data is empty or not an array.';
        }
        // Start building the HTML table
        $tableHtml = '<div class="table-container">';
        $tableHtml .= '<h2>Generated Table</h2>';
        $tableHtml .= '<table class="styled-table">';

        // Ensure the first element is an array before calling array_keys()
        $firstRow = $assoc[0];

        // Check if the first row is an array, otherwise throw an exception
        if (!is_array($firstRow)) {
           echo 'First row is not an array.';
        }

        // Table header: Use keys of the first row as column names
        $tableHtml .= '<thead><tr>';
        foreach (array_keys($firstRow) as $columnName) {
            $tableHtml .= '<th>' . htmlspecialchars(is_int($columnName) ? "Index $columnName" : $columnName) . '</th>';
        }
        $tableHtml .= '</tr></thead>';

        // Table body: Use values from the associative array
        $tableHtml .= '<tbody>';
        foreach ($assoc as $row) {
            if (!is_array($row)) {
                continue; // Skip non-array rows
            }

            $tableHtml .= '<tr>';
            foreach ($row as $value) {
                $tableHtml .= "<td>" . htmlspecialchars($value) . "</td>";
            }
            $tableHtml .= '</tr>';
        }
        $tableHtml .= '</tbody>';

        // Close the table
        $tableHtml .= '</table></div>';
        return $tableHtml; // Return the HTML table
    } catch (Exception $e) {
        echo "Error generating table: " . $e->getMessage();
        return ''; // Return an empty string if an error occurs
    }
}


protected function buildSchema($table): string {
  // Fetch column information from information_schema
   try {
    $columns = $this->db->tableMeta($table);
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
      } catch (Exception $e) {
            echo "Error retrieving schema for table `$table` in database `$db`: " . $e->getMessage() . "\n";
            return null; // Return null if an error occurs
        }
}

/**
SSL
 */
protected function createMaria($domainame)
{
    $domain = is_array($domainame) ? $domainame['key'] : $domainame;
    $dbfileName = str_replace('.', '', $domain);  // Remove dots from the domain name
    $dbname = "gen_" . $dbfileName;
    $domain_maria_sqlfile = GSROOT . "setup/maria/gen_template_043.sql";

    // Create the MariaDB database
    $createDbCommand = "mysql -uroot -p'your_password' -e 'CREATE DATABASE IF NOT EXISTS " . escapeshellarg($dbname) . ";'";
    $createDbResult = shell_exec($createDbCommand . " 2>&1");

    if ($createDbResult === false) {
        throw new Exception("Failed to create database: $dbname");
    }

    // Import the template SQL file into the new database
    $importCommand = "mysql -uroot -pn130177! $dbname < " . escapeshellarg($domain_maria_sqlfile);
    $output = shell_exec($importCommand . " 2>&1");  // Capture error output

    if ($output === false) {
        throw new Exception("SQL import failed for database: $dbname");
    }

    // Set MariaDB file record
    $maria_file = $domain_maria_sqlfile;

    // Update MariaDB record in the domain table
    $this->db->q(
        "UPDATE gen_admin.domain SET maria = ?, maria_file = ?, maria_check = 1 WHERE name = ?",
        [$dbname, $maria_file, $domain]
    );

    // Check if database update was successful
    if ($output) {
        echo "MariaDB database '$dbname' successfully created and updated for $domain!";

    } else {
        throw new Exception("Failed to import SQL file into the database for $domain.");
    }
}



}