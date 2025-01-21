<?php
/**
Mari is a gen20 implementation of Maria, abstracted from one database to multiple,
contains 3 types of methods:
a) core database create_, alter, show etc
b) helpers fa, fl, f, q, inse
c) dbcentric DESCRIBE comments & metadata in formatted GEn20 tables

*/
namespace Core;
use PDO;
use PDOException;

class Mari {
    public $_db;
    public $dbhost= "localhost";
    public $dbuser = "root";
    public $dbpass = "n130177!";

    // Constructor: Connect to the server without specifying a database
    public function __construct() {
        try {
            // Connect to the server without specifying a database
            $this->_db = new PDO("mysql:host=$this->dbhost", $this->dbuser, $this->dbpass,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_EMULATE_PREPARES => FALSE,
                    PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'",
                    PDO::ATTR_PERSISTENT => true
                ));
        } catch (PDOException $error) {
            if ($error->getCode() == 23000) {
                // Handle duplicate entry error specifically
                echo "Warning: Duplicate entry for 'name'. Please try a different value or update existing one.";
            } else {
                throw new Exception("Database connection failed: " . $error->getMessage());
            }
        }
    }
/**
 A METHODS  core database create_, alter, show

 */

   public function show($expression,$var='') {
        $query = '';
        switch ($expression) {
            case 'databases':
                    $query = 'SHOW DATABASES';
                try {
                    $stmt = $this->_db->query($query);
                    $res = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    return $res;
                } catch (PDOException $e) {
                    // Handle database errors
                    echo "Database error: " . $e->getMessage();
                }
                case 'plugins':
                    $query = 'SHOW PLUGINS';
                try {
                    $stmt = $this->_db->query($query);
                    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    return $res;
                } catch (PDOException $e) {
                    // Handle database errors
                    echo "Database error: " . $e->getMessage();
                }
            case 'triggers':
                $query = "SHOW TRIGGERS FROM $var";
                            try {
                                $stmt = $this->_db->query($query);
                                $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                return $res;
                        } catch (PDOException $e) {
                            // Handle database errors specifically related to PDO
                            echo "Database error: " . $e->getMessage();
                       }
           case 'events':
               $query = "SHOW EVENTS FROM $var";
               try {
                   $stmt = $this->_db->query($query);
                   $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
                   return $res;
               } catch (PDOException $e) {
                   // Handle database errors specifically related to PDO
                   echo "Database error: " . $e->getMessage();
               }
            case 'tables':
                // Optional: Add a specific database name if required
                $query = "SHOW TABLES FROM $var";
                try {
                    $stmt = $this->_db->query($query);
                    $res = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    return $res;
                } catch (PDOException $e) {
                    // Handle database errors
                    echo "Database error: " . $e->getMessage();
                }

                break;
            case 'status':
                $query = 'SHOW STATUS';
                        try {
                            $stmt = $this->_db->query($query);
                            $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            $assoc=[];
                            foreach($res as $key=>$val){
                            $assoc[$val['Variable_name']]=$val['Value'];
                            }
                            return $assoc;
                        } catch (PDOException $e) {
                            // Handle database errors
                            echo "Database error: " . $e->getMessage();
                        }
            case 'variables':
                $query = 'SHOW VARIABLES';
                        try {
                            $stmt = $this->_db->query($query);
                            $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            $assoc=[];
                            foreach($res as $key=>$val){
                            $assoc[$val['Variable_name']]=$val['Value'];
                            }
                            return $assoc;
                        } catch (PDOException $e) {
                            // Handle database errors
                            echo "Database error: " . $e->getMessage();
                        }
            case 'processlist':
                $query = 'SHOW PROCESSLIST';
                        try {
                            $stmt = $this->_db->query($query);
                            $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            return $res;
                        } catch (PDOException $e) {
                            // Handle database errors
                            echo "Database error: " . $e->getMessage();
                        }
            case 'engine':
                $query = 'SHOW ENGINE STATUS';
                    try {
                        $stmt = $this->_db->query($query);
                        $res = $stmt->fetch(PDO::FETCH_ASSOC);
                        return $res;
                    } catch (PDOException $e) {
                        // Handle database errors
                        echo "Database error: " . $e->getMessage();
                    }
        }
    }
