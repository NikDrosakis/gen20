<?php
namespace Core;
use PDO;
use PDOException;

class Mari {
    protected $_db;

    // Constructor: Connect to the server without specifying a database
    public function __construct() {
        $dbhost = "localhost";
        $dbuser = "root";
        $dbpass = "n130177!";
        try {
            // Connect to the server without specifying a database
            $this->_db = new PDO("mysql:host=$dbhost", $dbuser, $dbpass,
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
	 public function listTables():array{
        $query = $this->_db->query('SHOW TABLES');
        return $query->fetchAll(PDO::FETCH_COLUMN);
    }

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
    public function inse(string $table, array $params = array(),$id=NULL): int|bool{
        $qmk = implode(',', array_fill(0, count($params), '?'));
        if (is_assoc($params)) {
            $rows = $k = '(' . implode(',', array_keys($params)) . ')';
            $values = "$rows VALUES ($qmk)";
            $params = array_values($params);
        } else {
            $values = count($params) != count($this->columns($table)) && $id != NULL ? "VALUES ($id,$qmk)" : "VALUES ($qmk)";
        }
        $sql= "INSERT INTO $table $values";
        try {
                $res = $this->_db->prepare($sql);
                $res->execute($params);
                if (!$res){return false;}else{
                return !$this->_db->lastInsertId() ? true: $this->_db->lastInsertId(); //CASE OF CORRECT INSERT BUT WITH NO RETURN VALUE (eg NO ID table)
                }
            } catch (PDOException $e) {
               if ($e->getCode() == 23000) {
                    echo "Duplicate entry found for 'name'. Entry was not added.";
                } else {
                    echo "Database error occurred: " . $e->getMessage();
                }
            }
    }


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
/**
 * Extend and reformat data from DB into appropriate structure (reverses `prepareColumnFormat` logic).
 */
public function extendColumnFormat(array $params, array $columnsFormat): array {


    foreach ($params as $key => &$value) {
        if (isset($columnsFormat[$key])) {
            $comment = $columnsFormat[$key];

            // Handle 'comma' fields - convert comma-separated strings back to arrays
            if (strpos($comment, 'comma') !== false && is_string($value)) {
                $value = explode(',', $value);  // Convert comma-separated string to array
            }

            // Handle 'json' fields - decode JSON string back to array
            elseif (strpos($comment, 'json') !== false && is_string($value)) {
                $value = json_decode($value, true);  // Convert JSON string to array
            }

            // Handle 'includes' fields - if it's a file path, store it as an 'includes' key
            elseif (is_string($value) && file_exists($value)) {
                $value = ['includes' => $value];  // Store file path as an 'includes' key
            }

            // Handle simple string fields - no conversion needed, just ensure it is trimmed
            elseif (is_string($value)) {
                $value = trim($value);  // Remove whitespace from string
            }

            // Handle integer fields - ensure it's an integer
            elseif (is_int($value)) {
                // No transformation needed, just ensure it's an integer (useful for strict types)
                $value = (int)$value;
            }
        }
    }
    return $params;
}

/**
 * Prepare data from DB to be inserted or updated, according to the column format.
 */
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

/*
	api flaw, executes even if I pass update , so it needs validation
	*/
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
    public function fa(string $q, array $params = array()): bool|array    {
           $queryType = strtoupper(strtok(trim($q), ' ')); // Get the first word of the query
        if ($queryType !== 'SELECT' && $queryType !== 'DESCRIBE') {
                   return FALSE;
               }
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

	//setting table
	public function is(string $name): bool|string{
		$fetch = $this->db->f("SELECT val FROM globs WHERE name=?", array($name));
		if (!empty($fetch)) {
			return urldecode($fetch['val']);
		} else {
			return false;
		}
	}
    /*
     *	Fetch MANY result
     *	Updated with memcache
     */
    public function fjsonlist($query){
        $res=$this->fa($query);
		if (!$res) {
			return FALSE;
		}else{
			$tags=array();
			for($i=0;$i<count($res);$i++){
				if($res[$i]['json']!='[]'){
				$jsdecod=json_decode($res[$i]['json'],true);
			if(!empty($jsdecod)){
				foreach($jsdecod as $jsid => $jsval){
					$tags[]=trim($jsval);
						}
			}
					}
			}
		return $tags;
		}
        $res->closeCursor();
    }


 /*
get max value from table
*/
    public function fetchMax(string $row, string $table, $clause = ''): int{
        $selecti = $this->f("SELECT MAX($row) as max FROM $table $clause");
        return $selecti['max'];
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
    /*
     * RETURN TABLE char, varchar, text types
     *
     * */
    public function  char_types($table){
        $res = $this->types($table);
        foreach($res as $col => $type){
            if(in_array($type,array('VAR_STRING','STRING','BLOB'))){
                $cols[] = $col;
            }
        }
        return $cols;
    }

    public function  maria_con(string $dbhost,string $dbname,string $dbuser,string $dbpass){
        try	{
			//mysql:unix_socket=/var/run/mysqld/mysqld.sock;charset=utf8mb4;dbname=$dbname
            return new PDO("mysql:host=$dbhost;dbname=$dbname",$dbuser,$dbpass,
                array(
                    PDO::ATTR_ERRMODE,
                    PDO::ERRMODE_EXCEPTION,
                    PDO::ERRMODE_WARNING,
                    PDO::ATTR_EMULATE_PREPARES => FALSE,
					PDO::MYSQL_ATTR_USE_BUFFERED_QUERY,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'",
                    PDO::ATTR_PERSISTENT => false
                ));

        }	catch(PDOException $error)	{
            return $error->getCode();
        }

    }
	public function  create_db(string $dbname,string $dbhost,string $dbuser,string $dbpass){
	try {
		$this->_db = new PDO("mysql:host=$dbhost", $dbuser, $dbpass);
		$this->_db->exec("CREATE DATABASE `$dbname`;
				CREATE USER '$dbuser'@'localhost' IDENTIFIED BY '$dbpass';
				GRANT ALL ON `$dbname`.* TO '$dbuser'@'localhost';
				FLUSH PRIVILEGES;")
		or die(print_r($this->_db->errorInfo(), true));

	} catch (PDOException $e) {
		die("DB ERROR: ". $e->getMessage());
	}
}
    /*
     * BASIC function
     * f FETCH
     * fa FETCH ALL
     * q QUERY (INSERT AND UPDATE)
     * INS
     * exec
    */
    public function exec(string $q){
		 $s= $this->_db->exec($q);
		 return $s;
	}

	public function sort(string $q, array $params=[]):bool {
    $caseStatement = '';
    foreach ($params as $param) {
        $caseStatement .= "WHEN id = {$param[1]} THEN {$param[0]} ";
    }
    // Create the SQL query
    $sql = "
        UPDATE links
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

    public function columns(string $table, bool $list=false): ?array{
        $q = $this->_db->prepare("DESCRIBE $table");
        $q->execute();
        return $list ? $q->fetchAll(PDO::FETCH_COLUMN) : $q->fetchAll(PDO::FETCH_ASSOC);
    }
    /*
create key->value list with two rows from database
    fPairs to replace fetchCoupleList
    UPDATE WITH PDO::FETCH_KEY_PAIR
    NEW METHOD 1
*/
    public function  fPairs(string $row1, string $row2, string $table, $clause = ''): ?array {
        return $this->_db->query("SELECT $row1,$row2 FROM $table $clause")->fetchAll(PDO::FETCH_KEY_PAIR);
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

    //FAST NEW function   FROM CMS CLASS
    //update of fetchRowList and fetchCoupleList
    public function  fetchList($rows, string $table, $clause=''): ?array {
        $list=array();
        //fetchRowList
        if(is_array($rows)){
            $row1=$rows[0];$row2=$rows[1];
            $fetch=$this->fa("SELECT $row1,$row2 FROM $table $clause");
            if(!empty($fetch)) {
                $row1 = strpos($row1, '.') !== false ? explode('.', $row1)[1] : $row1;
                $row2 = strpos($row2, '.') !== false ? explode('.', $row2)[1] : $row2;
                for ($i = 0; $i < count($fetch); $i++) {
                    $list[$fetch[$i][$row1]] = $fetch[$i][$row2];
                }
            }else{return false;}
            //fetchCoupleList
        }else{
            $fetch=$this->fa("SELECT $rows FROM $table $clause");
            if(!empty($fetch)) {
                for ($i = 0; $i < count($fetch); $i++) {
                    $list[] = $fetch[$i][$rows];
                }
            }else{return false;}
        }
        return $list;
    }

    public function truncate(string $table){
            $q = $this->_db->exec("TRUNCATE TABLE $table");
    }

    public function fetchList1(array $rows): ?array{
        if(is_array($rows)){
            $fetch=$this->fa("SELECT {$rows[0]} FROM {$rows[1]} {$rows[2]}");
            for($i=0;$i<count($fetch);$i++){
                $list[]=strpos($rows[0], '.') !== false	? $fetch[$i][explode('.',$rows[0])[1]] : $fetch[$i][$rows[0]];
            }
        }
        return $list;
    }
       //only for maria
    protected function trigger_list(){
        $triggers = $this->fetchAll("SHOW TRIGGERS");
        $list=array();
        if(!empty($triggers)) {
            for ($i = 0; $i < count($triggers); $i++) {
                $list[] = $triggers[$i]['Trigger'];
            }
        }
        return $list;
      }

  public function form(array $form, array $params=[]): int|false {
          // 1. Get table name from form data
          $table = $form['table'] ?? '';
          if (empty($table)) {
              error_log("Error: Missing 'table' parameter in form data.");
              return false;
          }
          // 2. Remove the 'table' element from the data to be inserted
          unset($form['table']);
          unset($form['a']);
        //  $sanitizedForm = $this->sanitizeFormData($form);
          return $this->inse($table,$form);
      }

       private function sanitizeFormData(array $form): array {
              $sanitizedData = [];
              foreach ($form as $key => $value) {
                  // Example: basic string sanitization (adapt as needed for your data types)
                  $sanitizedData[$key] = htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8');
              }
              return $sanitizedData;
          }

}
?>