/**
 $columnDetails = [
     'COLUMN_NAME' => 'new_column',
     'COLUMN_TYPE' => 'VARCHAR(255)',
     'COLUMN_COMMENT' => 'loc',
     'null' => 'NOT NULL'
 ];
 // Modify the 'description' column in the 'main' table
 $columnDetails = [
     'name' => 'description',
     'type' => 'TEXT',
     'null' => 'NULL'  // Change the 'description' column to allow NULL values
 ];
 $this->alter('main.title', 'add', $columnDetails, 'title');
 $this->alter('main.description', 'modify', $columnDetails);

 // Drop the 'old_column' from the 'main' table
 $columnDetails = [
     'name' => 'old_column',
 ];

 $this->alter('main.old_column', 'drop', $columnDetails);
 */
public function alter($dbdottable, $operation, $columnDetails, $afterColumn = null) {
    // Ensure the $dbdottable is sanitized and in the correct format
    $dbTableParts = explode('.', $dbdottable);
    if (count($dbTableParts) !== 2) {
        throw new InvalidArgumentException("Invalid table format. Expected 'database.table'.");
    }
    $dbName = $dbTableParts[0];
    $tableName = $dbTableParts[1];

    try {
        switch (strtolower($operation)) {
            case 'add':
                // Construct the base SQL for adding a column
                $sql = "ALTER TABLE `$dbName`.`$tableName` ADD COLUMN `{$columnDetails['COLUMN_NAME']}` {$columnDetails['COLUMN_TYPE']}";

                // Include default value if specified
                if (!empty($columnDetails['COLUMN_DEFAULT'])) {
                    $sql .= " DEFAULT {$columnDetails['COLUMN_DEFAULT']}";
                }

                // Include nullability
                $sql .= " " . ($columnDetails['IS_NULLABLE'] === 'NO' ? 'NOT NULL' : 'NULL');

                // Include the comment
                $sql .= " COMMENT '{$columnDetails['COLUMN_COMMENT']}'";

                // Specify the position of the column if afterColumn is provided
                if ($afterColumn) {
                    $sql .= " AFTER `$afterColumn`";
                }
                break;

            case 'modify':
                // Construct the base SQL for modifying a column
                $sql = "ALTER TABLE `$dbName`.`$tableName` MODIFY COLUMN `{$columnDetails['COLUMN_NAME']}` {$columnDetails['COLUMN_TYPE']}";

                // Include default value if specified
                if (!empty($columnDetails['COLUMN_DEFAULT'])) {
                    $sql .= " DEFAULT {$columnDetails['COLUMN_DEFAULT']}";
                }

                // Include nullability
                $sql .= " " . ($columnDetails['IS_NULLABLE'] === 'NO' ? 'NOT NULL' : 'NULL');

                // Include the comment
                $sql .= " COMMENT '{$columnDetails['COLUMN_COMMENT']}'";
                break;

            case 'drop':
                // SQL for dropping a column
                $sql = "ALTER TABLE `$dbName`.`$tableName` DROP COLUMN `{$columnDetails['COLUMN_NAME']}`";
                break;

            default:
                throw new InvalidArgumentException("Unsupported operation: $operation. Supported operations are 'add', 'modify', 'drop'.");
        }

        // Execute the query
        $stmt = $this->_db->query($sql);
        return true;
    } catch (PDOException $e) {
        // Handle database errors using PDOException
        echo "Database error: " . $e->getMessage();
        return false;
    }
}



public function create_db(string $dbname){
	try {
		$this->_db = new PDO("mysql:host=localhost", $this->dbuser, $this->dbpass);
		$this->_db->exec("CREATE DATABASE `$this->dbname`;
				CREATE USER '$this->dbuser'@'localhost' IDENTIFIED BY '$this->dbpass';
				GRANT ALL ON `$this->dbname`.* TO '$this->dbuser'@'localhost';
				FLUSH PRIVILEGES;")
		or die(print_r($this->_db->errorInfo(), true));

	} catch (PDOException $e) {
		die("DB ERROR: ". $e->getMessage());
	}
}
public function create_table($table,$schema) {
    // SQL to create the table
    $sql = "CREATE TABLE `$table` (";
    $sql .= implode(', ', $schema);
    $sql .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

    // Execute the query and handle potential errors
    try {
        $this->_db->exec($sql);
        echo "Table `$table` created successfully.\n";
    } catch (PDOException $e) {
        echo "Error creating table `$table`: " . $e->getMessage() . "\n";
    }
}
public function create_trigger(string $dbname, string $triggerName, string $tableName, string $timing, string $event, string $body) {
        try {
            $this->_db->exec("USE `$this->dbname`");

            $sql = "CREATE TRIGGER `$triggerName`
                    $timing $event ON `$tableName`
                    FOR EACH ROW
                    $body";

            $this->_db->exec($sql);
            echo "Trigger '$triggerName' created successfully.";
        } catch (PDOException $e) {
            die("DB ERROR: " . $e->getMessage());
        }
    }

    public function exec(string $q){
		 return $this->_db->exec($q);
	}

public function getDatabasesInfo() {
    $databases = $this->show('databases');
    $dbInfo = [];

    foreach ($databases as $db) {
        // Skip system databases like information_schema, performance_schema
        if (in_array($db, ['information_schema', 'performance_schema', 'mysql', 'sys'])) {
            continue;
        }

        $query = "SELECT table_schema, SUM(data_length + index_length) AS size,
                  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$db') AS record_count
                  FROM information_schema.tables WHERE table_schema = '$db'";
        $stmt = $this->_db->query($query);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result) {
            $dbInfo[] = [
                'name' => $db,
                'size' => $result['size'],  // in bytes
                'record_count' => $result['record_count']
            ];
        }
    }

    return $dbInfo;
}

/**

 B TYPES OF METHODS - HELPERS & Content Operators CRUD


 */
public function inse(string $table, array $params = []) {
    // Check if the parameters are associative and build the query accordingly
    if (is_assoc($params)) {
        $columns = implode(',', array_keys($params));
        $placeholders = implode(',', array_fill(0, count($params), '?'));
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        $params = array_values($params);  // Extract the values for prepared statement
    } else {
        // For non-associative arrays
        $placeholders = implode(',', array_fill(0, count($params), '?'));
        $sql = "INSERT INTO $table VALUES ($placeholders)";
    }

    // Try executing the query
    try {
        $res = $this->_db->prepare($sql);
        $res->execute($params);

        if ($res) {
            return $this->_db->lastInsertId() ?: true;  // Return the last insert ID or true if no ID
        }
        return false;  // Return false in case of an error
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            echo "Duplicate entry found. Entry was not added.";
        } else {
            echo "Database error occurred: " . $e->getMessage();
        }
    }
}
    /*
    *Query Method replaces standard pdo query method
    Usage: with	INSERT, UPDATE, DELETE queries
    updated $q validation for API flows
    */
    public function q(string $q, array $params = []): bool {
            $res = $this->_db->prepare($q);
            $res->execute($params);
            if (!$res)return FALSE;
            return true;
    }

   public function f(string $q, array $params = []): array|string|bool {
            $res = $this->_db->prepare($q);
            $res->execute($params);
            if (!$res) return FALSE;
            return $res->fetch(PDO::FETCH_ASSOC);
    }
    /*
    *	Fetch MANY result
    *	Updated with memcache
    */
    public function fa(string $q, array $params = array()){
  		$res = $this->_db->prepare($q);
            $res->execute($params);
		if(!$res) return FALSE;
            return $res->fetchAll(PDO::FETCH_ASSOC);
    }

public function fetch(string $q, array $params = [], int $limit = 10, int $currentPage = 1,
    $orderBy="" , // Default order column
    $orderDir="" // Default order direction
): bool|array
{
//    $queryType = strtoupper(strtok(trim($q), ' ')); // Validate the query type
  //  if ($queryType !== 'SELECT' && $queryType !== 'DESCRIBE') {
    //    return false;
    //}
    // Calculate the offset for pagination
    $offset = ($currentPage - 1) * $limit;
    $order ="";
    if ($orderBy!="") {
            $order = " ORDER BY $orderBy $orderDir";
        }
    // Modify the query to include the window function for total count
    $q = "SELECT *, COUNT(*) OVER () AS total FROM ($q) AS subquery $order LIMIT :limit OFFSET :offset";

    // Add `limit` and `offset` to the params array
    $params[':limit'] = $limit;
    $params[':offset'] = $offset;

    // Prepare and execute the statement
    $stmt = $this->_db->prepare($q);
    $stmt->execute($params);

    if (!$stmt) {
        return false;
    }

    // Fetch results
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($results)) {
        return false;
    }

    // Extract total count from the first row
    $totalCount = $results[0]['total'];
    foreach ($results as &$row) {
       unset($row['total']);
    }
    // Return paginated data with metadata
    return [
        'query' => $q,
        'params' => $params,
        'total' => $totalCount,
        'data' => $results,
        'currentPage' => $currentPage,
        'totalPages' => ceil($totalCount / $limit),
    ];
}
 //update of fetchRowList and fetchCoupleList
public function flist(string $query, array $params = []): bool|array {
    $list = [];
    // Execute the query
    $fetch = $this->fa($query,$params);
    if (empty($fetch)) {
        return false; // Return false if no result is found
    }

    // Determine the number of columns in the result
    $firstRow = $fetch[0];
    $columnCount = count($firstRow);

    // Case 1: One column (flat list of values)
    if ($columnCount === 1) {
        foreach ($fetch as $row) {
            $list[] = reset($row); // Get the single column value
        }
    // Case 2: Two columns (key-value pair)
    } elseif ($columnCount === 2) {
        foreach ($fetch as $row) {
            $list[array_values($row)[0]] = array_values($row)[1];
        }
    // Case 3: More than two columns (assume 'id' as key, if exists)
    } else {
        foreach ($fetch as $row) {
            if (isset($row['id'])) {
                $list[$row['id']] = $row; // Use 'id' as the key
            } else {
                $list[] = $row; // Default to numeric indexing
            }
        }
    }

    return $list;
}

public function fl(string|array $rows, string $table, $clause=''): bool|array {
    $list = array();

    // Handle the case where $rows is an array
    if (is_array($rows)) {
        // Fetch couple list
        $row1 = $rows[0];
        $row2 = $rows[1];

        // Modify the SQL query to include the joins and clause correctly
        $fetch = $this->fa("SELECT $row1, $row2 FROM $table $clause");

        if (!empty($fetch)) {
            foreach ($fetch as $row) {
                // Create an associative array with row1 as key and row2 as value
                $list[$row[$row1]] = $row[$row2];
            }
            return $list;
        } else {
            return false;
        }
    } else {
        // Handle the case where $rows is a single string
        $fetch = $this->fa("SELECT $rows FROM $table $clause");

        if (!empty($fetch)) {
            foreach ($fetch as $row) {
                $list[] = $row[$rows];
            }
            return $list;
        } else {
            return false;
        }
    }
}

	public function sort(string $q, array $params=[]):bool {
    $caseStatement = '';
    foreach ($params as $param) {
        $caseStatement .= "WHEN id = {$param[1]} THEN {$param[0]} ";
    }
    // Create the SQL query
    $sql = "
        UPDATE {$this->publicdb}.links
        SET sort = CASE
            $caseStatement
            ELSE sort
        END
        WHERE id IN (" . implode(',', array_column($params, 1)) . ")";
         return $this->q($sql);
    }

    //count_ results
    public function count_(string $rowt, $table, $clause = null, $params = array()): ?int {
            $result = $this->_db->prepare("SELECT COUNT($rowt) FROM $table $clause");
            $result->execute($params);
            if (!$result) return FALSE;
            return $result->fetchColumn();
    }

    //count_ results
    public function counter(string $query = null, $params = array()){
            $result = $this->_db->prepare($query);
            $result->execute($params);
            if (!$result) return FALSE;
            return $result->fetchColumn();
    }

/*
  fUnique SELECT uid,cv.* FROM cv returns [uid]=>array(id=1,title=asdfdsf)
  for cases we want unique id to avoid for loops
  NEW METHOD 2
 * */
    public function  fUnique(string $query): ?array {
        return $this->_db->query($query)->fetchAll(PDO::FETCH_UNIQUE);
    }
    /*
      fGroup SELECT uid,id,title FROM cv returns
      [uid]=>array(
             [0]=>(id=1,title=asdfdsf)
             [1]=>
      good for nested arrays to avoid for loops
      NEW METHOD 3
     * */
    public function  fGroup($query): ?array {
        return $this->_db->query($query)->fetchAll(PDO::FETCH_GROUP);
    }
    public function truncate(string $table){
            $q = $this->_db->exec("TRUNCATE TABLE $table");
    }

/**
C METHODS - FORMATTING SCHEMA


 * Prepare data from DB to be inserted or updated, according to the column format.
 */
public function columns(string $table, bool $list=false): ?array{
    $q = $this->_db->prepare("DESCRIBE $table");
    $q->execute();
    return $list ? $q->fetchAll(PDO::FETCH_COLUMN) : $q->fetchAll(PDO::FETCH_ASSOC);
}
public function getColumnsWithComment(string $db,string $var) {
    try {

        // SQL query with placeholders
        $sql = "
            SELECT TABLE_NAME, COLUMN_NAME,COLUMN_TYPE, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND COLUMN_COMMENT LIKE ?
        ";
        // Prepare the SQL statement
        $stmt = $this->_db->prepare($sql);

        // Execute the statement with parameters (use ? for positional binding)
        $stmt->execute([$db, "%$var"]);

        // Fetch all results
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Return the results
        return $columns;
    } catch (PDOException $e) {
        // Handle the exception and return an error message
        return "Error: " . $e->getMessage();
    }
}
public function prepareColumnFormat(array $record, array $columnsFormat): array {
    foreach ($record as $key => &$value) {
        if (isset($columnsFormat[$key])) {
            $comment = $columnsFormat[$key];

            // Handle file includes (like README.md) for 'includes' field
 if (is_array($value) && array_key_exists('includes', $value)) {
                $filePath = $value['includes'];
                // If the 'includes' key exists and is a valid file, use file_get_contents
                if (file_exists(ROOT.$filePath)) {
                    $value = file_get_contents(ROOT.$filePath);  // Read file content

                } else {
                    echo "File at '$filePath' not found.";
                }
            }

            // If it's a comma-separated field, convert array to string
            elseif (strpos($comment, 'comma') !== false && is_array($value)) {
                $value = implode(',', $value);  // Convert array to comma-separated string
            }

            // If it's a JSON field, convert array to JSON string
            elseif (strpos($comment, 'json') !== false && is_array($value)) {
                $value = json_encode($value);  // Convert array to JSON string
            }
        }
    }
    return $record;
}
/*
pdo update or insert based on name
comment=>format included
* */
public function colFormat($table){
$select=[];
    $tableMeta= $this->tableMeta($table);
        foreach ($tableMeta as $colData) {
            $select[$colData['COLUMN_NAME']] = trim($colData['COLUMN_COMMENT']);
        }
    return $select;
}


public function upsert(string $table, array $record): int|bool {
    // Ensure 'name' key exists in the params
    if (!isset($record['name']) && !isset($record['id'])) {
        echo "'name' or 'id' param required upsert.";
    }
    // Get columns format
    $columnsFormat = $this->colFormat($table);

    // Format the params based on the column comments
    $record = $this->prepareColumnFormat($record, $columnsFormat);

    // Extract the 'name' value for the WHERE clause
    $name = $record['name'];
    unset($record['name']); // Remove 'name' to avoid duplication in insert/update

    // Check if the record with the given name exists
    $checkSql = "SELECT COUNT(*) FROM $table WHERE name = ?";
    $checkStmt = $this->_db->prepare($checkSql);
    $checkStmt->execute([$name]);
    $exists = $checkStmt->fetchColumn() > 0;

    if ($exists) {
        // Prepare an UPDATE statement
        $updateColumns = implode(' = ?, ', array_keys($record)) . ' = ?';
        $updateSql = "UPDATE $table SET $updateColumns WHERE name = ?";
        $updateStmt = $this->_db->prepare($updateSql);

        // Execute the UPDATE statement
        $updateStmt->execute([...array_values($record), $name]);
        return true; // Return true for a successful update
    } else {
        // Prepare an INSERT statement
        $insertColumns = implode(',', array_keys($record));
        $placeholders = implode(',', array_fill(0, count($record), '?'));
        $insertSql = "INSERT INTO $table (name, $insertColumns) VALUES (?, $placeholders)";
        $insertStmt = $this->_db->prepare($insertSql);

        // Execute the INSERT statement
        $insertStmt->execute([$name, ...array_values($record)]);
        return $this->_db->lastInsertId() ?: true;  // Return the last insert ID or true if no ID
    }
}

    public function types($table){
        $sel=array();
        $select = $this ->_db->query("SELECT * FROM $table");
        foreach($this->columns($table) as $colid => $col) {
            $meta= $select->getColumnMeta($colid);
            $sel[$meta['name']] = $meta['native_type'];
        }
        return $sel;
    }

public function tableMeta(string $tableName): ?array {
$exp=explode('.',$tableName);
if(!empty($exp)){
$db = $exp[0];
$table = $exp[1];
        $query = "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA, COLUMN_COMMENT
              FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = ?
              AND TABLE_NAME = ?";
    return $this->fa($query, [$db,$table]);
}}

public function getSchemaTable($tableName): ?array {
    try {
        // Fetch column metadata for the given table
        $columns = $this->tableMeta($tableName);
        $schema = [];

        // Map the column details to a schema definition
        foreach ($columns as $column) {
            $columnName = $column['COLUMN_NAME'];
            $columnType = $column['COLUMN_TYPE'];

            // Check for nullability
            $isNullable = ($column['IS_NULLABLE'] === 'NO') ? 'NOT NULL' : 'NULL';

            // Set default value
            $default = '';
            if ($column['COLUMN_DEFAULT'] !== null) {
                $default = $column['COLUMN_DEFAULT'] === 'NULL' ? 'DEFAULT NULL' : "DEFAULT '{$column['COLUMN_DEFAULT']}'";
            }

            // Set comment if it exists
            $comment = !empty($column['COLUMN_COMMENT']) ? "COMMENT '{$column['COLUMN_COMMENT']}'" : '';

            // Build the column definition string
            $columnDefinition = "$columnType $isNullable $default $comment";
            $schema[$columnName] = trim($columnDefinition); // Trim to avoid extra spaces
        }

        return $schema;
    } catch (PDOException $e) {
        echo "Error retrieving schema for table `$tableName`: " . $e->getMessage() . "\n";
        return null; // Return null if an error occurs
    }
}

public function generateFkReport(string $table, string $column) {
    // SQL query to fetch foreign key constraints
    $query = "
        SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = :table
        AND REFERENCED_COLUMN_NAME = :column";

    try {
        // Prepare and execute the query
        $stmt = $this->_db->prepare($query);
        $stmt->execute([':table' => $table, ':column' => $column]);

        $foreignKeys = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($foreignKeys)) {
            echo "No foreign key constraints found for table `$table` and column `$column`.\n";
            return;
        }

        // Iterate and print the foreign key details
        foreach ($foreignKeys as $fk) {
            echo "Foreign Key Constraint: {$fk['CONSTRAINT_NAME']} in table `{$fk['TABLE_NAME']}` on column `{$fk['COLUMN_NAME']}`\n";
        }
    } catch (PDOException $e) {
        echo "Error generating foreign key report: " . $e->getMessage() . "\n";
    }
}

}